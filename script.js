/**
 * MNL-AI Premium Website JavaScript - Apple-inspired Performance
 * Built by Tristan Trinidad - Fixed Image Loading Issues
 */

// ==========================================================================
// Application State
// ==========================================================================

const app = {
  initialized: false,
  theme: localStorage.getItem('theme') || 'light',
  
  init() {
    if (this.initialized) return;
    
    console.log('🚀 MNL-AI Website initializing...');
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', this.theme);
    
    // Initialize components
    this.setupLoadingScreen();
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupScrollAnimations();
    this.setupContactForm();
    this.setupModalHandlers();
    this.setupSmoothScrolling();
    this.setupCounterAnimations();
    this.setupImageLoadingFixes();
    this.setupPerformanceOptimizations();
    
    // Mark as initialized
    this.initialized = true;
    console.log('✅ MNL-AI Website ready');
  }
};

// ==========================================================================
// Loading Screen
// ==========================================================================

app.setupLoadingScreen = function() {
  const loadingScreen = document.getElementById('loading-screen');
  
  if (!loadingScreen) return;

  // Hide loading screen after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      document.body.classList.remove('loading');
      
      // Trigger initial animations
      this.triggerInitialAnimations();
    }, 300);
  });
};

app.triggerInitialAnimations = function() {
  // Reveal hero elements immediately after loading
  const heroElements = document.querySelectorAll('.hero [data-reveal]');
  heroElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('revealed');
    }, index * 100);
  });
};

// ==========================================================================
// Image Loading Fixes - CRITICAL
// ==========================================================================

app.setupImageLoadingFixes = function() {
  console.log('🖼️ Setting up image loading fixes...');
  
  // Force all images to be visible immediately
  const forceImageVisibility = () => {
    const allImages = document.querySelectorAll('img, picture, svg');
    allImages.forEach(img => {
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.style.display = img.tagName === 'IMG' ? 'block' : '';
      
      // Remove any lazy loading that might be interfering
      if (img.loading) {
        img.loading = 'eager';
      }
    });
    
    // Force background images to be visible
    const sectionsWithBg = document.querySelectorAll('.hero, .process, .steps');
    sectionsWithBg.forEach(section => {
      section.style.opacity = '1';
      section.style.visibility = 'visible';
    });
    
    console.log(`✅ Fixed visibility for ${allImages.length} images`);
  };
  
  // Apply fixes immediately and after DOM loads
  forceImageVisibility();
  document.addEventListener('DOMContentLoaded', forceImageVisibility);
  
  // Enhanced image loading with error handling
  const images = document.querySelectorAll('img');
  let loadedImages = 0;
  let totalImages = images.length;
  
  images.forEach((img, index) => {
    // Create a new image to test loading
    const testImg = new Image();
    
    testImg.onload = () => {
      loadedImages++;
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.classList.add('loaded');
      console.log(`✅ Image ${index + 1}/${totalImages} loaded: ${img.src}`);
    };
    
    testImg.onerror = () => {
      loadedImages++;
      console.warn(`❌ Image ${index + 1}/${totalImages} failed to load: ${img.src}`);
      // Show a placeholder or hide the broken image
      img.style.display = 'none';
      img.setAttribute('alt', 'Image not available');
    };
    
    // Set source to trigger loading
    testImg.src = img.src;
    
    // For images that are already loaded
    if (img.complete && img.naturalHeight !== 0) {
      loadedImages++;
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.classList.add('loaded');
    }
  });
  
  // Check background images
  this.checkBackgroundImages();
};

app.checkBackgroundImages = function() {
  const bgElements = [
    { selector: '.hero', expectedBg: '/assets/hero/hero-desktop.jpg' },
    { selector: '.process', expectedBg: '/assets/steps/bg_for3steps.png' }
  ];
  
  bgElements.forEach(({ selector, expectedBg }) => {
    const element = document.querySelector(selector);
    if (element) {
      // Test if background image loads
      const testImg = new Image();
      testImg.onload = () => {
        console.log(`✅ Background image loaded for ${selector}: ${expectedBg}`);
        element.style.opacity = '1';
        element.style.visibility = 'visible';
      };
      testImg.onerror = () => {
        console.warn(`❌ Background image failed for ${selector}: ${expectedBg}`);
      };
      testImg.src = expectedBg;
    }
  });
};

// ==========================================================================
// Navigation
// ==========================================================================

app.setupNavigation = function() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (!navbar || !mobileToggle || !navMenu) return;

  // Scroll effect for navbar with throttling
  let scrollTimeout;
  let lastScrollY = window.scrollY;
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    // Add/remove scrolled class
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Hide/show navbar on scroll (optional enhancement)
    if (scrollY > lastScrollY && scrollY > 200) {
      navbar.style.transform = 'translateY(-100%)';
    } else {
      navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollY = scrollY;
  };

  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll, 10);
  }, { passive: true });

  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    const isActive = mobileToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isActive ? 'hidden' : '';
    
    // Accessibility
    mobileToggle.setAttribute('aria-expanded', isActive);
  });

  // Close menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });
};

