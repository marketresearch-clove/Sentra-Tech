import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Define CORS configuration for multiple environments
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5539',
    'http://127.0.0.1:5539',
    'http://sentratech.in',
    'https://sentratech.in',
    'https://sentratech.netlify.app',
    'http://sentratech.netlify.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Define System Instruction (Veronica / Sentra Context)
const SYSTEM_INSTRUCTION = `You are Veronica, an intelligent support assistant for Sentra Technologies. 
You represent Sentra's suite of products including IoT sensors, data loggers, gateways, and monitoring solutions for infrastructure health and safety.

Your responsibilities:
1. Provide expert guidance on Sentra products and solutions (accelerometers, strain gauges, tiltmeters, vibration meters, data loggers, gateways, communications modules)
2. Answer questions about infrastructure monitoring, structural health monitoring (SHM), bridge inspection, geotechnical monitoring
3. Assist with technical queries about sensor installation, data acquisition, and real-time monitoring
4. Help with information about Sentra's services including NDT, consulting, digital engineering, and asset management
5. Provide details about IoT solutions, edge devices, and cloud integration
6. Direct users to appropriate resources or contact information for sales inquiries

Always maintain a professional, helpful tone and provide accurate, relevant information about Sentra's offerings.`;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    model: 'gemini-2.0-flash',
    chatbot: 'Veronica - Sentra Technologies'
  });
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, file } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. Initialize the Flash Model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    // 2. Construct the Prompt with System Instruction
    const promptParts = [];

    // Add system instruction and user message
    const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUser query: ${message}`;
    promptParts.push(fullPrompt);

    // Add file if it exists
    if (file && file.data) {
      // Clean the base64 string (remove "data:image/png;base64," prefix if present)
      const base64Data = file.data.split(',')[1] || file.data;

      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: file.mimeType || "image/jpeg"
        }
      });
    } else if (file) {
      promptParts.push("\nNote: Image analysis requested but no image data provided.");
    }

    // 3. Generate Content
    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();

    // 4. Send Response - Match expected format from frontend
    res.json({ response: text, message: text });

  } catch (error) {
    console.error("Gemini API Error:", error);

    // Check for specific error types to give better feedback
    let errorMessage = "An error occurred while processing your request.";
    let statusCode = 500;

    if (error.message.includes("API key") || error.message.includes("invalid API key")) {
      errorMessage = "Invalid or missing API key. Please check your configuration.";
    } else if (error.message.includes("429")) {
      statusCode = 429;
      errorMessage = "API quota exceeded. The Gemini API free tier limit has been reached. Please upgrade your plan or try again later.";
    } else if (error.message.includes("401")) {
      errorMessage = "Unauthorized. API key is invalid or expired.";
    } else if (error.message.includes("404")) {
      errorMessage = "Model not found. Please check the model configuration.";
    } else if (error.message.includes("not found for API version")) {
      errorMessage = "The specified model is not compatible with this API version.";
    } else if (error.message.includes("FORBIDDEN")) {
      errorMessage = "API access is forbidden. Check your Google Cloud project settings.";
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User profile endpoint
app.post('/api/user-profile', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    // In a real app, save to database
    console.log('User profile saved:', { name, email });
    res.json({ success: true });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ error: 'Failed to save user profile' });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const {
      firstName = '',
      lastName = '',
      email = '',
      subject = '',
      message = ''
    } = req.body;

    const trimmedEmail = String(email).trim();
    const trimmedMessage = String(message).trim();

    if (!trimmedEmail || !trimmedMessage) {
      return res.status(400).json({ error: 'Email and message are required.' });
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const fullName = `${firstName} ${lastName}`.trim() || 'Guest';

    // Log submission
    console.log('Contact form submitted:', {
      name: fullName,
      email: trimmedEmail,
      subject: String(subject),
      message: trimmedMessage,
      timestamp: new Date().toISOString()
    });

    // Send email via Mailgun if configured
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      try {
        await sendMailgunEmail(fullName, trimmedEmail, subject, trimmedMessage);
        console.log('Mailgun email sent successfully');
      } catch (emailError) {
        console.error('Mailgun email error:', emailError.message);
        // Don't fail the response, just log the error
      }
    } else {
      console.warn('Mailgun not configured. Configure MAILGUN_API_KEY and MAILGUN_DOMAIN to enable email sending.');
    }

    res.json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.'
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit contact form.' });
  }
});

// Helper function to send email via Mailgun
async function sendMailgunEmail(name, email, subject, message) {
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN;

  if (!mailgunApiKey || !mailgunDomain) {
    throw new Error('Mailgun credentials not configured');
  }

  const auth = Buffer.from(`api:${mailgunApiKey}`).toString('base64');
  const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;

  const formData = new URLSearchParams();
  formData.append('from', `Contact Form <noreply@${mailgunDomain}>`);
  formData.append('to', 'contact@sentratech.in');  // Replace with your email
  formData.append('subject', `New Contact Form Submission: ${subject || 'Contact Request'}`);
  formData.append('text', `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
  `);
  formData.append('h:Reply-To', email);

  const response = await fetch(mailgunUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Serve static files
app.use(express.static('.'));

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Using Model: gemini-2.0-flash`);
  console.log(`Chatbot: Veronica - Sentra Technologies Support Assistant`);
});
