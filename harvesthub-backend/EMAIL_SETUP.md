# 📧 Email Confirmation Setup Guide

This guide explains how to set up email confirmation functionality for Harvest Hub, which sends confirmation emails to users when they log in and when customers place orders.

## 🚀 Features

- **Login Confirmation Emails**: Automatically sent when users log in
- **Order Confirmation Emails**: Automatically sent when customers place orders with detailed order information
- **User Type Detection**: Different email templates for Farmers and Customers
- **Professional Design**: Beautiful HTML email templates with Harvest Hub branding
- **Error Handling**: Login and order placement continue to work even if email sending fails
- **Configurable**: Easy to configure for different email providers

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Nodemailer** package (automatically installed)
3. **Email account** (Gmail recommended for easy setup)

## ⚙️ Configuration

### 1. Install Dependencies

The `nodemailer` package is already included in `package.json`. If you need to install it manually:

```bash
npm install nodemailer
```

### 2. Environment Variables

Add these variables to your `.env` file in the `harvesthub-backend/` directory:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
FRONTEND_URL=http://localhost:5173
```

### 3. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Factor Authentication

#### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification → App passwords
3. Select "Mail" as the app
4. Generate the password
5. Copy the generated password (16 characters)
6. Use this password in your `EMAIL_PASS` environment variable

### 4. Other Email Providers

If you're using a different email provider, update the configuration in `utils/emailService.js`:

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

## 🔧 How It Works

### 1. Login Process
When a user logs in through any of these routes:
- `/api/auth/login` (unified login)
- `/api/farmers/login` (farmer login)
- `/api/customers/login` (customer login)

The system automatically:
1. Validates credentials
2. Generates JWT token
3. Sends confirmation email
4. Returns login response

### 2. Order Process
When a customer places an order through:
- `/api/cart/checkout` (cart checkout)

The system automatically:
1. Validates cart and stock
2. Creates order
3. Updates inventory and farmer wallets
4. Sends order confirmation email
5. Returns order response

### 3. Email Templates

#### Login Confirmation Email
The login confirmation email includes:
- User's name
- Account type (Farmer/Customer)
- Login timestamp
- Security notice
- Link to Harvest Hub

#### Order Confirmation Email
The order confirmation email includes:
- Customer's name
- Order ID and date
- Delivery type
- Total amount
- Detailed order items with quantities and prices
- Next steps information
- Link to view order status

### 4. Error Handling
- If email configuration is missing, login and order placement still work
- Email errors are logged but don't affect core functionality
- Graceful degradation ensures system reliability

## 🧪 Testing

### 1. Test Login Email Endpoint
Use the test endpoint to verify login email functionality:

```bash
POST /api/email/test
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "John Doe",
  "userType": "Farmer"
}
```

### 2. Test Order Email Endpoint
Use the test endpoint to verify order confirmation email functionality:

```bash
POST /api/email/test-order
Content-Type: application/json

{
  "email": "customer@example.com",
  "name": "John Doe",
  "orderData": {
    "_id": "ORDER-123",
    "products": [
      {
        "product": { "name": "Fresh Tomatoes", "price": 45 },
        "quantity": 2,
        "price": 45
      }
    ],
    "totalPrice": 90,
    "deliveryType": "Normal",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### 3. Check Email Status
Verify email configuration:

```bash
GET /api/email/status
```

### 4. Frontend Test Component
Use the EmailTest component in the frontend:
- Navigate to `/email-test` (if route is added)
- Use tabs to test both login and order confirmation emails
- Fill in test details
- Send test emails

## 📁 File Structure

```
harvesthub-backend/
├── utils/
│   └── emailService.js          # Email service utility with login and order templates
├── routes/
│   ├── authRoutes.js            # Updated with login email confirmation
│   ├── farmerRoutes.js          # Updated with login email confirmation
│   ├── customerRoutes.js        # Updated with login email confirmation
│   ├── cartRoutes.js            # Updated with order confirmation email
│   └── emailRoutes.js           # Email test routes for both login and order
└── EMAIL_SETUP.md               # This guide
```

## 🔍 Troubleshooting

### Common Issues

1. **"Email configuration not found"**
   - Check that `EMAIL_USER` and `EMAIL_PASS` are set in `.env`
   - Verify the environment variables are loaded

2. **"Invalid login credentials"**
   - This is unrelated to email - check your email/password
   - Email sending happens after successful authentication

3. **"Authentication failed" (Gmail)**
   - Ensure 2-Factor Authentication is enabled
   - Use App Password, not your regular password
   - Check that the App Password is for "Mail"

4. **"Connection timeout"**
   - Check your internet connection
   - Verify email provider settings
   - Try a different email provider

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
DEBUG=nodemailer:*
```

## 🔒 Security Considerations

1. **App Passwords**: Always use App Passwords, never regular passwords
2. **Environment Variables**: Never commit email credentials to version control
3. **Rate Limiting**: Consider implementing rate limiting for email endpoints
4. **Email Validation**: Validate email addresses before sending

## 📧 Email Templates

The email template is located in `utils/emailService.js` and includes:
- Responsive HTML design
- Harvest Hub branding
- Security information
- Professional styling

You can customize the template by modifying the `emailTemplates` object.

## 🚀 Production Deployment

For production deployment:

1. **Use Environment Variables**: Set email credentials in your hosting platform
2. **Verify Email Domain**: Ensure your sending email is verified
3. **Monitor Email Delivery**: Set up email delivery monitoring
4. **Rate Limiting**: Implement rate limiting for email endpoints
5. **Logging**: Set up proper logging for email operations

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your email configuration
3. Test with the provided test endpoints
4. Check server logs for detailed error messages

---

**Note**: Email confirmation is optional. The application will work normally even without email configuration, but users won't receive login confirmation emails or order confirmation emails. 