import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Log environment variables for debugging (exclude sensitive ones)
console.log('🔧 Environment Configuration:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('  PORT:', PORT);
console.log('  BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Set' : '✗ Not set');
console.log('  BREVO_FROM_EMAIL:', process.env.BREVO_FROM_EMAIL || 'Not set');
console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Not set');

// Validate required environment variables
const requiredEnvVars = [
  'BREVO_API_KEY',
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

// Email configuration using Brevo API (works on Render, unlike SMTP)
// Render blocks outbound SMTP connections, so we use HTTP API instead
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Verify API key is set
if (missingEnvVars.length === 0) {
  console.log('✅ Email service configured using Brevo API');
  console.log('📧 From:', process.env.BREVO_FROM_EMAIL);
  console.log('🔧 API Method: HTTP (SMTP blocked on Render)');
  console.log('💡 Using Brevo API v3 for reliable email delivery');
} else {
  console.log('⚠️  Email service not configured - missing variables');
}

// Helper function to send email via Brevo API
const sendEmailViaBrevoAPI = async (emailData) => {
  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Brevo API Error Response:', errorData);
      throw new Error(`Brevo API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Brevo API Response:', result);
    return result;
  } catch (error) {
    console.error('❌ Brevo API Request Failed:', error.message);
    throw error;
  }
};

// Root endpoint - API welcome message (JSON only)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NexoventLabs Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      ping: 'GET /api/ping',
      health: 'GET /api/health',
      contact: 'POST /api/contact',
      chatbot: 'POST /api/chatbot',
      testEmail: 'GET /api/test-email'
    },
    documentation: 'https://github.com/nexoventlabs',
    timestamp: new Date().toISOString()
  });
});

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
    const adminEmailData = {
      sender: {
        name: process.env.BREVO_FROM_NAME,
        email: process.env.BREVO_FROM_EMAIL
      },
      to: [{
        email: process.env.BREVO_FROM_EMAIL,
        name: 'Admin'
      }],
      subject: `🔔 New Contact Form Submission from ${name}`,
      replyTo: {
        email: email,
        name: name
      },
      htmlContent: `
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
      textContent: `
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
    const autoReplyEmailData = {
      sender: {
        name: process.env.BREVO_FROM_NAME,
        email: process.env.BREVO_FROM_EMAIL
      },
      to: [{
        email: email,
        name: name
      }],
      subject: 'Thank You for Contacting NexoventLabs! 🚀',
      htmlContent: `
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
      textContent: `
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
    const sendWithRetry = async (emailData, retries = 3, delay = 1000) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          await sendEmailViaBrevoAPI(emailData);
          return true;
        } catch (error) {
          console.error(`⚠️  Email attempt ${attempt}/${retries} failed:`, error.message);
          
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
      console.log('📤 Sending emails via Brevo API...');
      
      // Send admin email first
      console.log('📧 Sending admin notification...');
      await sendWithRetry(adminEmailData);
      console.log('✅ Admin email sent successfully');
      
      // Send auto-reply email
      console.log('📧 Sending auto-reply to:', email);
      await sendWithRetry(autoReplyEmailData);
      console.log('✅ Auto-reply email sent successfully');
      
      console.log('✅ Both emails sent successfully!');
    } catch (emailError) {
      console.error('❌ Email sending failed after all retries:', emailError.message);
      console.error('📋 Error details:', emailError);
      throw new Error('Failed to send email via Brevo API. Please check API key and try again.');
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

// Simple ping endpoint for cron jobs (minimal response)
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint with email service status
app.get('/api/health', (req, res) => {
  const emailConfigured = missingEnvVars.length === 0;
  res.status(200).json({ 
    success: true,
    status: 'ok', 
    message: 'Server is running',
    emailService: emailConfigured ? 'configured' : 'not configured',
    missingVars: emailConfigured ? [] : missingEnvVars,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Test email endpoint - sends actual test email to verify functionality
app.get('/api/test-email', async (req, res) => {
  if (missingEnvVars.length > 0) {
    return res.status(500).json({
      success: false,
      message: 'Email not configured',
      missingVars: missingEnvVars
    });
  }

  try {
    console.log('📧 Sending test email via Brevo API...');
    
    // Send actual test email
    const testEmailData = {
      sender: {
        name: process.env.BREVO_FROM_NAME,
        email: process.env.BREVO_FROM_EMAIL
      },
      to: [{
        email: process.env.BREVO_FROM_EMAIL,
        name: 'Admin'
      }],
      subject: '✅ Test Email - Render Deployment',
      htmlContent: `
        <h2>Email Service Test</h2>
        <p>This is a test email from your Render deployment.</p>
        <p><strong>Status:</strong> ✅ Email service is working correctly!</p>
        <p><strong>Method:</strong> Brevo API v3 (HTTP)</p>
        <p><strong>Platform:</strong> Render (SMTP blocked, using API instead)</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `,
      textContent: `Email Service Test\n\nThis is a test email from your Render deployment.\nStatus: Email service is working correctly!\nMethod: Brevo API v3 (HTTP)\nPlatform: Render\nTime: ${new Date().toLocaleString()}`
    };
    
    await sendEmailViaBrevoAPI(testEmailData);
    
    console.log('✅ Test email sent successfully!');
    
    res.json({
      success: true,
      message: 'Test email sent successfully! Check your inbox at ' + process.env.BREVO_FROM_EMAIL,
      config: {
        method: 'Brevo API v3',
        apiUrl: BREVO_API_URL,
        from: process.env.BREVO_FROM_EMAIL,
        note: 'Using HTTP API instead of SMTP (Render blocks SMTP ports)'
      }
    });
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email: ' + error.message,
      note: 'Check BREVO_API_KEY in environment variables'
    });
  }
});

// Chatbot endpoint - handles AI chat requests
app.post('/api/chatbot', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, conversationHistory } = req.body;

    console.log('\n🤖 ================================');
    console.log('📥 Chatbot Request Received');
    console.log('🕐 Time:', new Date().toLocaleTimeString());

    // Validation
    if (!message || typeof message !== 'string') {
      console.log('❌ Validation failed: Invalid message format');
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required and must be a string' 
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      console.log('⚠️  Please add GEMINI_API_KEY to your .env file');
      return res.status(500).json({ 
        success: false, 
        message: 'Chatbot service is not configured. Please contact the administrator.' 
      });
    }

    console.log('✅ API Key: Configured');
    console.log('📝 User Message:', message.substring(0, 80) + (message.length > 80 ? '...' : ''));
    console.log('💬 Conversation History:', conversationHistory ? `${conversationHistory.length} messages` : 'None');

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.0-flash - stable, fast, and supports generateContent
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash'
    });

    // Website knowledge base
    const websiteKnowledge = `
You are a helpful AI assistant for NexoventLabs, an AI solutions company. You should provide accurate information about the company based on the following details:

## COMPANY INFORMATION
Company Name: NexoventLabs
Mission: Transform businesses through innovative AI solutions that drive growth, efficiency, and unprecedented insights.
Founded by: A team of AI researchers and industry veterans
Approach: Combine cutting-edge research with practical applications to deliver real-world impact

## CONTACT INFORMATION
Email: nexoventlabs@gmail.com
Phone: +91 8106811285
Address: Andhra Pradesh, India
Social Media:
- Twitter: https://twitter.com/nexoventlabs
- Instagram: https://instagram.com/nexoventlabs
- LinkedIn: https://linkedin.com/company/nexoventlabs

## SERVICES OFFERED
1. Machine Learning - Advanced ML models that learn and adapt to business needs
2. Neural Networks - Deep learning solutions for complex pattern recognition
3. Data Analytics - Transform raw data into actionable business intelligence
4. AI Automation - Streamline operations with intelligent automation systems
5. Website Development - Modern, responsive websites built with cutting-edge technologies
6. Real-time Processing - Lightning-fast AI inference for real-time applications

## TEAM MEMBERS
1. Perivi Harikrishna - Chief AI Officer (Expertise: Deep Learning & Neural Networks)
2. Gali Vijay - Lead ML Engineer (Expertise: Computer Vision & Robotics)

## FEATURED PROJECTS
1. AI Vision System (Computer Vision) - Real-time object detection and classification for autonomous systems
2. NLP Engine (Natural Language) - Advanced language understanding for customer service automation
3. Predictive Analytics (Data Science) - ML-powered forecasting system for enterprise decision making
4. Neural Optimization (Deep Learning) - Optimizing complex systems using reinforcement learning

## CAREER OPPORTUNITIES
1. Senior ML Engineer - San Francisco, CA (Full-time) - Build cutting-edge ML models for real-world applications
2. AI Research Scientist - Remote (Full-time) - Push the boundaries of AI research and innovation
3. Data Engineer - New York, NY (Full-time) - Design and maintain scalable data infrastructure
4. AI Product Manager - London, UK (Full-time) - Lead product strategy for AI-powered solutions

## INSTRUCTIONS
- Be friendly, professional, and helpful
- Provide accurate information based on the knowledge above
- If asked about jobs/careers, list all positions with details
- If asked about contact info, provide email, phone, and address
- If asked to apply for a job, direct them to contact via email: nexoventlabs@gmail.com
- If asked about something not in this knowledge base, politely say you don't have that specific information
- Keep responses concise and friendly
`;

    // Build the prompt with conversation history if provided
    let prompt = websiteKnowledge + '\n\n';
    
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      prompt += 'Previous conversation:\n';
      conversationHistory.forEach(msg => {
        prompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `User Question: ${message}\n\nPlease provide a helpful, accurate response based on the knowledge base above. Keep your response concise and friendly.`;

    // Generate response
    console.log('🔄 Generating AI response...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const botResponse = response.text();

    const processingTime = Date.now() - startTime;
    console.log('✅ Response Generated Successfully');
    console.log('📤 Response Length:', botResponse.length, 'characters');
    console.log('⚡ Processing Time:', processingTime, 'ms');
    console.log('📝 Preview:', botResponse.substring(0, 80) + (botResponse.length > 80 ? '...' : ''));
    console.log('🤖 ================================\n');

    res.status(200).json({ 
      success: true, 
      response: botResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Chatbot Error:', error.message);
    console.error('⏱️  Failed after:', processingTime, 'ms');
    console.error('📋 Error Type:', error.name);
    if (process.env.NODE_ENV === 'development') {
      console.error('🔍 Stack:', error.stack);
    }
    console.log('🤖 ================================\n');
    
    res.status(500).json({ 
      success: false, 
      message: 'Sorry, I encountered an error. Please try again or contact us directly at nexoventlabs@gmail.com',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
  console.log('🤖 Chatbot API:', process.env.GEMINI_API_KEY ? '✓ Connected & Ready' : '✗ Not Configured');
  console.log('📡 API Endpoints:');
  console.log('   - GET  /api/ping (Cron Job Ping)');
  console.log('   - GET  /api/health (Health Check)');
  console.log('   - POST /api/contact (Email Service)');
  console.log('   - POST /api/chatbot (AI Chatbot)');
  console.log('   - GET  /api/test-email (Email Test)');
  console.log('💡 Tip: Use /api/ping for cron jobs (fastest response)');
  console.log('🚀 ================================');
});
