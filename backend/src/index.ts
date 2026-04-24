import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Users & Tenants
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

// Properties
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

// Tenant Records
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

// Serve frontend statically in production
app.use(express.static(path.join(__dirname, '../../web-app/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../web-app/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
