import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Log environment variables for debugging (exclude sensitive ones)
console.log('🔧 Environment Configuration:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('  PORT:', PORT);
console.log('  BREVO_SMTP_SERVER:', process.env.BREVO_SMTP_SERVER || 'Not set');
console.log('  BREVO_SMTP_PORT:', process.env.BREVO_SMTP_PORT || 'Not set');
console.log('  BREVO_SMTP_EMAIL:', process.env.BREVO_SMTP_EMAIL ? '✓ Set' : '✗ Not set');
console.log('  BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL || 'Not set');

// Validate required environment variables
const requiredEnvVars = [
  'BREVO_SMTP_SERVER',
  'BREVO_SMTP_PORT',
  'BREVO_SMTP_EMAIL',
  'BREVO_SMTP_PASSWORD',
  'BREVO_FROM_EMAIL',
  'BREVO_FROM_NAME'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('⚠️  Email functionality will not work properly!');
  console.error('📝 Please set these variables in your Render dashboard or .env file');
}

// Middleware
app.use(cors());
app.use(express.json());

// Email configuration using Brevo with enhanced timeout and connection settings
const smtpPort = parseInt(process.env.BREVO_SMTP_PORT) || 587;
const isSecure = smtpPort === 465; // Use TLS for port 465, STARTTLS for other ports

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_SERVER || 'smtp-relay.brevo.com',
  port: smtpPort,
  secure: isSecure, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_EMAIL,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
  // Enhanced connection settings for Render deployment
  connectionTimeout: 30000, // 30 seconds (Render free tier can be slow)
  greetingTimeout: 30000,
  socketTimeout: 30000,
  pool: true, // Use connection pooling
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  // Additional settings for better reliability
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  },
  debug: process.env.NODE_ENV !== 'production', // Enable debug in development
  logger: process.env.NODE_ENV !== 'production' // Enable logging in development
});

// Store verification result
let emailVerificationResult = {
  verified: false,
  error: null
};