// ==========================================================================
// Theme Toggle
// ==========================================================================

app.setupThemeToggle = function() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.querySelector('.theme-icon');
  
  if (!themeToggle || !themeIcon) return;
  
  // Update icon based on current theme
  const updateThemeIcon = (theme) => {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };
  
  // Set initial icon
  updateThemeIcon(this.theme);

  themeToggle.addEventListener('click', () => {
    // Toggle theme
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    
    // Add switching animation
    themeToggle.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      // Apply theme
      document.documentElement.setAttribute('data-theme', this.theme);
      localStorage.setItem('theme', this.theme);
      updateThemeIcon(this.theme);
      
      // Reset transform
      themeToggle.style.transform = '';
      
      // Announce theme change for screen readers
      this.announceThemeChange(this.theme);
    }, 150);
  });
};

app.announceThemeChange = function(theme) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.textContent = `Switched to ${theme} mode`;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// ==========================================================================
// Scroll Animations
// ==========================================================================

app.setupScrollAnimations = function() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  
  if (revealElements.length === 0) return;

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  // Intersection Observer for reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay ? parseFloat(entry.target.dataset.delay) * 1000 : 0;
        
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Skip hero elements (handled separately)
  revealElements.forEach(el => {
    if (!el.closest('.hero')) {
      observer.observe(el);
    }
  });
};

// ==========================================================================
// Counter Animations
// ==========================================================================

app.setupCounterAnimations = function() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  if (statNumbers.length === 0) return;

  let hasAnimated = false;

  const animateCounters = () => {
    if (hasAnimated) return;
    hasAnimated = true;

    statNumbers.forEach(number => {
      const finalText = number.textContent.trim();
      let targetValue;
      let prefix = '';
      let suffix = '';
      
      // Parse the final text to extract number and formatting
      if (finalText.includes('20')) {
        targetValue = 20;
        suffix = '+';
      } else if (finalText.includes('7-14')) {
        targetValue = 14;
        prefix = '7-';
      } else if (finalText.includes('100')) {
        targetValue = 100;
        suffix = '%';
      } else {
        targetValue = parseInt(finalText.replace(/[^\d]/g, ''));
        if (finalText.includes('+')) suffix = '+';
        if (finalText.includes('%')) suffix = '%';
      }
      
      if (isNaN(targetValue)) return;
      
      // Animation settings
      let current = 0;
      const duration = 2000;
      const startTime = Date.now();

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out-quart)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        current = targetValue * easeOutQuart;
        
        let displayValue = Math.floor(current);
        let displayText = prefix + displayValue + suffix;
        
        // Special case for range
        if (finalText.includes('7-14') && targetValue === 14) {
          displayText = '7-14';
        }
        
        number.textContent = displayText;
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          // Set final text
          number.textContent = finalText;
        }
      };

      updateCounter();
    });
  };

  // Trigger animation when stats section comes into view
  const statsSection = document.querySelector('.hero-stats');
  
  if (statsSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(animateCounters, 500);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
  } else {
    // Fallback: animate after delay
    setTimeout(animateCounters, 1500);
  }
};

// ==========================================================================
// Contact Form
// ==========================================================================

app.setupContactForm = function() {
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const successModal = document.getElementById('success-modal');
  
  if (!contactForm || !submitBtn) return;

  // Form validation
  const validateForm = (data) => {
    const errors = [];
    
    if (!data.name || data.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!data.business || data.business.length < 2) {
      errors.push('Business name must be at least 2 characters long');
    }
    
    if (!data.message || data.message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
  };

  // Show validation errors
  const showErrors = (errors) => {
    // Remove existing error messages
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    
    errors.forEach(error => {
      const errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      errorEl.style.color = '#ef4444';
      errorEl.style.fontSize = '0.875rem';
      errorEl.style.marginTop = '0.5rem';
      errorEl.textContent = error;
      
      // Insert after the form
      contactForm.appendChild(errorEl);
    });
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Remove previous errors
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Validate form
    const errors = validateForm(data);
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }
    
    // Disable submit button and show loading state
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
    submitBtn.style.opacity = '0.7';
    
    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success modal
        if (successModal) {
          successModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        
        // Reset form
        contactForm.reset();
        
        // Analytics tracking
        this.trackEvent('form_submission', {
          form_type: 'contact',
          success: true
        });
      } else {
        throw new Error(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      showErrors([error.message || 'Failed to send message. Please try again.']);
      
      // Analytics tracking
      this.trackEvent('form_submission', {
        form_type: 'contact',
        success: false,
        error: error.message
      });
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      submitBtn.style.opacity = '1';
    }
  });
};

// ==========================================================================
// Modal Handlers
// ==========================================================================

