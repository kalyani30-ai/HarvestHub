const nodemailer = require('nodemailer');

// Create a Nodemailer transporter configured to use Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Optional: verify transporter on startup for easier debugging
transporter.verify((verifyError, success) => {
  if (verifyError) {
    console.error('[Email] Transporter verification failed:', {
      message: verifyError.message,
      code: verifyError.code,
      response: verifyError.response,
      responseCode: verifyError.responseCode,
      command: verifyError.command,
      stack: verifyError.stack
    });
  } else {
    console.log('[Email] Transporter is ready to send emails.');
  }
});

// Utility: log rich Nodemailer error details
const logNodemailerError = (error, context) => {
  try {
    console.error(`[Email] ${context} failed`, {
      message: error && error.message,
      code: error && error.code,
      response: error && error.response,
      responseCode: error && error.responseCode,
      command: error && error.command,
      stack: error && error.stack
    });
  } catch (e) {
    console.error('[Email] Failed to log Nodemailer error', e);
  }
};

// Async function to send login confirmation email
const sendLoginConfirmation = async (userEmail, userName, userType = 'customer') => {
  try {
    const normalizedUserType = userType && userType.toLowerCase() === 'farmer' ? 'Farmer' : 'Customer';
    const loginTime = new Date().toLocaleString();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'New login to your Harvest Hub account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">🌿 Harvest Hub Login</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
            <h2 style="color: #333;">Hello ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">
              You have successfully logged in to your Harvest Hub account.
            </p>
            <div style="background-color: #e8f5e8; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>Login Details:</strong><br>
                • Time: ${loginTime}<br>
                • Account Type: ${normalizedUserType}<br>
                • Account: ${userEmail}
              </p>
            </div>
            <p style="color: #666; line-height: 1.6;">
              If this was not you, please secure your account.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                Regards,<br>
                Harvest Hub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Login confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logNodemailerError(error, 'Login confirmation email');
    return { success: false, error: error.message };
  }
};

// Async function to send order confirmation email
const sendOrderConfirmation = async (userEmail, userName, orderData) => {
  try {
    const orderId = orderData && (orderData._id || orderData.orderId || 'N/A');
    const orderDate = new Date().toLocaleString();
    const deliveryType = (orderData && orderData.deliveryType) || 'Normal';
    const totalAmount = (orderData && orderData.totalPrice) || 0;
    const items = Array.isArray(orderData && orderData.products) ? orderData.products : [];

    const itemsHtml = items.map((it, idx) => {
      const name = it.name || (it.product && it.product.name) || `Item ${idx + 1}`;
      const qty = it.quantity || 1;
      const price = it.price || 0;
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #eee;">${name}</td>
          <td style="padding: 8px; border: 1px solid #eee; text-align:center;">${qty}</td>
          <td style="padding: 8px; border: 1px solid #eee; text-align:right;">₹${price.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Order Confirmation - Harvest Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">🧾 Order Confirmation</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
            <h2 style="color: #333;">Hello ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">Thank you for your order! Here are your order details:</p>
            <div style="background-color: #e8f5e8; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>Order ID:</strong> ${orderId}<br>
                <strong>Date:</strong> ${orderDate}<br>
                <strong>Delivery Type:</strong> ${deliveryType}<br>
                <strong>Total Amount:</strong> ₹${Number(totalAmount).toFixed(2)}
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr>
                  <th style="padding: 8px; border: 1px solid #eee; text-align:left;">Item</th>
                  <th style="padding: 8px; border: 1px solid #eee;">Qty</th>
                  <th style="padding: 8px; border: 1px solid #eee; text-align:right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || '<tr><td colspan="3" style="padding: 8px; border: 1px solid #eee; text-align:center; color:#888;">No items</td></tr>'}
              </tbody>
            </table>

            <p style="color: #666; line-height: 1.6; margin-top: 20px;">
              We will notify you when your order is shipped. You can check your order status anytime by visiting Harvest Hub.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background:#4CAF50;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;">Go to Harvest Hub</a>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #999; font-size: 12px;">This is an automated message from Harvest Hub. Please do not reply.</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logNodemailerError(error, 'Order confirmation email');
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (userEmail, userName, userType = 'customer') => {
  try {
    const normalizedUserType = userType && userType.toLowerCase() === 'farmer' ? 'Farmer' : 'Customer';
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Welcome to Harvest Hub!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">🌱 Welcome to Harvest Hub</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
            <h2 style="color: #333;">Hello ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Welcome to Harvest Hub! 🌱
            </p>
            <p style="color: #666; line-height: 1.6;">
              Your ${normalizedUserType} account has been successfully created.
            </p>
            <p style="color: #666; line-height: 1.6;">
              Thank you for joining Harvest Hub.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
                Go to Harvest Hub
              </a>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                Regards,<br>
                Harvest Hub Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logNodemailerError(error, 'Welcome email');
    return { success: false, error: error.message };
  }
};

// Async function to send password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset Request - Harvest Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">🔑 Password Reset</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px;">
            <h2 style="color: #333;">Hello ${userName},</h2>
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password for your Harvest Hub account. Click the button below to reset your password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Important:</strong><br>
                • This link will expire in 1 hour<br>
                • If you didn't request this, please ignore this email<br>
                • Your password won't change until you access the link above
              </p>
            </div>
            <p style="color: #666; line-height: 1.6;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #4CAF50; word-break: break-all; font-size: 12px;">
              ${resetUrl}
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                This is an automated message from Harvest Hub.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logNodemailerError(error, 'Password reset email');
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendLoginConfirmation,
  sendOrderConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail
};