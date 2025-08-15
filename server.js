/**
 * MNL-AI Premium Website Server - Production Ready with Optimized Static Serving
 * Built by Tristan Trinidad
 * Fixed for Railway deployment with proper asset serving
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

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
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent.substring(0, 50)}`);
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Add CORS headers for production
  if (isProduction) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  
  next();
});

// ==========================================================================
// Static File Serving - OPTIMIZED FOR PRODUCTION
// ==========================================================================

// Set up cache control based on file type
const setCustomCacheControl = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  // Long cache for images and fonts (1 year)
  if (['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
    res.setHeader('Cache-Control', isProduction ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
  }
  // Medium cache for CSS and JS (1 week in production, 1 hour in dev)
  else if (['.css', '.js'].includes(ext)) {
    res.setHeader('Cache-Control', isProduction ? 'public, max-age=604800' : 'public, max-age=3600');
  }
  // Short cache for HTML (1 hour)
  else if (ext === '.html') {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  // No cache for other files
  else {
    res.setHeader('Cache-Control', 'no-cache');
  }
  
  // Set proper MIME types
  if (ext === '.webp') {
    res.setHeader('Content-Type', 'image/webp');
  } else if (ext === '.css') {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  } else if (ext === '.js') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (['.jpg', '.jpeg'].includes(ext)) {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (ext === '.png') {
    res.setHeader('Content-Type', 'image/png');
  } else if (ext === '.svg') {
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  } else if (ext === '.ico') {
    res.setHeader('Content-Type', 'image/x-icon');
  }
};

// Serve the entire public directory as static files
// This makes /public/assets/... accessible as /assets/...
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProduction ? '1y' : '1h',
  etag: true,
  lastModified: true,
  setHeaders: setCustomCacheControl,
  // Add fallthrough for better error handling
  fallthrough: true,
  // Enable compression
  compress: true
}));

// Serve root-level static files (style.css, script.js, favicon.ico)
// This allows /style.css to work alongside /assets/...
app.use(express.static(path.join(__dirname), {
  maxAge: isProduction ? '1w' : '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    const filename = path.basename(filePath);
    // Only serve specific root files for security
    if (['style.css', 'script.js', 'favicon.ico', 'robots.txt', 'sitemap.xml'].includes(filename)) {
      setCustomCacheControl(res, filePath);
    }
  },
  // Serve only specific file extensions from root
  extensions: ['css', 'js', 'ico', 'txt', 'xml']
}));

// ==========================================================================
// Special Routes for Common Static Files
// ==========================================================================

// Handle favicon requests specifically (common issue in production)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assets', 'branding', 'favicon.ico'), (err) => {
    if (err) {
      // Fallback to root favicon if assets version doesn't exist
      res.sendFile(path.join(__dirname, 'favicon.ico'), (fallbackErr) => {
        if (fallbackErr) {
          res.status(404).send('Favicon not found');
        }
      });
    }
  });
});

// Handle robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

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
    environment: process.env.NODE_ENV || 'development',
    staticServing: 'optimized'
  });
});

// Test route for static file debugging
app.get('/debug/assets', (req, res) => {
  const fs = require('fs');
  const publicPath = path.join(__dirname, 'public');
  
  try {
    const getDirectoryStructure = (dir, prefix = '') => {
      const items = fs.readdirSync(dir);
      let structure = [];
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          structure.push(`${prefix}📁 ${item}/`);
          structure = structure.concat(getDirectoryStructure(itemPath, prefix + '  '));
        } else {
          structure.push(`${prefix}📄 ${item}`);
        }
      });
      
      return structure;
    };
    
    const structure = getDirectoryStructure(publicPath);
    
    res.json({
      message: 'Static files structure',
      publicPath: publicPath,
      structure: structure,
      accessibleVia: [
        '/assets/hero/hero-desktop.webp',
        '/assets/branding/favicon.ico',
        '/style.css',
        '/script.js'
      ]
    });
  } catch (error) {
    res.status(500).json({
      error: 'Could not read public directory',
      message: error.message
    });
  }
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

    // In production, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Add to CRM
    // 4. Set up automated follow-up
    
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

// ==========================================================================
// Page Routes
// ==========================================================================

// Main page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Server Error - Could not load homepage');
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
    requestedUrl: req.originalUrl,
    availableEndpoints: ['/api/services', '/health', '/debug/assets']
  });
});

// Handle static file 404s with helpful debugging
app.use((req, res, next) => {
  if (req.url.startsWith('/assets/') || req.url.startsWith('/public/')) {
    console.warn(`Static file not found: ${req.url}`);
    return res.status(404).json({
      error: 'Static file not found',
      requestedUrl: req.url,
      suggestion: req.url.startsWith('/public/') 
        ? `Try: ${req.url.replace('/public/', '/')}`
        : 'Check if file exists in /public folder',
      debugEndpoint: '/debug/assets'
    });
  }
  next();
});

// Catch-all route for SPA (must be after static file handling)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes or static files
  if (req.path.startsWith('/api/') || req.path.startsWith('/assets/')) {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
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
    error: isProduction 
      ? 'Internal server error' 
      : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// ==========================================================================
// Server Startup
// ==========================================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MNL-AI Website running on port ${PORT}`);
  console.log(`📧 Contact form submissions logged to console`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`🎯 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🔍 Debug assets at: http://localhost:${PORT}/debug/assets`);
  
  if (isProduction) {
    console.log('🔒 Running in production mode with optimized caching');
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
    
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forcing shutdown after timeout');
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