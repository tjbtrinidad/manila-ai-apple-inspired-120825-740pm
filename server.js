/**
 * MNL-AI Premium Website Server v2 - Fixed Static Serving
 * Serves /public as web root, fixes image loading issues
 */

const path = require("path");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ==========================================================================
// Middleware Configuration
// ==========================================================================

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// ==========================================================================
// Static File Serving - FIXED
// ==========================================================================

// Serve all files from /public as web root with proper caching
app.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    
    // Set proper MIME types and caching
    if (/\.(png|jpg|jpeg|webp|svg|ico)$/i.test(ext)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else if (/\.(css|js)$/i.test(ext)) {
      res.setHeader("Cache-Control", "public, max-age=604800");
    } else {
      res.setHeader("Cache-Control", "no-cache");
    }
  }
}));

// Explicit /assets mounting for double coverage
app.use("/assets", express.static(path.join(__dirname, "public", "assets"), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (/\.(png|jpg|jpeg|webp|svg|ico)$/i.test(ext)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
}));

// ==========================================================================
// API Routes
// ==========================================================================

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ 
    status: "OK", 
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

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

// Debug endpoint to check file structure
app.get('/debug/files', (req, res) => {
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
    const criticalFiles = [
      '/index.html',
      '/style.css', 
      '/script.js',
      '/assets/hero/hero-desktop.jpg',
      '/assets/cards/website_creation_desktop.png',
      '/assets/steps/bg_for3steps.png'
    ];
    
    const fileStatus = criticalFiles.map(file => {
      const exists = files.some(f => f.url === file);
      return { file, exists, status: exists ? '✅' : '❌' };
    });
    
    res.json({
      message: 'File structure check',
      publicPath,
      totalFiles: files.length,
      criticalFiles: fileStatus,
      allFiles: files.slice(0, 30)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Cannot read public directory',
      message: error.message,
      publicPath
    });
  }
});

// ==========================================================================
// Catch-all Route (SPA Support)
// ==========================================================================

// Serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found'
    });
  }

  res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).send(`
        <h1>File Not Found</h1>
        <p>Could not find index.html in /public directory</p>
        <p>Make sure to move index.html to /public/index.html</p>
        <a href="/debug/files">Check file structure</a>
      `);
    }
  });
});

// ==========================================================================
// Error Handling
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

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MNL-AI Website running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving /public as web root`);
  console.log(`🔍 Debug files at: /debug/files`);
  console.log(`✅ Ready for production deployment`);
});

// Graceful shutdown
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