import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import crypto from 'crypto';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

dotenv.config();

declare global {
  namespace Express {
    interface Request { auth?: { userId: string; role: string }; }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in .env');

function signToken(user: { id: string; role: string }) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET!, { expiresIn: '7d' });
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const p = jwt.verify(token, JWT_SECRET!) as { sub: string; role: string };
    req.auth = { userId: p.sub, role: p.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role))
      return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

function canAccessUser(req: Request, userId: string, ...roles: string[]) {
  return req.auth?.userId === userId || roles.includes(req.auth?.role || '');
}

const wrap = (fn: RequestHandler): RequestHandler => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }
});

app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));

// ─── OTP Authentication ───────────────────────────────────────────────

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

// Send OTP to phone number
app.post('/api/auth/send-otp', otpLimiter, async (req, res) => {
  try {
    const { phone, role } = req.body;

    if (!phone || !role) {
      return res.status(400).json({ error: 'Phone number and role are required' });
    }

    // Clean phone number — remove spaces, country code prefix
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    // Delete any existing unused OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: { phone: cleanPhone, verified: false }
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    await prisma.otpVerification.create({
      data: {
        phone: cleanPhone,
        otp,
        role,
        expiresAt,
      }
    });

    // Try to send OTP via Fast2SMS
    let smsSent = false;
    
    if (FAST2SMS_API_KEY) {
      try {
        const smsMessage = `Your RentApp OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`;
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': FAST2SMS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: smsMessage,
            flash: 0,
            numbers: cleanPhone,
          }),
        });
        
        const result = await response.json();

        if (result.return === true) {
          smsSent = true;
          console.log(`✅ OTP sent via SMS to ${cleanPhone}`);
        } else {
          console.log(`⚠️ Fast2SMS failed: ${JSON.stringify(result.message)} — using Dev Mode`);
        }
      } catch (smsError) {
        console.log(`⚠️ SMS sending failed — using Dev Mode`);
      }
    }

    if (smsSent) {
      // Real SMS was sent
      res.json({ success: true, message: 'OTP sent successfully via SMS', devMode: false });
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔧 DEV MODE — OTP for ${cleanPhone}: ${otp}`);
        return res.json({ success: true, message: 'OTP generated (Dev Mode)', devMode: true, devOtp: otp });
      }
      // In production, if SMS failed, do NOT reveal the code
      return res.status(502).json({ error: 'Could not send OTP. Please try again.' });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// Verify OTP and login/register user
app.post('/api/auth/verify-otp', otpLimiter, async (req, res) => {
  try {
    const { phone, otp, role } = req.body;

    if (!phone || !otp || !role) {
      return res.status(400).json({ error: 'Phone, OTP, and role are required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    // Find the latest unverified OTP for this phone
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: cleanPhone,
        verified: false,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP match
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    const safeRole = role === 'owner' ? 'owner' : 'customer'; // never 'admin' from the client
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone }
    });

    if (!user) {
      // Create new user with phone number
      user = await prisma.user.create({
        data: {
          name: `User ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          role: safeRole,
        }
      });
      console.log(`✅ New user created: ${user.id} (${cleanPhone})`);
    }

    // Clean up old OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: { phone: cleanPhone, verified: true }
    });

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

function formatUser(user: any) {
  if (!user) return user;
  
  // Safe helper to parse JSON if string, or return as is
  const parseSafe = (val: any) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return null;
      }
    }
    return val;
  };

  return {
    ...user,
    checklistTenant: parseSafe(user.checklistTenant),
    checklistOwner: parseSafe(user.checklistOwner),
    splitRent: parseSafe(user.splitRent)
  };
}

// ─── Users & Tenants ──────────────────────────────────────────────────

app.get('/api/users', requireAuth, wrap(async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users.map(formatUser));
}));

app.get('/api/tenants', requireAuth, wrap(async (req, res) => {
  const tenants = await prisma.user.findMany({
    where: { role: 'customer' }
  });
  res.json(tenants.map(formatUser));
}));