// Verify transporter configuration with better error handling
// Make verification non-blocking to allow server to start even if SMTP is slow
if (missingEnvVars.length === 0) {
  console.log('🔄 Verifying email connection (this may take up to 30 seconds)...');
  
  transporter.verify((error, success) => {
    if (error) {
      emailVerificationResult.error = error;
      console.error('⚠️  Email transporter verification failed:', error.message);
      console.error('📋 Error code:', error.code);
      console.error('📋 SMTP Server:', process.env.BREVO_SMTP_SERVER);
      console.error('📋 SMTP Port:', process.env.BREVO_SMTP_PORT);
      console.error('📋 SMTP Email:', process.env.BREVO_SMTP_EMAIL ? '✓ Set' : '✗ Missing');
      console.error('📋 SMTP Password:', process.env.BREVO_SMTP_PASSWORD ? '✓ Set' : '✗ Missing');
      console.error('');
      console.error('⚠️  WARNING: Email verification failed, but server will continue.');
      console.error('💡 Emails may still work when actually sending.');
      
      // Provide specific guidance based on the port being used
      if (smtpPort === 587) {
        console.error('💡 Try changing BREVO_SMTP_PORT to 465 in your environment variables');
        console.error('💡 Also ensure secure is set to true for port 465 in the transporter config');
      } else if (smtpPort === 465) {
        console.error('💡 Ensure secure is set to true for port 465 in the transporter config');
      } else {
        console.error('💡 Check if the SMTP port is correct for your email provider');
      }
      
      console.error('');
    } else {
      emailVerificationResult.verified = true;
      console.log('✅ Email server is ready to send messages');
      console.log('📧 From:', process.env.BREVO_FROM_EMAIL);
      console.log('🔧 SMTP Server:', process.env.BREVO_SMTP_SERVER);
      console.log('🔌 Port:', smtpPort, '(Secure:', isSecure ? 'Yes' : 'No', ')');
    }
  });
} else {
  console.log('⚠️  Skipping email verification due to missing environment variables');
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Phone validation (basic validation for numbers)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number. Must be at least 10 digits.' 
      });
    }

    // Email content to admin (beautiful template matching website theme)
    const mailOptions = {
      from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
      to: process.env.BREVO_FROM_EMAIL,
      subject: `🔔 New Contact Form Submission from ${name}`,
      html: `
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; position: relative; overflow: hidden; min-height: 500px;">
            
            <!-- Watermark - Diagonal -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 60px; font-weight: 900; white-space: nowrap; pointer-events: none; z-index: 0; letter-spacing: 3px; opacity: 0.08; max-width: 90%;">
              <span style="color: rgb(106, 47, 232);">Nexovent</span><span style="color: rgb(0, 0, 0);"> Labs</span>
            </div>
            
            <!-- Content -->
            <div style="position: relative; z-index: 1;">
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                Dear Admin,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                You have received a new contact form submission from your website. Below are the details:
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                <strong>Name:</strong> ${name}
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                <strong>Email:</strong> <a href="mailto:${email}" style="color: #6A2FE8; text-decoration: none;">${email}</a>
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                <strong>Phone:</strong> <a href="tel:${phone}" style="color: #6A2FE8; text-decoration: none;">${phone}</a>
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                <strong>Message:</strong>
              </p>
              
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                ${message}
              </p>
              
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                Please respond to this inquiry at your earliest convenience.
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                Best regards,
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                NexoventLabs
              </p>
              
              <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                Received on ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
      text: `
🔔 NEW CONTACT FORM SUBMISSION

Contact Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${name}
📧 Email: ${email}
📱 Phone: ${phone}

💬 Message:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${message}

⏰ Received on: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NexoventLabs Contact Form
© ${new Date().getFullYear()} NexoventLabs. All rights reserved.
      `,
    };

    // Auto-reply email to the user
    const autoReplyOptions = {
      from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
      to: email,
      subject: 'Thank You for Contacting NexoventLabs! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; position: relative; overflow: hidden; min-height: 500px;">
            
            <!-- Watermark - Diagonal -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 60px; font-weight: 900; white-space: nowrap; pointer-events: none; z-index: 0; letter-spacing: 3px; opacity: 0.08; max-width: 90%;">
              <span style="color: rgb(106, 47, 232);">Nexovent</span><span style="color: rgb(0, 0, 0);"> Labs</span>
            </div>
            
            <!-- Content -->
            <div style="position: relative; z-index: 1;">
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                Dear ${name},
              </p>
              
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                Thank you for reaching out to us! We have received your message and we're excited to connect with you.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                Our team will review your inquiry and get back to you within 24 hours. In the meantime, feel free to explore our services and discover how we can transform your business with cutting-edge AI solutions.
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                <strong>Your Submission Details:</strong>
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                Name: ${name}<br>
                Email: ${email}<br>
                Phone: ${phone}
              </p>
              
              <p style="margin: 0 0 20px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                If you have any urgent questions, please feel free to reply to this email or call us at <a href="tel:+918106811285" style="color: #6A2FE8; text-decoration: none;">+91 8106811285</a>.
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                Best regards,
              </p>
              
              <p style="margin: 0 0 10px 0; color: #000000; font-size: 14px; line-height: 1.6;">
                NexoventLabs<br>
                AI Innovation Labs<br>
                Andhra Pradesh, India
              </p>
              
              <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                © ${new Date().getFullYear()} NexoventLabs. All rights reserved.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
      text: `
Hi ${name}!

Thank you for reaching out to NexoventLabs!

We've received your message and we're excited to connect with you. Our team will get back to you within 24 hours.

Your Submission Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

In the meantime, feel free to explore our services and discover how we can transform your business with cutting-edge AI solutions.

Have questions? Reply to this email or call us at +91 8106811285

Best regards,
NexoventLabs Team
Andhra Pradesh, India

© ${new Date().getFullYear()} NexoventLabs. All rights reserved.
      `,
    };

    // Check if email configuration is valid
    if (missingEnvVars.length > 0) {
      console.error('❌ Cannot send email: Missing environment variables:', missingEnvVars.join(', '));
      return res.status(500).json({ 
        success: false, 
        message: 'Email service is not configured properly. Please contact the administrator.' 
      });
    }

    // Send both emails with retry logic (3 attempts with exponential backoff)
    const sendWithRetry = async (mailOptions, retries = 3, delay = 2000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          await transporter.sendMail(mailOptions);
          return true;
        } catch (error) {
          console.error(`⚠️  Email attempt ${attempt}/${retries} failed:`, error.message);
          
          // If it's a timeout error on port 587, suggest trying port 465
          if (error.code === 'ETIMEDOUT' && smtpPort === 587) {
            console.error('💡 Tip: Try changing BREVO_SMTP_PORT to 465 in your environment variables');
          }
          
          if (attempt === retries) {
            throw error; // Last attempt failed, throw error
          }
          
          // Wait before retry (exponential backoff)
          const waitTime = delay * Math.pow(2, attempt - 1);
          console.log(`🔄 Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    };

    try {
      console.log('📤 Sending emails...');
      await Promise.all([
        sendWithRetry(mailOptions),
        sendWithRetry(autoReplyOptions)
      ]);
      console.log('✅ Emails sent successfully to:', email);
    } catch (emailError) {
      console.error('❌ Email sending failed after all retries:', emailError.message);
      
      // Provide specific error messages
      if (emailError.code === 'ETIMEDOUT') {
        throw new Error('Email service timeout. The server could not connect to the email service. This may be due to network restrictions on the hosting platform.');
      } else if (emailError.code === 'EAUTH') {
        throw new Error('Email authentication failed. Please verify SMTP credentials are correct.');
      } else if (emailError.code === 'ECONNECTION') {
        throw new Error('Cannot connect to email server. Please verify SMTP server and port settings.');
      } else {
        throw emailError;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully!' 
    });

  } catch (error) {
    console.error('❌ Error in contact endpoint:', error.message);
    
    // Log additional details for debugging
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send email. Please try again later.' 
    });
  }
});

// Health check endpoint with email service status
app.get('/api/health', (req, res) => {
  const emailConfigured = missingEnvVars.length === 0;
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    emailService: emailConfigured ? 'configured' : 'not configured',
    missingVars: emailConfigured ? [] : missingEnvVars,
    timestamp: new Date().toISOString()
  });
});

// Test email endpoint (for debugging - remove in production)
app.get('/api/test-email', async (req, res) => {
  if (missingEnvVars.length > 0) {
    return res.status(500).json({
      success: false,
      message: 'Email not configured',
      missingVars: missingEnvVars
    });
  }

  try {
    // Use the stored verification result if available
    if (emailVerificationResult.error) {
      throw emailVerificationResult.error;
    }
    
    if (!emailVerificationResult.verified) {
      // Try to verify again if not yet verified
      await transporter.verify();
    }
    
    res.json({
      success: true,
      message: 'Email service is working',
      config: {
        host: process.env.BREVO_SMTP_SERVER,
        port: process.env.BREVO_SMTP_PORT,
        from: process.env.BREVO_FROM_EMAIL,
        secure: isSecure
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: error.code
    });
  }
});

app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`✅ Server is running on port ${PORT}`);
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  console.log('📧 Email configured:', missingEnvVars.length === 0 ? '✓ Yes' : '✗ No');
  if (missingEnvVars.length > 0) {
    console.log('⚠️  Missing variables:', missingEnvVars.join(', '));
  }
  console.log('🚀 ================================');
});
