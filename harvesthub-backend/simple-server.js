const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test users
const users = {
  customers: [
    {
      id: '1',
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer'
    }
  ],
  farmers: [
    {
      id: '2',
      name: 'Test Farmer',
      email: 'farmer@test.com',
      password: 'password123',
      role: 'farmer'
    }
  ]
};

// Root route
app.get('/', (req, res) => {
  res.json({ message: '🚀 Harvest Hub Backend is running!' });
});

// Customer login
app.post('/api/customers/login', (req, res) => {
  console.log('Customer login attempt:', req.body);
  const { email, password } = req.body;
  
  const customer = users.customers.find(u => u.email === email);
  
  if (!customer || customer.password !== password) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  console.log('Customer login successful:', email);
  res.json({
    token: 'customer_token_123',
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: customer.role
    }
  });
});

// Farmer login
app.post('/api/farmers/login', (req, res) => {
  console.log('Farmer login attempt:', req.body);
  const { email, password } = req.body;
  
  const farmer = users.farmers.find(u => u.email === email);
  
  if (!farmer || farmer.password !== password) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  console.log('Farmer login successful:', email);
  res.json({
    token: 'farmer_token_123',
    farmer: {
      id: farmer.id,
      name: farmer.name,
      email: farmer.email,
      role: farmer.role
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('📋 Test Credentials:');
  console.log('Customer: customer@test.com / password123');
  console.log('Farmer: farmer@test.com / password123');
}); 