app.get('/api/tenants/:id', requireAuth, wrap(async (req, res) => {
  if (req.auth!.userId !== req.params.id && !['owner', 'admin'].includes(req.auth!.role))
    return res.status(403).json({ error: 'Forbidden' });
  const tenant = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      documents: true,
      maintenance: true,
      electricity: true,
      payments: true,
      agreement: true,
    }
  });
  res.json(formatUser(tenant));
}));

app.post('/api/users', requireAuth, wrap(async (req, res) => {
  if (req.auth!.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, email, phone, role } = req.body;
  const user = await prisma.user.create({
    data: { name, email, phone, role }
  });
  res.json(formatUser(user));
}));

// ─── Properties ───────────────────────────────────────────────────────

app.get('/api/properties', requireAuth, wrap(async (req, res) => {
  const properties = await prisma.property.findMany();
  res.json(properties);
}));

const propertyInput = z.object({
  title: z.string().max(200),
  image: z.string().max(500),
  price: z.string().max(50),
  location: z.string().max(200),
  beds: z.number().int().min(0).max(50),
  baths: z.number().int().min(0).max(50),
  type: z.string().max(50),
  houseRules: z.string().optional(),
  nearbyPlaces: z.string().optional(),
  safetyCctv: z.boolean().optional(),
  safetySecurityGuard: z.boolean().optional(),
  safetyGated: z.boolean().optional(),
  safetyFire: z.boolean().optional(),
  safetyLighting: z.boolean().optional(),
  responseTime: z.string().optional(),
  visitDate: z.string().optional(),
  visitTime: z.string().optional(),
  furnishedStatus: z.string().optional(),
  status: z.string().optional()
});

app.post('/api/properties', requireAuth, requireRole('owner'), wrap(async (req, res) => {
  const parsed = propertyInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const property = await prisma.property.create({
    data: { ...parsed.data, ownerId: req.auth!.userId }
  });
  res.json(property);
}));

