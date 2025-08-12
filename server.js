/**
 * MNL-AI Premium Website Server - Clean Express Backend
 * Built by Tristan Trinidad
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================================================
// Middleware Configuration
// ==========================================================================

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ==========================================================================
// Static File Serving
// ==========================================================================

// Serve /public directory for assets
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Serve root-level static files (style.css, script.js, favicon.ico)
app.use(express.static(path.join(__dirname), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  }
}));

// ==========================================================================
// API Routes
// ==========================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Contact form submission handler
app.post('/contact', async (req, res) => {
  try {
    const { name, email, business, message } = req.body;
    
    // Input validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (name, email, message)'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Input sanitization
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 100),
      business: business ? business.trim().substring(0, 100) : 'Not provided',
      message: message.trim().substring(0, 1000)
    };

    // Log the submission
    console.log('\n=== NEW CONTACT FORM SUBMISSION ===');
    console.log(`Name: ${sanitizedData.name}`);
    console.log(`Email: ${sanitizedData.email}`);
    console.log(`Business: ${sanitizedData.business}`);
    console.log(`Message: ${sanitizedData.message}`);
    console.log(`IP: ${req.ip || req.connection.remoteAddress}`);
    console.log(`User-Agent: ${req.get('User-Agent')}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('=====================================\n');

    // In a production environment, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM
    // 4. Set up automated follow-up
    
    // For now, we just log and respond
    res.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again.'
    });
  }
});

// Services API endpoint
app.get('/api/services', (req, res) => {
  const services = [
    {
      id: 'website-creation',
      name: 'Website Creation',
      description: 'Professional websites that convert visitors into customers',
      startingPrice: 10000,
      currency: 'PHP',
      features: [
        'Custom responsive design',
        'Mobile optimization',
        'SEO setup',
        'Contact forms',
        '30 days support'
      ]
    },
    {
      id: 'ai-chatbots',
      name: 'AI Chatbots',
      description: 'Smart chatbots that qualify leads 24/7',
      startingPrice: null,
      currency: 'PHP',
      features: [
        'Lead qualification',
        'Appointment booking',
        '24/7 availability',
        'CRM integration',
        'Multi-platform support'
      ]
    },
    {
      id: 'business-automation',
      name: 'Business Automation',
      description: 'Automate repetitive tasks and save time',
      startingPrice: null,
      currency: 'PHP',
      features: [
        'Workflow automation',
        'Email marketing',
        'Sales process automation',
        'Data synchronization',
        'Custom integrations'
      ]
    },
    {
      id: 'marketing-assets',
      name: 'Marketing Assets',
      description: 'Professional branding that matches your website',
      startingPrice: null,
      currency: 'PHP',
      features: [
        'Logo design',
        'Business cards',
        'Social media graphics',
        'Brand guidelines',
        'Marketing materials'
      ]
    }
  ];
  
  res.json({ 
    success: true, 
    data: services,
    timestamp: new Date().toISOString()
  });
});

// Analytics endpoint (for future use)
app.post('/api/analytics', (req, res) => {
  try {
    const { event, data } = req.body;
    
    // Log analytics event
    console.log(`Analytics Event: ${event}`, data);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false });
  }
});

// ==========================================================================
// Page Routes
// ==========================================================================

// Main page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server Error');
    }
  });
});

// Work page route (if needed for future expansion)
app.get('/work', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving work page:', err);
      res.status(404).send('Page not found');
    }
  });
});

// ==========================================================================
// Error Handling
// ==========================================================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    requestedUrl: req.originalUrl
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  }

  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving catch-all route:', err);
      res.status(404).send('Page not found');
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// ==========================================================================
// Server Startup
// ==========================================================================

const server = app.listen(PORT, () => {
  console.log(`🚀 MNL-AI Website running on port ${PORT}`);
  console.log(`📧 Contact form submissions logged to console`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
  console.log(`🎯 Health check available at: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Running in production mode');
  } else {
    console.log('🔧 Running in development mode');
  }
});

// ==========================================================================
// Graceful Shutdown
// ==========================================================================

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;