/**
 * Cloudflare Worker - Sentra Chatbot Backend (Veronica)
 * 
 * This worker handles:
 * - GET /api/health - Health check endpoint
 * - POST /api/chat - Main chatbot endpoint
 * - POST /api/user-profile - User profile storage
 * - POST /api/contact - Contact form submission
 * 
 * Requires environment variables (set as secrets in Cloudflare):
 * - OPENROUTER_API_KEY: Your OpenRouter API key
 * 
 * Optional:
 * - MAILGUN_API_KEY: For email sending
 * - MAILGUN_DOMAIN: Mailgun domain for email
 */

// OpenRouter Configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "nvidia/nemotron-3-nano-30b-a3b:free";

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 30; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms

// Define System Instruction (Veronica / Sentra Context)
const SYSTEM_INSTRUCTION = `You are Veronica, an intelligent support assistant for Sentra. 
You represent Sentra's suite of products including IoT sensors, data loggers, gateways, and monitoring solutions for infrastructure health and safety.

Company Name: Sentra
Sentra is a structural health monitoring and digital engineering company specializing in real-time infrastructure intelligence.
We integrate smart sensor networks, digital twins, and edge AI for predictive maintenance, fatigue analysis, and geotechnical monitoring.
Our solutions help detect early signs of stress, displacement, vibration, and material degradation across bridges, tunnels, buildings, and other critical assets.
Sentra also provides consulting and advisory services, foundation and geotechnical monitoring, fatigue and residual life assessment, and digital documentation of infrastructure assets.

Sentra is a flagship product line developed and managed by Clove Technologies Private Limited, a leading geospatial and engineering technology company headquartered in India. Clove specializes in delivering end-to-end digital transformation solutions across infrastructure, construction, utilities, and government sectors.

With over two decades of industry expertise, Clove Technologies integrates advanced geospatial intelligence, engineering analytics, and AI-driven automation to help clients build smarter, more resilient assets.

Parent Organization
Parent Company: Clove Technologies Private Limited (website: www.clovetech.com)
Subsidiary/Product Line: Sentra (Structural Health Monitoring & IoT Solutions)
Sentra operates under Clove Technologies' Smart Infrastructure division, focusing on intelligent monitoring systems, IoT-based sensing, and digital twin integration for infrastructure lifecycle management.

Clove Technologies – Specialities
1. Geospatial Technologies: Comprehensive GIS and mapping solutions, including cadastral mapping, LiDAR data processing, remote sensing, and spatial analytics for land administration, urban planning, and infrastructure management.
2. BIM and Digital Engineering: Integrated Building Information Modeling (BIM) services covering 3D modeling, 4D scheduling, and 5D cost estimation to support design, construction, and asset management workflows.
3. Smart Infrastructure Solutions: End-to-end systems for infrastructure digitization, including IoT-based monitoring (Sentra), predictive maintenance, and real-time analytics for bridges, buildings, tunnels, and industrial structures.
4. Custom Software Development: Development of enterprise-grade applications, web platforms, and mobile tools for geospatial data management, field data collection, and engineering operations.
5. AI, Machine Learning & Data Analytics: Deployment of AI-powered analytics for predictive modeling, anomaly detection, and decision intelligence across engineering and asset management domains.
6. Digital Twin & Simulation: Creation of integrated digital twins combining BIM, IoT, and GIS data to enable continuous performance monitoring and simulation of real-world infrastructure systems.
7. Surveying & Data Acquisition: Comprehensive ground and aerial survey services using UAVs, GNSS, and laser scanning for high-precision spatial data acquisition and modeling.

Industry Verticals Served:
- Infrastructure and Construction
- Transportation and Mobility
- Utilities and Energy
- Land Administration and Cadastre
- Urban Development and Smart Cities
- Oil, Gas, and Industrial Facilities

Sentra's Product Line from Various Brands (From World Sensing, Rockfield, etc.)

Edge Devices: 
- Wireless Data Acquisition: Vibrating Wire, Vibrating Wire RCR, Digital Data Logger, Analog Data Logger, Piconode Data Logger
- Wireless Sensors: Tiltmeter, Tiltmeter Event Detection, Vibration Meter, Laser Tiltmeter, GNSS Meter

Core Communications:
- Narrowband Communications: Gateway, Repeater
- Broadband Communications: Thread

Wired Sensors: Accelerometer, Strain Gauge

Key Features:
- 3-axis MEMS accelerometer (±16g range)
- Frequency range: 0.1 Hz – 10 kHz
- LoRaWAN and 4G LTE connectivity
- IP67 waterproof and dustproof rating
- 5–10 year replaceable battery life
- Real-time alerts and notifications
- Cloud-based analytics platform
- BIM/GIS integration ready

Sentra's Core Solutions:
1. Structural Health Monitoring - Real-time monitoring for bridges, buildings, tunnels
2. Advanced NDT - Non-invasive testing methods
3. Bridge Inspection - Comprehensive condition assessment & lifecycle management
4. Asset Monitoring - End-to-end management with dashboards & predictive analytics
5. Consulting Services - Expert engineering advice & deployment strategies
6. Geotechnical Monitoring - Soil stability, foundation settlement, slope monitoring
7. Fatigue Assessment - Structural lifespan evaluation & RUL estimation
8. Digital Engineering - BIM, 3D modeling, digital twins, documentation

Contact Information:
Phone: +91 7893023322
Email: sentra@clovetech.com
Office Address: IT SEZ, Plot No. 9, Pedda Rushikonda, Rushikonda, Visakhapatnam, Andhra Pradesh 530045

AI AGENT: Veronica - Sentra Support Assistant

When users ask about products or solutions, encourage them to contact Sentra for demos, quotes, or detailed specifications. Always maintain a professional, helpful tone and provide accurate, relevant information about Sentra's offerings.`;

