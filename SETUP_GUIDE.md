# 🚀 Harvest Hub - Frontend + Backend Setup Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

## 🛠️ Backend Setup

### 1. Navigate to Backend Directory
```bash
cd harvesthub-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create `.env` file in `harvesthub-backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/harvesthub

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads

# Email Configuration (for login confirmation emails)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
FRONTEND_URL=http://localhost:5173

# Payment Gateway Configuration (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

### 5. Start Backend Server
```bash
npm start
# or
npm run dev
```

Backend will be running on: `http://localhost:5000`

### 6. Email Configuration (Optional but Recommended)
To enable login confirmation emails, you need to configure Gmail SMTP:

#### For Gmail Users:
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in your `EMAIL_PASS` environment variable

#### For Other Email Providers:
Update the email service configuration in `utils/emailService.js`:
```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'your_email_service', // e.g., 'outlook', 'yahoo'
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};
```

**Note:** If email configuration is not provided, the application will continue to work normally, but login confirmation emails will not be sent.

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd harvest-hub-bloom
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create `.env` file in `harvest-hub-bloom/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# EmailJS Configuration (optional)
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Firebase Configuration (optional)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. Start Frontend Development Server
```bash
npm run dev
```

Frontend will be running on: `http://localhost:5173`

## 🔗 Connecting Frontend to Backend

### 1. API Integration
The frontend is already configured to connect to the backend through the API service (`src/lib/api.ts`).

### 2. Update Context Providers
Replace the current context implementations with API calls:

#### Example: Update CartContext
```typescript
// In src/context/CartContext.tsx
import { cartAPI } from '@/lib/api';

// Replace localStorage operations with API calls
const addToCart = async (item: CartItem) => {
  try {
    await cartAPI.addToCart(item.id, item.quantity);
    // Update local state
  } catch (error) {
    console.error('Failed to add to cart:', error);
  }
};
```

#### Example: Update AuthContext
```typescript
// In src/context/AuthContext.tsx
import { authAPI } from '@/lib/api';

const login = async (email: string, password: string) => {
  try {
    const response = await authAPI.customerLogin(email, password);
    localStorage.setItem('authToken', response.token);
    // Update auth state
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 3. Update Components
Replace hardcoded data with API calls:

#### Example: ProductCatalogPage
```typescript
// In src/pages/ProductCatalogPage.tsx
import { productsAPI } from '@/lib/api';

const [products, setProducts] = useState([]);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const data = await productsAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };
  
  fetchProducts();
}, []);
```

## 🗄️ Database Setup

### 1. MongoDB Collections
The backend will automatically create these collections:
- `customers`
- `farmers`
- `products`
- `orders`
- `cart`
- `wishlist`
- `reviews`
- `notifications`
- `categories`

### 2. Sample Data (Optional)
You can add sample data by creating a script:

```javascript
// scripts/seedData.js
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const sampleProducts = [
  {
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes from local farms',
    price: 80,
    category: 'vegetables',
    farmer: 'sample-farmer-id',
    image: '/images/tomatoes.jpg',
    stock: 50,
    unit: 'kg'
  }
  // Add more products...
];

// Run seeding
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    return Product.insertMany(sampleProducts);
  })
  .then(() => {
    console.log('Sample data inserted');
    process.exit(0);
  });
```

## 🔐 Authentication Flow

### 1. Customer Registration/Login
- Frontend: `/register` and `/login` pages
- Backend: `/api/auth/customer/register` and `/api/auth/customer/login`
- JWT token stored in localStorage

### 2. Farmer Registration/Login
- Frontend: `/farmer-register` and `/farmer-login` pages
- Backend: `/api/auth/farmer/register` and `/api/auth/farmer/login`
- JWT token stored in localStorage

### 3. Protected Routes
- Frontend: Uses `ProtectedRoute` component
- Backend: Uses `auth` middleware

## 🛒 Shopping Flow

### 1. Browse Products
- Frontend: `/products` page
- Backend: `/api/products` endpoint

### 2. Add to Cart
- Frontend: Cart context
- Backend: `/api/cart/add` endpoint

### 3. Checkout
- Frontend: `/checkout` page
- Backend: `/api/orders` endpoint

### 4. Order Management
- Frontend: `/orders` page
- Backend: `/api/orders` endpoints

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas (cloud database)
2. Deploy to Heroku/Railway/Render
3. Update environment variables

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to Vercel/Netlify
3. Set environment variables

## 🔧 Troubleshooting

### Common Issues

1. **CORS Error**
   - Backend has CORS configured
   - Check if frontend URL is allowed

2. **MongoDB Connection Error**
   - Verify MongoDB is running
    - Check MONGODB_URI in .env file

3. **API 404 Errors**
   - Verify backend is running on port 5000
   - Check API_BASE_URL in frontend .env

4. **JWT Token Issues**
   - Check JWT_SECRET in backend .env
   - Verify token storage in localStorage

### Debug Commands

```bash
# Check backend logs
cd harvesthub-backend && npm start

# Check frontend logs
cd harvest-hub-bloom && npm run dev

# Check MongoDB connection
mongo
use harvesthub
show collections
```

## 📞 Support

If you encounter any issues:
1. Check the console logs in both frontend and backend
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check network connectivity between frontend and backend

## 🎉 Success!

Once everything is set up:
- Backend: `http://localhost:5000` ✅
- Frontend: `http://localhost:5173` ✅
- Database: MongoDB connected ✅
- API: Frontend ↔ Backend communication ✅

Your Harvest Hub application is now fully functional! 🚀 