app.get('/api/owner/:ownerId/properties', requireAuth, wrap(async (req, res) => {
  const { ownerId } = req.params;
  if (!canAccessUser(req, ownerId, 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const properties = await prisma.property.findMany({
    where: { ownerId },
    include: { tenant: true }
  });
  res.json(properties);
}));

app.delete('/api/properties/:id', requireAuth, wrap(async (req, res) => {
  const { id } = req.params;
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return res.status(404).json({ error: 'Property not found' });
  if (!canAccessUser(req, property.ownerId || '', 'admin')) return res.status(403).json({ error: 'Forbidden' });

  await prisma.user.updateMany({ where: { propertyId: id }, data: { propertyId: null } });
  await prisma.bookingRequest.deleteMany({ where: { propertyId: id } });
  await prisma.property.delete({ where: { id } });
  res.json({ success: true, message: 'Property deleted successfully' });
}));

// ─── Booking Requests ──────────────────────────────────────────────────

app.post('/api/bookings', requireAuth, wrap(async (req, res) => {
  const { propertyId, customerId } = req.body;
  if (!propertyId || !customerId) return res.status(400).json({ error: 'propertyId and customerId are required' });
  if (!canAccessUser(req, customerId, 'owner', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const booking = await prisma.bookingRequest.create({
    data: { propertyId, customerId, status: 'Pending' },
    include: { property: true, customer: true }
  });
  if (booking.property.ownerId) io.to(String(booking.property.ownerId)).emit('new-booking-request', booking);
  res.json(booking);
}));

app.get('/api/owner/:ownerId/bookings', requireAuth, wrap(async (req, res) => {
  if (!canAccessUser(req, req.params.ownerId, 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const bookings = await prisma.bookingRequest.findMany({
    where: { property: { ownerId: req.params.ownerId } },
    include: { property: true, customer: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(bookings);
}));

app.get('/api/customer/:customerId/bookings', requireAuth, wrap(async (req, res) => {
  const { customerId } = req.params;
  if (!canAccessUser(req, customerId, 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const bookings = await prisma.bookingRequest.findMany({
    where: { customerId },
    include: { property: true, customer: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(bookings);
}));

app.put('/api/bookings/:id', requireAuth, wrap(async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  const existing = await prisma.bookingRequest.findUnique({ where: { id: req.params.id }, include: { property: true } });
  if (!existing) return res.status(404).json({ error: 'Booking not found' });
  if (!canAccessUser(req, existing.property.ownerId || '', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const booking = await prisma.bookingRequest.update({
    where: { id: req.params.id },
    data: { status },
    include: { property: true, customer: true }
  });
  io.to(String(booking.customerId)).emit('booking-status-updated', booking);
  res.json(booking);
}));

// ─── Tenant Records ──────────────────────────────────────────────────

app.get('/api/tenants/:id/maintenance', requireAuth, wrap(async (req, res) => {
  if (!canAccessUser(req, req.params.id, 'owner', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const records = await prisma.tenantMaintenance.findMany({
    where: { tenantId: req.params.id }
  });
  res.json(records);
}));

const maintenanceInput = z.object({
  type: z.string().max(100),
  description: z.string().max(1000).optional(),
  date: z.string().optional(),
  status: z.string().optional()
});

app.post('/api/tenants/:id/maintenance', requireAuth, wrap(async (req, res) => {
  if (req.auth!.userId !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const parsed = maintenanceInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const dataToCreate: any = { ...parsed.data, tenantId: req.params.id };
  if (dataToCreate.status === undefined) delete dataToCreate.status;
  if (dataToCreate.date === undefined) delete dataToCreate.date;
  if (dataToCreate.description === undefined) delete dataToCreate.description;

  const record = await prisma.tenantMaintenance.create({
    data: dataToCreate
  });
  res.json(record);
}));

app.get('/api/tenants/:id/electricity', requireAuth, wrap(async (req, res) => {
  if (!canAccessUser(req, req.params.id, 'owner', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const records = await prisma.tenantElectricity.findMany({
    where: { tenantId: req.params.id }
  });
  res.json(records);
}));

app.get('/api/tenants/:id/payments', requireAuth, wrap(async (req, res) => {
  if (!canAccessUser(req, req.params.id, 'owner', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const records = await prisma.tenantPayment.findMany({
    where: { tenantId: req.params.id }
  });
  res.json(records);
}));

app.get('/api/tenants/:id/documents', requireAuth, wrap(async (req, res) => {
  if (!canAccessUser(req, req.params.id, 'owner', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const records = await prisma.tenantDocument.findMany({
    where: { tenantId: req.params.id }
  });
  res.json(records);
}));

// Seed an initial dummy property just for UI display
if (process.env.NODE_ENV !== 'production') {
app.post('/api/seed', async (req, res) => {
  try {
    const owner = await prisma.user.create({
      data: {
        name: "Mock Owner",
        email: "owner@example.com",
        role: "owner"
      }
    });

    const prop = await prisma.property.create({
      data: {
        title: "Sunset Villa",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        price: "$2,500/mo",
        location: "123 Ocean Blvd",
        beds: 3,
        baths: 2,
        type: "House",
        ownerId: owner.id,
        houseRules: "No Smoking, No Pets, Quiet Hours after 10 PM, Gated Parking, Visitor Check-in Required",
        nearbyPlaces: "Grocery Store (0.3km), Apex Hospital (1.2km), pharmacy (0.2km), ATM (0.1km), Bus Stop (0.4km), Metro Station (0.6km), Gym (0.5km), School (1.0km)",
        safetyCctv: true,
        safetySecurityGuard: true,
        safetyGated: true,
        safetyFire: true,
        safetyLighting: true,
        responseTime: "Replies within 10 minutes",
        visitDate: "2026-07-20",
        visitTime: "10:30 AM"
      }
    });

    const tenant = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 98765 43210",
        role: "tenant",
        propertyId: prop.id,
        documents: {
          create: [
            { name: "Aadhaar Card", status: "Verified", date: "2024-01-15" }
          ]
        },
        electricity: {
          create: [
            { month: "March 2024", amount: "₹1,250", status: "Unpaid" },
            { month: "February 2024", amount: "₹1,100", status: "Paid" }
          ]
        },
        payments: {
          create: [
            { date: "2024-04-01", amount: "₹25,000", type: "Rent" },
            { date: "2024-03-01", amount: "₹25,000", type: "Rent" }
          ]
        },
        maintenance: {
          create: [
            { type: "Plumbing", status: "Reported", date: "2024-04-10", description: "Leaking faucet" }
          ]
        }
      }
    });
    
    res.json({ message: "Seeded successfully", property: prop, tenant: formatUser(tenant) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
}

// ─── Socket.io Connection Logic ───────────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const p = jwt.verify(token, JWT_SECRET!) as { sub: string };
    (socket as any).userId = p.sub;
    next();
  } catch { next(new Error('unauthorized')); }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;
  socket.join(String(userId));
  console.log(`⚡ User connected: ${userId} joined room ${userId}`);

  socket.on('send-message', async (data) => {
    try {
      const { text, receiverId } = data;
      const senderId = userId; // from token — client can no longer impersonate
      const message = await prisma.message.create({
        data: { text, senderId, receiverId }
      });
      io.to(receiverId).emit('new-message', message);
      io.to(senderId).emit('new-message', message);
      console.log(`💬 Message sent from ${senderId} to ${receiverId}: ${text}`);
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${userId}`);
  });
});

// ─── Chat APIs ────────────────────────────────────────────────────────
app.get('/api/chat', requireAuth, wrap(async (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2) return res.status(400).json({ error: 'user1 and user2 query parameters are required' });
  if (req.auth!.userId !== String(user1) && req.auth!.userId !== String(user2))
    return res.status(403).json({ error: 'Forbidden' });
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: String(user1), receiverId: String(user2) },
        { senderId: String(user2), receiverId: String(user1) }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
  res.json(messages);
}));

app.post('/api/chat', requireAuth, wrap(async (req, res) => {
  const { text, senderId, receiverId } = req.body;
  if (!text || !senderId || !receiverId) return res.status(400).json({ error: 'text, senderId, and receiverId are required' });
  if (req.auth!.userId !== senderId) return res.status(403).json({ error: 'Forbidden' });
  const message = await prisma.message.create({ data: { text, senderId, receiverId } });
  io.to(receiverId).emit('new-message', message);
  io.to(senderId).emit('new-message', message);
  res.json(message);
}));

// ─── Maintenance Update API ───────────────────────────────────────────
app.put('/api/maintenance/:id', requireAuth, wrap(async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  const existing = await prisma.tenantMaintenance.findUnique({
    where: { id: req.params.id },
    include: { tenant: { include: { rentedProperty: true } } }
  });
  if (!existing) return res.status(404).json({ error: 'Maintenance request not found' });
  const isOwner = existing.tenant.rentedProperty?.ownerId === req.auth!.userId;
  if (req.auth!.role !== 'admin' && !isOwner) return res.status(403).json({ error: 'Forbidden' });
  const record = await prisma.tenantMaintenance.update({ where: { id: req.params.id }, data: { status } });
  io.emit('maintenance-update', { id: record.id, tenantId: record.tenantId, status: record.status, type: record.type });
  res.json(record);
}));

// ─── Broadcast API ───────────────────────────────────────────────────
app.post('/api/broadcast', requireAuth, wrap(async (req, res) => {
  try {
    const { text, title } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }
    const broadcastPayload = {
      id: Math.random().toString(),
      title: title || 'Broadcast from Owner',
      text,
      date: new Date().toLocaleDateString()
    };
    io.emit('new-broadcast', broadcastPayload);
    res.json({ success: true, broadcast: broadcastPayload });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

// ─── AI Integrations ─────────────────────────────────────────────────
app.post('/api/ai/description', requireAuth, wrap(async (req, res) => {
  const { title, beds, type, location, furnishedStatus, amenities } = req.body;
  const description = `This premium ${furnishedStatus || 'unfurnished'} ${beds} BHK ${type || 'apartment'} is located in the sought-after neighborhood of ${location || 'NYC'}. Key features include: ${amenities || 'spacious design, parking, high ceilings'}. Ideal for families or working professionals seeking a comfortable home.`;
  res.json({ description });
}));

app.post('/api/ai/search', requireAuth, wrap(async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.json([]);
    
    // Rule-based NLP search matching beds, budget, furnishing status, type
    const queryLower = query.toLowerCase();
    const bedsMatch = queryLower.match(/(\d)\s*bhk/);
    const rentMatch = queryLower.match(/(?:under|below|around|₹|rs\.?)\s*(\d+[\d,]*)/);
    
    let bedsFilter = undefined;
    if (bedsMatch) bedsFilter = parseInt(bedsMatch[1]);
    
    let priceFilter = undefined;
    if (rentMatch) {
      priceFilter = parseInt(rentMatch[1].replace(/,/g, ''));
    }
    
    let furnishedFilter = undefined;
    if (queryLower.includes('furnished') || queryLower.includes('semi-furnished')) {
      furnishedFilter = queryLower.includes('semi-furnished') ? 'Semi-Furnished' : 'Fully Furnished';
    } else if (queryLower.includes('unfurnished')) {
      furnishedFilter = 'Unfurnished';
    }
    
    const properties = await prisma.property.findMany();
    const filtered = properties.filter(p => {
      // Parse rent value (e.g. "₹15,000/mo" -> 15000)
      const numPrice = parseInt(p.price.replace(/[^\d]/g, '')) || 0;
      
      if (bedsFilter && p.beds !== bedsFilter) return false;
      if (priceFilter && numPrice > priceFilter) return false;
      if (furnishedFilter && p.furnishedStatus !== furnishedFilter) return false;
      
      return true;
    });
    
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

app.post('/api/ai/faq', (req, res) => {
  const { question } = req.body;
  const q = (question || '').toLowerCase();
  let answer = "I'm sorry, I don't have the answer to that question. You can contact our support team at support@rentapp.com.";
  
  if (q.includes('pay') && q.includes('rent')) {
    answer = "To pay rent, log in to your tenant dashboard, click 'Pay Rent', enter the billing details, and choose your preferred payment method (UPI, net banking, or card).";
  } else if (q.includes('deposit') || q.includes('refund')) {
    answer = "The security deposit is refunded within 7 working days after move-out verification, key handover, and inventory checklist audit.";
  } else if (q.includes('agreement') || q.includes('renew')) {
    answer = "Agreements are generated automatically and signed digitally. You will receive an automated renewal alert 30 days before expiration.";
  } else if (q.includes('maintenance') || q.includes('complaint')) {
    answer = "You can raise a maintenance complaint from your dashboard. Select the issue type, upload optional photos, and track the status in real time.";
  }
  
  res.json({ answer });
});

// ─── Payment Gateway Integration (Razorpay Mock) ──────────────────────
app.post('/api/payments/pay', requireAuth, wrap(async (req, res) => {
  const { tenantId, amount, type } = req.body;
  if (!tenantId || !amount || !type) return res.status(400).json({ error: 'tenantId, amount, and type are required' });
  if (!canAccessUser(req, tenantId, 'owner', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return res.status(400).json({ error: 'amount must be a positive number' });
  const payment = await prisma.tenantPayment.create({
    data: {
      date: new Date().toLocaleDateString(),
      amount: `₹${numericAmount}`,
      type,
      status: 'Paid',
      tenantId
    }
  });
  res.json({ success: true, payment, receiptUrl: `/receipts/${payment.id}.pdf` });
}));

// ─── Favorites Management ───────────────────────────────────────────
app.post('/api/users/:id/favorites', requireAuth, wrap(async (req, res) => {
  const { id } = req.params;
  const { propertyId } = req.body;
  if (!propertyId) return res.status(400).json({ error: 'propertyId is required' });
  if (!canAccessUser(req, id, 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  let saved = user.savedProperties ? user.savedProperties.split(',').filter(Boolean) : [];
  saved = saved.includes(propertyId) ? saved.filter(p => p !== propertyId) : [...saved, propertyId];
  const updatedUser = await prisma.user.update({ where: { id }, data: { savedProperties: saved.join(',') } });
  res.json({ success: true, savedProperties: updatedUser.savedProperties });
}));

// ─── Checklist Management ───────────────────────────────────────────
app.put('/api/users/:id/checklist', requireAuth, wrap(async (req, res) => {
  try {
    const { id } = req.params;
    const { role, checklist } = req.body; // role: 'tenant' | 'owner', checklist: JSON object
    if (!canAccessUser(req, id, 'admin')) return res.status(403).json({ error: 'Forbidden' });
    
    const data: any = {};
    if (role === 'owner') {
      data.checklistOwner = JSON.stringify(checklist);
    } else {
      data.checklistTenant = JSON.stringify(checklist);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });
    
    res.json({ 
      success: true, 
      checklistTenant: updatedUser.checklistTenant ? JSON.parse(updatedUser.checklistTenant) : null,
      checklistOwner: updatedUser.checklistOwner ? JSON.parse(updatedUser.checklistOwner) : null 
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

// ─── Split Rent Management ───────────────────────────────────────────
app.put('/api/users/:id/split-rent', requireAuth, wrap(async (req, res) => {
  try {
    const { id } = req.params;
    const { splitRent } = req.body; // JSON object/array
    if (!canAccessUser(req, id, 'admin')) return res.status(403).json({ error: 'Forbidden' });
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { splitRent: JSON.stringify(splitRent) }
    });
    
    res.json({ 
      success: true, 
      splitRent: updatedUser.splitRent ? JSON.parse(updatedUser.splitRent) : null 
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

// ─── Visitor Management ──────────────────────────────────────────────
app.post('/api/visitors', requireAuth, wrap(async (req, res) => {
  const { name, phone, tenantId } = req.body;
  if (!name || !phone || !tenantId) return res.status(400).json({ error: 'name, phone, and tenantId are required' });
  if (!canAccessUser(req, tenantId, 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const visitor = await prisma.visitor.create({
    data: { name, phone, qrCode: `VISITOR-${crypto.randomInt(100000, 1000000)}`, status: 'Invited', tenantId }
  });
  res.json(visitor);
}));

app.get('/api/visitors/tenant/:tenantId', requireAuth, wrap(async (req, res) => {
  if (!canAccessUser(req, req.params.tenantId, 'owner', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  const visitors = await prisma.visitor.findMany({ where: { tenantId: req.params.tenantId }, orderBy: { id: 'desc' } });
  res.json(visitors);
}));

app.put('/api/visitors/:id/scan', requireAuth, wrap(async (req, res) => {
  const visitor = await prisma.visitor.findUnique({ where: { id: req.params.id } });
  if (!visitor) return res.status(404).json({ error: 'Visitor not found' });
  if (req.auth!.role === 'owner') {
    const tenant = await prisma.user.findUnique({ where: { id: visitor.tenantId }, include: { rentedProperty: true } });
    if (tenant?.rentedProperty?.ownerId !== req.auth!.userId) return res.status(403).json({ error: 'Forbidden' });
  } else if (!canAccessUser(req, visitor.tenantId, 'admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  let newStatus = 'Entered';
  let entryTime = visitor.entryTime;
  let exitTime = visitor.exitTime;
  if (visitor.status === 'Invited') {
    entryTime = new Date();
  } else if (visitor.status === 'Entered') {
    newStatus = 'Exited';
    exitTime = new Date();
  }
  const updated = await prisma.visitor.update({
    where: { id: visitor.id },
    data: { status: newStatus, entryTime, exitTime }
  });
  res.json(updated);
}));

// ─── Inventory Management ─────────────────────────────────────────────
app.get('/api/properties/:id/inventory', requireAuth, wrap(async (req, res) => {
  const property = await prisma.property.findUnique({ where: { id: req.params.id } });
  if (!property) return res.status(404).json({ error: 'Property not found' });
  const tenant = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { propertyId: true } });
  if (!canAccessUser(req, property.ownerId || '', 'admin') && tenant?.propertyId !== property.id)
    return res.status(403).json({ error: 'Forbidden' });
  res.json(await prisma.inventoryItem.findMany({ where: { propertyId: req.params.id } }));
}));

app.post('/api/properties/:id/inventory', requireAuth, wrap(async (req, res) => {
  const property = await prisma.property.findUnique({ where: { id: req.params.id } });
  if (!property) return res.status(404).json({ error: 'Property not found' });
  if (!canAccessUser(req, property.ownerId || '')) return res.status(403).json({ error: 'Forbidden' });
  const { name, status } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const item = await prisma.inventoryItem.create({
    data: { name, status: status || 'Good', acknowledgedByOwner: true, propertyId: req.params.id }
  });
  res.json(item);
}));

app.put('/api/inventory/:id/acknowledge', requireAuth, wrap(async (req, res) => {
  const { role } = req.body;
  if (role !== 'owner' && role !== 'tenant') return res.status(400).json({ error: 'role must be owner or tenant' });
  const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.id }, include: { property: true } });
  if (!item) return res.status(404).json({ error: 'Inventory item not found' });
  if (role === 'owner') {
    if (!canAccessUser(req, item.property.ownerId || '', 'admin')) return res.status(403).json({ error: 'Forbidden' });
  } else {
    const tenant = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!tenant || tenant.propertyId !== item.propertyId) return res.status(403).json({ error: 'Forbidden' });
  }
  const data = role === 'owner' ? { acknowledgedByOwner: true } : { acknowledgedByTenant: true };
  res.json(await prisma.inventoryItem.update({ where: { id: item.id }, data }));
}));

// ─── Reviews & Ratings ────────────────────────────────────────────────
app.post('/api/reviews', requireAuth, wrap(async (req, res) => {
  try {
    const { rating, comment, authorId, targetId, targetType } = req.body;
    const review = await prisma.review.create({
      data: { rating, comment, authorId, targetId, targetType }
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

app.get('/api/reviews/:targetId', requireAuth, wrap(async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { targetId: req.params.targetId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

// ─── Owner Dashboard Stats ────────────────────────────────────────────
app.get('/api/owner/:ownerId/dashboard-stats', requireAuth, wrap(async (req, res) => {
  try {
    const { ownerId } = req.params;
    if (!canAccessUser(req, ownerId, 'admin')) return res.status(403).json({ error: 'Forbidden' });
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: { tenant: true, bookingRequests: true }
    });
    
    const totalProperties = properties.length;
    const activeListings = properties.filter(p => p.status === 'Available').length;
    const occupiedProperties = properties.filter(p => p.status === 'Occupied').length;
    const vacantProperties = properties.filter(p => p.status === 'Available' || p.status === 'Reserved').length;
    
    // Income calculation
    let monthlyIncome = 0;
    properties.forEach(p => {
      if (p.status === 'Occupied' || p.status === 'Reserved') {
        const val = parseInt(p.price.replace(/[^\d]/g, '')) || 0;
        monthlyIncome += val;
      }
    });
    
    // Maintenance queries
    const maintenanceReqs = await prisma.tenantMaintenance.count({
      where: {
        tenant: {
          rentedProperty: { ownerId }
        },
        status: { in: ['Open', 'Assigned', 'In Progress'] }
      }
    });
    
    // Booking requests
    const bookingReqsCount = await prisma.bookingRequest.count({
      where: {
        property: { ownerId },
        status: 'Pending'
      }
    });
    
    res.json({
      totalProperties,
      activeListings,
      occupiedProperties,
      vacantProperties,
      monthlyIncome: `₹${monthlyIncome.toLocaleString()}`,
      pendingRent: '₹0',
      upcomingRenewals: 1,
      maintenanceRequests: maintenanceReqs,
      propertyViews: totalProperties * 42 + 18,
      bookingRequests: bookingReqsCount,
      charts: {
        incomeHistory: [monthlyIncome * 0.9, monthlyIncome * 0.95, monthlyIncome],
        occupancyHistory: [occupiedProperties - 1 > 0 ? occupiedProperties - 1 : 0, occupiedProperties],
        collectionHistory: [100, 95, 100]
      }
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

// ─── Digital Agreement SIGN ──────────────────────────────────────────
app.post('/api/agreement', requireAuth, wrap(async (req, res) => {
  try {
    const { tenantId, rent, deposit, terms, duration } = req.body;
    if (!tenantId || !canAccessUser(req, tenantId, 'owner', 'admin')) return res.status(403).json({ error: 'Forbidden' });
    const dateStr = new Date().toLocaleDateString();
    
    // Delete any existing agreement to avoid unique constraint error
    await prisma.tenantAgreement.deleteMany({
      where: { tenantId }
    });

    const start = new Date();
    const end = new Date();
    end.setMonth(start.getMonth() + (duration || 11));

    const agreement = await prisma.tenantAgreement.create({
      data: {
        renewalDate: end.toLocaleDateString(),
        signedDate: dateStr,
        status: 'Draft',
        terms,
        duration: duration || 11,
        rent,
        deposit,
        tenantId
      }
    });
    res.json(agreement);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

app.put('/api/agreement/:id/sign', requireAuth, wrap(async (req, res) => {
  try {
    const { signature, role } = req.body; // role: 'owner' | 'tenant'
    if (!signature || (role !== 'owner' && role !== 'tenant')) return res.status(400).json({ error: 'signature and valid role are required' });
    const data: any = {};
    if (role === 'owner') {
      data.ownerSignature = signature;
    } else {
      data.tenantSignature = signature;
    }
    
    // If both signatures present, mark status as Active
    const agreement = await prisma.tenantAgreement.findUnique({ where: { id: req.params.id } });
    if (!agreement) return res.status(404).json({ error: 'Agreement not found' });
    const tenant = await prisma.user.findUnique({ where: { id: agreement.tenantId }, select: { propertyId: true } });
    const property = tenant?.propertyId ? await prisma.property.findUnique({ where: { id: tenant.propertyId }, select: { ownerId: true } }) : null;
    const allowed = role === 'tenant'
      ? req.auth!.userId === agreement.tenantId
      : canAccessUser(req, property?.ownerId || '', 'admin');
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    if (agreement) {
      const isOwnerSigned = role === 'owner' ? !!signature : !!agreement.ownerSignature;
      const isTenantSigned = role === 'tenant' ? !!signature : !!agreement.tenantSignature;
      if (isOwnerSigned && isTenantSigned) {
        data.status = 'Active';
      } else {
        data.status = 'Partially Signed';
      }
    }
    
    const updated = await prisma.tenantAgreement.update({
      where: { id: req.params.id },
      data
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

// ─── Admin Console APIs ──────────────────────────────────────────────
app.get('/api/admin/stats', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  try {
    const usersCount = await prisma.user.count({ where: { role: 'customer' } });
    const ownersCount = await prisma.user.count({ where: { role: 'owner' } });
    const propertiesCount = await prisma.property.count();
    const payments = await prisma.tenantPayment.findMany();
    
    let totalRevenue = 0;
    payments.forEach(p => {
      totalRevenue += parseInt(p.amount.replace(/[^\d]/g, '')) || 0;
    });
    
    res.json({
      totalUsers: usersCount + ownersCount + 1,
      totalTenants: usersCount,
      totalOwners: ownersCount,
      totalProperties: propertiesCount,
      totalRevenue: `₹${totalRevenue.toLocaleString()}`
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

app.get('/api/admin/users', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users.map(formatUser));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

app.put('/api/admin/users/:id/block', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked }
    });
    res.json(formatUser(updated));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

app.post('/api/auth/profile/password', requireAuth, wrap(async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}));

// Serve frontend statically in production
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('unhandledRejection', (e) => console.error('unhandledRejection', e));
process.on('uncaughtException', (e) => console.error('uncaughtException', e));

app.use(express.static(path.join(__dirname, '../../web-app/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../web-app/dist/index.html'));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