/**
 * Simple in-memory rate limiter for Cloudflare Workers
 * Note: This is per-worker instance. For persistent storage, use Cloudflare KV.
 */
const rateLimitStore = new Map();

function getClientIP(request) {
    return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
}

function isRateLimited(clientIp) {
    const now = Date.now();

    if (!rateLimitStore.has(clientIp)) {
        rateLimitStore.set(clientIp, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        });
        return false;
    }

    const clientData = rateLimitStore.get(clientIp);

    if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + RATE_LIMIT_WINDOW;
        return false;
    }

    clientData.count++;
    return clientData.count > RATE_LIMIT_REQUESTS;
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;
            if (!error.message.includes('429') && !error.message.includes('RATE_LIMITED')) throw error;

            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Rate limited. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Send email via Mailgun
 */
async function sendMailgunEmail(env, name, email, subject, message) {
    const mailgunApiKey = env.MAILGUN_API_KEY;
    const mailgunDomain = env.MAILGUN_DOMAIN;

    if (!mailgunApiKey || !mailgunDomain) {
        console.warn('Mailgun not configured. Configure MAILGUN_API_KEY and MAILGUN_DOMAIN to enable email sending.');
        return false;
    }

    try {
        const auth = btoa(`api:${mailgunApiKey}`);
        const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;

        const formData = new URLSearchParams();
        formData.append('from', `Contact Form <noreply@${mailgunDomain}>`);
        formData.append('to', 'contact@sentratech.in');
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
            console.error(`Mailgun API error: ${response.status} - ${errorText}`);
            return false;
        }

        console.log('Mailgun email sent successfully');
        return true;
    } catch (emailError) {
        console.error('Mailgun email error:', emailError.message);
        return false;
    }
}

/**
 * Handle /api/health endpoint
 */