app.setupModalHandlers = function() {
  const successModal = document.getElementById('success-modal');
  const modalClose = document.getElementById('modal-close');
  const modalOk = document.getElementById('modal-ok');
  
  if (!successModal) return;

  const closeModal = () => {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Focus management
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.focus();
  };

  // Close button
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  // OK button
  if (modalOk) {
    modalOk.addEventListener('click', closeModal);
  }
  
  // Click outside to close
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      closeModal();
    }
  });
  
  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal.classList.contains('active')) {
      closeModal();
    }
  });
};

// ==========================================================================
// Smooth Scrolling
// ==========================================================================

app.setupSmoothScrolling = function() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      if (href === '#') return;
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        const navbarHeight = document.getElementById('navbar')?.offsetHeight || 80;
        const targetPosition = target.offsetTop - navbarHeight;
        
        // Smooth scroll with custom easing
        this.smoothScrollTo(targetPosition, 800);
        
        // Analytics tracking
        this.trackEvent('navigation', {
          type: 'anchor_click',
          target: href
        });
      }
    });
  });
};

app.smoothScrollTo = function(targetPosition, duration = 800) {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const startTime = Date.now();

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };

  const animateScroll = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = easeInOutCubic(progress);
    
    window.scrollTo(0, startPosition + distance * ease);
    
    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

// ==========================================================================
// Performance Optimizations
// ==========================================================================

app.setupPerformanceOptimizations = function() {
  // Preload critical resources
  this.preloadCriticalResources();
  
  // Setup performance monitoring
  this.setupPerformanceMonitoring();
  
  // Optimize scroll performance
  this.optimizeScrollPerformance();
};

app.preloadCriticalResources = function() {
  // Preload critical images that might not be visible initially
  const criticalImages = [
    '/assets/hero/hero-desktop.jpg',
    '/assets/cards/website_creation_desktop.png',
    '/assets/steps/bg_for3steps.png'
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
  
  console.log('🚀 Preloaded critical images');
};

app.setupPerformanceMonitoring = function() {
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry.duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.log('Performance Observer not fully supported');
    }
  }
};

app.optimizeScrollPerformance = function() {
  // Use passive listeners for scroll events
  let scrollTimer = null;
  
  window.addEventListener('scroll', () => {
    if (scrollTimer !== null) {
      clearTimeout(scrollTimer);
    }
    
    scrollTimer = setTimeout(() => {
      // Batch DOM reads/writes
      this.batchScrollUpdates();
    }, 16); // ~60fps
  }, { passive: true });
};

app.batchScrollUpdates = function() {
  // Batch DOM measurements
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  
  // Update navbar state
  const navbar = document.getElementById('navbar');
  if (navbar) {
    requestAnimationFrame(() => {
      navbar.style.setProperty('--scroll-y', scrollY + 'px');
    });
  }
};

// ==========================================================================
// Analytics & Tracking
// ==========================================================================

app.trackEvent = function(eventName, properties = {}) {
  // Basic event tracking (can be enhanced with actual analytics)
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, properties);
  }
  
  console.log('Event tracked:', eventName, properties);
};

// ==========================================================================
// Error Handling & Debugging
// ==========================================================================

app.setupErrorHandling = function() {
  window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
    this.trackEvent('javascript_error', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    this.trackEvent('promise_rejection', {
      reason: e.reason?.toString()
    });
  });
};

// ==========================================================================
// Image Fallback System
// ==========================================================================

app.setupImageFallbacks = function() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    img.addEventListener('error', function() {
      console.warn('Image failed to load:', this.src);
      
      // Hide the image or show a placeholder
      this.style.display = 'none';
      
      // You could also set a fallback image here:
      // this.src = '/assets/placeholder.jpg';
    });
  });
};

// ==========================================================================
// Utility Functions
// ==========================================================================

// Debounce function for performance
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Device detection
const isMobile = () => window.innerWidth <= 768;
const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
const isDesktop = () => window.innerWidth > 1024;

// ==========================================================================
// Initialize Application
// ==========================================================================

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  app.init();
  app.setupErrorHandling();
  app.setupImageFallbacks();
  
  // Remove loading class from body
  document.body.classList.remove('loading');
  
  console.log('📱 Device:', isMobile() ? 'Mobile' : isTablet() ? 'Tablet' : 'Desktop');
});

// Additional setup after full page load
window.addEventListener('load', () => {
  // Performance measurement
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('⚡ Page load time:', Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms');
  }
  
  // Final image visibility check
  app.setupImageLoadingFixes();
  
  console.log('🎉 MNL-AI Website fully loaded and optimized');
});

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('📄 Page hidden');
  } else {
    console.log('📄 Page visible');
    // Re-check images when page becomes visible
    app.setupImageLoadingFixes();
  }
});

// Export for external use and debugging
window.MNL_AI = {
  app,
  utils: {
    debounce,
    throttle,
    isMobile,
    isTablet,
    isDesktop
  }
};