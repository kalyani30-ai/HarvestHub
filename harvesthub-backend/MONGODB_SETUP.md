# MongoDB Setup Guide

## Quick Setup

### 1. Create Environment File
Create a `.env` file in the `harvesthub-backend` folder with:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/harvesthub
# Or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/harvesthub

# JWT Secret for token generation
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. MongoDB Options

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use: `MONGODB_URI=mongodb://localhost:27017/harvesthub`

#### Option B: MongoDB Atlas (Cloud)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Use: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/harvesthub`

#### Option C: No MongoDB (Fallback)
- If no `MONGODB_URI` or `MONGO_URI` is set, the app will use in-memory storage
- Perfect for testing without database setup

### 3. Start the Server
```bash
cd harvesthub-backend
npm start
```

## How It Works

### Smart Login/Registration Flow:
1. **User tries to login** with any email/password
2. **System checks** if MongoDB is connected
3. **If MongoDB connected:**
   - Checks if user exists in database
   - If new user → automatically creates account with hashed password
   - If existing user → verifies password with bcrypt
   - Returns JWT token and user data
4. **If MongoDB not connected:**
   - Uses in-memory storage (fallback)
   - Creates user automatically
   - Works with any email/password

### Benefits:
- ✅ **Seamless experience** - users don't need to register separately
- ✅ **Secure passwords** - automatically hashed when MongoDB is used
- ✅ **Fallback support** - works without database setup
- ✅ **JWT tokens** - proper authentication when MongoDB is connected
- ✅ **Data persistence** - user data saved when MongoDB is connected

### Test Credentials:
- **Customer:** `customer@test.com` / `password123`
- **Farmer:** `farmer@test.com` / `password123`
- **Or any email/password combination** (auto-registers new users)

## Troubleshooting

### MongoDB Connection Issues:
1. Check if MongoDB is running
2. Verify connection string format
3. Check network connectivity (for Atlas)
4. Ensure database permissions

### Fallback Mode:
- If MongoDB fails, app automatically uses in-memory storage
- No data loss - just no persistence
- Perfect for development and testing 