async function handleHealth() {
    return new Response(JSON.stringify({
        status: 'ok',
        message: 'Server is running',
        model: MODEL_NAME,
        provider: 'OpenRouter',
        chatbot: 'Veronica - Sentra',
        timestamp: new Date().toISOString()
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Handle /api/chat endpoint
 */
async function handleChat(request, env) {
    try {
        const body = await request.json();
        const message = body.message || '';

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get API key from environment
        const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
        if (!OPENROUTER_API_KEY) {
            console.error('Missing OPENROUTER_API_KEY environment variable');
            return new Response(JSON.stringify({
                error: 'Invalid or missing OpenRouter API key. Please check your configuration.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Construct the prompt with system instruction
        const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nUser query: ${message}`;

        // Call OpenRouter API with retry logic
        const apiCall = async () => {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://sentratech.in',
                    'X-Title': 'Sentra Chatbot'
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: [
                        {
                            role: 'user',
                            content: fullPrompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
                error.status = response.status;
                throw error;
            }

            return await response.json();
        };

        // Use retry logic
        const data = await retryWithBackoff(apiCall);

        // Extract response
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const responseText = data.choices[0].message.content;
            return new Response(JSON.stringify({ response: responseText, message: responseText }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error('Unexpected response format from OpenRouter API');
        }

    } catch (error) {
        console.error("OpenRouter API Error:", error);

        let errorMessage = "An error occurred while processing your request.";
        let statusCode = 500;

        if (error.message.includes("API key") || error.message.includes("invalid") || error.message.includes("401")) {
            errorMessage = "Invalid or missing OpenRouter API key. Please check your configuration.";
            statusCode = 401;
        } else if (error.message.includes("429") || error.status === 429) {
            statusCode = 429;
            errorMessage = "API rate limit exceeded. Please wait a moment and try again.";
        } else if (error.message.includes("quota") || error.message.includes("insufficient_credits")) {
            statusCode = 402;
            errorMessage = "Insufficient credits or API quota. Please check your OpenRouter account.";
        } else if (error.status === 404) {
            errorMessage = "Model not found. Please check the model configuration.";
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle /api/user-profile endpoint
 */
async function handleUserProfile(request, env) {
    try {
        const body = await request.json();
        const { name, email } = body;

        if (!name || !email) {
            return new Response(JSON.stringify({ error: 'Name and email are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // For Cloudflare Workers, you can:
        // 1. Store in Cloudflare KV (persistent) - recommended
        // 2. Send to an external database
        // 3. Just log it (as in this example)

        console.log('User profile saved:', { name, email, timestamp: new Date().toISOString() });

        // TODO: Store in Cloudflare KV for persistence
        // const key = `user_${email}`;
        // await env.KV_STORAGE.put(key, JSON.stringify({ name, email, timestamp: Date.now() }));

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('User profile error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save user profile' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle /api/contact endpoint
 */
async function handleContact(request, env) {
    try {
        const body = await request.json();
        const {
            firstName = '',
            lastName = '',
            email = '',
            subject = '',
            message = ''
        } = body;

        const trimmedEmail = String(email).trim();
        const trimmedMessage = String(message).trim();

        if (!trimmedEmail || !trimmedMessage) {
            return new Response(JSON.stringify({ error: 'Email and message are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate email format
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(trimmedEmail)) {
            return new Response(JSON.stringify({ error: 'Invalid email format' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const fullName = `${firstName} ${lastName}`.trim() || 'Guest';

        // Log submission
        console.log('Contact form submission:', {
            name: fullName,
            email: trimmedEmail,
            subject: String(subject),
            message: trimmedMessage,
            timestamp: new Date().toISOString()
        });

        // Send email via Mailgun if configured
        if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
            await sendMailgunEmail(env, fullName, trimmedEmail, subject, trimmedMessage);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Thank you for contacting us. We will get back to you soon.'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Contact form submission error:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to submit contact form.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * CORS headers for all responses
 */
function getCORSHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };
}

/**
 * Main Worker Request Handler
 */
export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: getCORSHeaders()
            });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        // Rate limiting check for chat endpoint
        if (path === '/api/chat' && request.method === 'POST') {
            const clientIp = getClientIP(request);
            if (isRateLimited(clientIp)) {
                return new Response(JSON.stringify({
                    error: 'Too many requests. Please wait a moment before sending another message.',
                    retryAfter: 60
                }), {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        ...getCORSHeaders()
                    }
                });
            }
        }

        // Route requests
        let response;

        if (path === '/api/health' && request.method === 'GET') {
            response = await handleHealth();
        } else if (path === '/api/chat' && request.method === 'POST') {
            response = await handleChat(request, env);
        } else if (path === '/api/user-profile' && request.method === 'POST') {
            response = await handleUserProfile(request, env);
        } else if (path === '/api/contact' && request.method === 'POST') {
            response = await handleContact(request, env);
        } else {
            response = new Response(JSON.stringify({ error: 'Not Found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Add CORS headers to response
        const newResponse = new Response(response.body, response);
        Object.entries(getCORSHeaders()).forEach(([key, value]) => {
            newResponse.headers.set(key, value);
        });

        return newResponse;
    }
};
