/**
 * MNL-AI Premium Website Server v2.1 - Fixed Image Serving
 * Fixed static asset serving for both localhost and Railway deployment
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
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
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
// Static File Serving - PRODUCTION OPTIMIZED
// ==========================================================================

// Custom middleware for setting cache headers based on file type
const setCacheHeaders = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  // Set MIME types explicitly
  switch (ext) {
    case '.webp':
      res.setHeader('Content-Type', 'image/webp');
      break;
    case '.jpg':
    case '.jpeg':
      res.setHeader('Content-Type', 'image/jpeg');
      break;
    case '.png':
      res.setHeader('Content-Type', 'image/png');
      break;
    case '.ico':
      res.setHeader('Content-Type', 'image/x-icon');
      break;
    case '.svg':
      res.setHeader('Content-Type', 'image/svg+xml');
      break;
    case '.css':
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      break;
    case '.js':
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      break;
  }
  
  // Set cache headers based on file type
  if (['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico'].includes(ext)) {
    // Images: Cache for 1 year
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (['.css', '.js'].includes(ext)) {
    // CSS/JS: Cache for 1 week
    res.setHeader('Cache-Control', 'public, max-age=604800');
  } else {
    // Other files: No cache
    res.setHeader('Cache-Control', 'no-cache');
  }
};

// CRITICAL: Serve /public folder as web root with explicit static middleware
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), {
  setHeaders: setCacheHeaders,
  etag: true,
  lastModified: true,
  maxAge: 0,
  fallthrough: false // Don't fall through to next middleware if asset not found
}));

// Serve CSS and JS from root
app.use(express.static(__dirname, {
  setHeaders: setCacheHeaders,
  etag: true,
  lastModified: true,
  maxAge: 0,
  index: false,
  dotfiles: 'deny'
}));

// Serve other public files
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: setCacheHeaders,
  etag: true,
  lastModified: true,
  maxAge: 0
}));

// ==========================================================================
// Special Routes for Debugging
// ==========================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Debug route to check static files structure
app.get('/debug/static', (req, res) => {
  const fs = require('fs');
  const publicPath = path.join(__dirname, 'public');
  
  try {
    const checkPath = (dirPath, basePath = '') => {
      const items = fs.readdirSync(dirPath);
      let files = [];
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.join(basePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files = files.concat(checkPath(fullPath, relativePath));
        } else {
          files.push({
            file: relativePath.replace(/\\/g, '/'),
            size: stat.size,
            url: `/${relativePath.replace(/\\/g, '/')}`
          });
        }
      });
      
      return files;
    };
    
    const files = checkPath(publicPath);
    
    res.json({
      message: 'Static files available',
      publicPath,
      totalFiles: files.length,
      sampleUrls: [
        '/assets/hero/hero-desktop.jpg',
        '/assets/branding/favicon.ico',
        '/assets/metrics/icon__happy-clients.png',
        '/assets/steps/bg_for3steps.png',
        '/assets/profile/tristan_profile.jpg',
        '/style.css',
        '/script.js'
      ],
      allFiles: files.slice(0, 50)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Cannot read public directory',
      message: error.message,
      publicPath
    });
  }
});

// Image existence check endpoint
app.get('/debug/images', (req, res) => {
  const fs = require('fs');
  const imagePaths = [
    'public/assets/hero/hero-desktop.jpg',
    'public/assets/hero/hero-tablet.jpg', 
    'public/assets/hero/hero-mobile.jpg',
    'public/assets/cards/website_creation_desktop.png',
    'public/assets/cards/website_creation_mobile.png',
    'public/assets/cards/ai_chatbots_desktop.png',
    'public/assets/cards/ai_chatbots_mobile.png',
    'public/assets/faq/faq_calendar.png',
    'public/assets/faq/faq_support.png',
    'public/assets/steps/bg_for3steps.png'
  ];
  
  const results = imagePaths.map(imagePath => {
    const fullPath = path.join(__dirname, imagePath);
    const exists = fs.existsSync(fullPath);
    const url = imagePath.replace('public/', '/');
    
    return { 
      path: imagePath, 
      url, 
      exists,
      size: exists ? fs.statSync(fullPath).size : 0
    };
  });
  
  res.json({
    message: 'Image file check',
    images: results,
    missing: results.filter(img => !img.exists),
    found: results.filter(img => img.exists)
  });
});

// ==========================================================================
// API Routes
// ==========================================================================

// Contact form submission
app.post('/contact', async (req, res) => {
  try {
    const { name, email, business, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: email.trim().toLowerCase().substring(0, 100),
      business: business ? business.trim().substring(0, 100) : 'Not provided',
      message: message.trim().substring(0, 1000)
    };

    console.log('\n=== CONTACT FORM SUBMISSION ===');
    console.log(`Name: ${sanitizedData.name}`);
    console.log(`Email: ${sanitizedData.email}`);
    console.log(`Business: ${sanitizedData.business}`);
    console.log(`Message: ${sanitizedData.message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('===============================\n');

    res.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred. Please try again.'
    });
  }
});

// Services API
app.get('/api/services', (req, res) => {
  const services = [
    {
      id: 'website-creation',
      name: 'Website Creation',
      description: 'Professional websites that convert visitors into customers',
      startingPrice: 10000,
      currency: 'PHP'
    },
    {
      id: 'ai-chatbots',
      name: 'AI Chatbots',
      description: 'Smart chatbots that qualify leads 24/7',
      startingPrice: null,
      currency: 'PHP'
    },
    {
      id: 'business-automation',
      name: 'Business Automation',
      description: 'Automate repetitive tasks and save time',
      startingPrice: null,
      currency: 'PHP'
    },
    {
      id: 'marketing-assets',
      name: 'Marketing Assets',
      description: 'Professional branding that matches your website',
      startingPrice: null,
      currency: 'PHP'
    }
  ];
  
  res.json({ 
    success: true, 
    data: services 
  });
});

// ==========================================================================
// Error Handling for Static Files
// ==========================================================================

app.use((req, res, next) => {
  if (req.url.match(/\.(webp|jpg|jpeg|png|gif|svg|ico|css|js)$/)) {
    console.warn(`Static file not found: ${req.url}`);
    return res.status(404).json({
      error: 'File not found',
      requestedFile: req.url,
      message: 'The requested static file does not exist',
      suggestion: 'Check if the file exists in the /public directory',
      debugUrl: '/debug/static'
    });
  }
  next();
});

// ==========================================================================
// Page Routes
// ==========================================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading page');
    }
  });
});

app.get('*', (req, res) => {
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

// ==========================================================================
// Global Error Handler
// ==========================================================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: isProduction ? 'Internal server error' : err.message
  });
});

// ==========================================================================
// Start Server
// ==========================================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MNL-AI Website running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`🔍 Debug static files at: /debug/static`);
  console.log(`🖼️  Debug images at: /debug/images`);
  console.log(`✅ Ready for production deployment`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
    console.log('Server closed successfully');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

module.exports = app;