import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// ─── OTP Authentication ───────────────────────────────────────────────

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to phone number
app.post('/api/auth/send-otp', async (req, res) => {
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
      // Dev mode — return OTP in response for on-screen display
      console.log(`🔧 DEV MODE — OTP for ${cleanPhone}: ${otp}`);
      res.json({ 
        success: true, 
        message: 'OTP generated (Dev Mode)', 
        devMode: true, 
        devOtp: otp 
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// Verify OTP and login/register user
app.post('/api/auth/verify-otp', async (req, res) => {
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
          role: role,
        }
      });
      console.log(`✅ New user created: ${user.id} (${cleanPhone})`);
    }

    // Clean up old OTPs for this phone
    await prisma.otpVerification.deleteMany({
      where: { phone: cleanPhone, verified: true }
    });

    res.json({
      success: true,
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

// ─── Users & Tenants ──────────────────────────────────────────────────

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/api/tenants', async (req, res) => {
  const tenants = await prisma.user.findMany({
    where: { role: 'tenant' }
  });
  res.json(tenants);
});

app.get('/api/tenants/:id', async (req, res) => {
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
  res.json(tenant);
});

app.post('/api/users', async (req, res) => {
  const { name, email, phone, role } = req.body;
  const user = await prisma.user.create({
    data: { name, email, phone, role }
  });
  res.json(user);
});

// ─── Properties ───────────────────────────────────────────────────────

app.get('/api/properties', async (req, res) => {
  const properties = await prisma.property.findMany();
  res.json(properties);
});

app.post('/api/properties', async (req, res) => {
  const property = await prisma.property.create({
    data: req.body
  });
  res.json(property);
});

app.get('/api/owner/:ownerId/properties', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: {
        tenant: true
      }
    });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Disassociate property from tenant users
    await prisma.user.updateMany({
      where: { propertyId: id },
      data: { propertyId: null }
    });
    
    // Delete booking requests associated with the property
    await prisma.bookingRequest.deleteMany({
      where: { propertyId: id }
    });
    
    // Delete the property itself
    await prisma.property.delete({
      where: { id }
    });
    
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Booking Requests ──────────────────────────────────────────────────

app.post('/api/bookings', async (req, res) => {
  try {
    const { propertyId, customerId } = req.body;
    if (!propertyId || !customerId) {
      return res.status(400).json({ error: 'propertyId and customerId are required' });
    }
    const booking = await prisma.bookingRequest.create({
      data: {
        propertyId,
        customerId,
        status: 'Pending'
      },
      include: {
        property: true,
        customer: true
      }
    });
    // Send a real-time notification to the owner if needed
    const ownerId = booking.property.ownerId;
    if (ownerId) {
      io.to(String(ownerId)).emit('new-booking-request', booking);
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/owner/:ownerId/bookings', async (req, res) => {
  try {
    const bookings = await prisma.bookingRequest.findMany({
      where: {
        property: {
          ownerId: req.params.ownerId
        }
      },
      include: {
        property: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/customer/:customerId/bookings', async (req, res) => {
  try {
    const { customerId } = req.params;
    const bookings = await prisma.bookingRequest.findMany({
      where: { customerId },
      include: {
        property: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    const booking = await prisma.bookingRequest.update({
      where: { id: req.params.id },
      data: { status },
      include: { property: true, customer: true }
    });
    // Notify customer
    io.to(String(booking.customerId)).emit('booking-status-updated', booking);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Tenant Records ──────────────────────────────────────────────────

app.get('/api/tenants/:id/maintenance', async (req, res) => {
  const records = await prisma.tenantMaintenance.findMany({
    where: { tenantId: req.params.id }
  });
  res.json(records);
});

app.post('/api/tenants/:id/maintenance', async (req, res) => {
  const record = await prisma.tenantMaintenance.create({
    data: {
      ...req.body,
      tenantId: req.params.id
    }
  });
  res.json(record);
});

app.get('/api/tenants/:id/electricity', async (req, res) => {
  const records = await prisma.tenantElectricity.findMany({
    where: { tenantId: req.params.id }
  });
  res.json(records);
});

app.get('/api/tenants/:id/payments', async (req, res) => {
  const records = await prisma.tenantPayment.findMany({
    where: { tenantId: req.params.id }
  });
  res.json(records);
});

app.get('/api/tenants/:id/documents', async (req, res) => {
  const records = await prisma.tenantDocument.findMany({
    where: { tenantId: req.params.id }
  });
  res.json(records);
});

// Seed an initial dummy property just for UI display
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
        ownerId: owner.id
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
    
    res.json({ message: "Seeded successfully", property: prop, tenant });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Socket.io Connection Logic ───────────────────────────────────────
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(String(userId));
    console.log(`⚡ User connected: ${userId} joined room ${userId}`);
  }

  socket.on('send-message', async (data) => {
    try {
      const { text, senderId, receiverId } = data;
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
    if (userId) {
      console.log(`🔌 User disconnected: ${userId}`);
    }
  });
});

// ─── Chat APIs ────────────────────────────────────────────────────────
app.get('/api/chat', async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) {
      return res.status(400).json({ error: 'user1 and user2 query parameters are required' });
    }

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
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { text, senderId, receiverId } = req.body;
    if (!text || !senderId || !receiverId) {
      return res.status(400).json({ error: 'text, senderId, and receiverId are required' });
    }
    const message = await prisma.message.create({
      data: { text, senderId, receiverId }
    });
    io.to(receiverId).emit('new-message', message);
    io.to(senderId).emit('new-message', message);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Maintenance Update API ───────────────────────────────────────────
app.put('/api/maintenance/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    const record = await prisma.tenantMaintenance.update({
      where: { id: req.params.id },
      data: { status }
    });
    io.emit('maintenance-update', {
      id: record.id,
      tenantId: record.tenantId,
      status: record.status,
      type: record.type
    });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Broadcast API ───────────────────────────────────────────────────
app.post('/api/broadcast', async (req, res) => {
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
});

// ─── AI Integrations ─────────────────────────────────────────────────
app.post('/api/ai/description', async (req, res) => {
  const { title, beds, type, location, furnishedStatus, amenities } = req.body;
  const description = `This premium ${furnishedStatus || 'unfurnished'} ${beds} BHK ${type || 'apartment'} is located in the sought-after neighborhood of ${location || 'NYC'}. Key features include: ${amenities || 'spacious design, parking, high ceilings'}. Ideal for families or working professionals seeking a comfortable home.`;
  res.json({ description });
});

app.post('/api/ai/search', async (req, res) => {
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
});

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
app.post('/api/payments/pay', async (req, res) => {
  try {
    const { tenantId, amount, type } = req.body;
    if (!tenantId || !amount || !type) {
      return res.status(400).json({ error: 'tenantId, amount, and type are required' });
    }
    const payment = await prisma.tenantPayment.create({
      data: {
        date: new Date().toLocaleDateString(),
        amount: `₹${amount}`,
        type,
        status: 'Paid',
        tenantId
      }
    });
    res.json({ success: true, payment, receiptUrl: `/receipts/${payment.id}.pdf` });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Visitor Management ──────────────────────────────────────────────
app.post('/api/visitors', async (req, res) => {
  try {
    const { name, phone, tenantId } = req.body;
    const visitor = await prisma.visitor.create({
      data: {
        name,
        phone,
        qrCode: `VISITOR-${Math.floor(100000 + Math.random()*900000)}`,
        status: 'Invited',
        tenantId
      }
    });
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/visitors/tenant/:tenantId', async (req, res) => {
  try {
    const visitors = await prisma.visitor.findMany({
      where: { tenantId: req.params.tenantId },
      orderBy: { id: 'desc' }
    });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/visitors/:id/scan', async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) return res.status(404).json({ error: 'Visitor not found' });
    
    let newStatus = 'Entered';
    let entryTime = visitor.entryTime;
    let exitTime = visitor.exitTime;
    
    if (visitor.status === 'Invited') {
      newStatus = 'Entered';
      entryTime = new Date();
    } else if (visitor.status === 'Entered') {
      newStatus = 'Exited';
      exitTime = new Date();
    }
    
    const updated = await prisma.visitor.update({
      where: { id },
      data: { status: newStatus, entryTime, exitTime }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Inventory Management ─────────────────────────────────────────────
app.get('/api/properties/:id/inventory', async (req, res) => {
  try {
    const inventory = await prisma.inventoryItem.findMany({
      where: { propertyId: req.params.id }
    });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/properties/:id/inventory', async (req, res) => {
  try {
    const { name, status } = req.body;
    const item = await prisma.inventoryItem.create({
      data: {
        name,
        status: status || 'Good',
        acknowledgedByOwner: true,
        propertyId: req.params.id
      }
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/inventory/:id/acknowledge', async (req, res) => {
  try {
    const { role } = req.body; // 'owner' | 'tenant'
    const data: any = {};
    if (role === 'owner') data.acknowledgedByOwner = true;
    if (role === 'tenant') data.acknowledgedByTenant = true;
    
    const item = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Reviews & Ratings ────────────────────────────────────────────────
app.post('/api/reviews', async (req, res) => {
  try {
    const { rating, comment, authorId, targetId, targetType } = req.body;
    const review = await prisma.review.create({
      data: { rating, comment, authorId, targetId, targetType }
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/reviews/:targetId', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { targetId: req.params.targetId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ─── Owner Dashboard Stats ────────────────────────────────────────────
app.get('/api/owner/:ownerId/dashboard-stats', async (req, res) => {
  try {
    const { ownerId } = req.params;
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
      if (p.status === 'Occupied') {
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
});

// ─── Digital Agreement SIGN ──────────────────────────────────────────
app.post('/api/agreement', async (req, res) => {
  try {
    const { tenantId, rent, deposit, terms, duration } = req.body;
    const dateStr = new Date().toLocaleDateString();
    
    // Delete any existing agreement to avoid unique constraint error
    await prisma.tenantAgreement.deleteMany({
      where: { tenantId }
    });
    
    const agreement = await prisma.tenantAgreement.create({
      data: {
        renewalDate: new Date(Date.now() + (duration || 11) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
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
});

app.put('/api/agreement/:id/sign', async (req, res) => {
  try {
    const { signature, role } = req.body; // role: 'owner' | 'tenant'
    const data: any = {};
    if (role === 'owner') {
      data.ownerSignature = signature;
    } else {
      data.tenantSignature = signature;
    }
    
    // If both signatures present, mark status as Active
    const agreement = await prisma.tenantAgreement.findUnique({ where: { id: req.params.id } });
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
});

// ─── Admin Console APIs ──────────────────────────────────────────────
app.get('/api/admin/stats', async (req, res) => {
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
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put('/api/admin/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlocked: !user.isBlocked }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/auth/profile/password', async (req, res) => {
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
});

// Serve frontend statically in production
app.use(express.static(path.join(__dirname, '../../web-app/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../web-app/dist/index.html'));
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
