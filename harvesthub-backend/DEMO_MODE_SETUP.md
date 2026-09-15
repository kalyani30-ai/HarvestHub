# Demo Mode Setup Guide

## Overview
The auto-provisioning demo login feature allows any email and password combination to work for both farmers and customers. When a user logs in with an email that doesn't exist, the system automatically creates a new user account.

## How to Enable Demo Mode

### Option 1: Environment Variable
Add the following environment variable to your `.env` file:
```
DEMO_MODE=true
```

### Option 2: Command Line
Set the environment variable before starting the server:
```bash
# Windows (PowerShell)
$env:DEMO_MODE="true"; node server.js

# Windows (Command Prompt)
set DEMO_MODE=true && node server.js

# Linux/Mac
DEMO_MODE=true node server.js
```

## Features Enabled in Demo Mode

1. **Auto-provisioning**: New users are automatically created when they log in with an email that doesn't exist
2. **Password Bypass**: Any password will work for login (existing and new users)
3. **User Type Flexibility**: Users can specify their role (farmer or customer) during login
4. **Default Data**: Auto-generated names, addresses, and phone numbers for demo users

## API Usage

### Unified Login Route
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "any.email@example.com",
  "password": "anyPassword123",
  "userType": "customer"  // or "farmer"
}
```

### Customer Login Route
```bash
POST /api/customers/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "anyPassword123"
}
```

### Farmer Login Route
```bash
POST /api/farmers/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "anyPassword123"
}
```

## Response Format

Successful login response includes:
```json
{
  "message": "Demo account created and logged in successfully.",
  "token": "jwt_token_here",
  "userType": "customer",
  "activeRole": "customer",
  "user": {
    "id": "user_id",
    "name": "Generated Name",
    "email": "user@example.com",
    "phone": "1234567890",
    "role": "customer",
    "address": "Demo Address"
  },
  "wasNewUser": true
}
```

## Security Note

⚠️ **IMPORTANT**: Demo mode should only be used for development and testing purposes. Never enable demo mode in production environments as it bypasses password verification and allows unauthorized access.

## Disabling Demo Mode

To disable demo mode, simply remove the `DEMO_MODE=true` environment variable or set it to `false`:
```
DEMO_MODE=false
```

## Additional Configuration

You can also use the existing `ALLOW_ANY_LOGIN` environment variable for password bypass without auto-provisioning:
```
ALLOW_ANY_LOGIN=true
```

This allows any password to work for existing users but won't automatically create new users.