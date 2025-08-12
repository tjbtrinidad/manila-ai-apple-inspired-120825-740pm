/**
 * MNL-AI Premium Website JavaScript - Streamlined Version
 * Built by Tristan Trinidad
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
    }, 500);
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

  // Scroll effect for navbar
  let scrollTimeout;
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    if (scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll, 10);
  });

  // Mobile menu toggle
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close menu when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
      mobileToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
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
    }, 150);
  });
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
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
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
      
      // Determine target value based on text content
      if (finalText.includes('20')) {
        targetValue = 20;
      } else if (finalText.includes('7-14')) {
        targetValue = 14;
      } else if (finalText.includes('100')) {
        targetValue = 100;
      } else {
        targetValue = parseInt(finalText.replace(/[^\d]/g, ''));
      }
      
      if (isNaN(targetValue)) return;
      
      // Animation settings
      let current = 0;
      const duration = 2000;
      const startTime = Date.now();
      const isPercentage = finalText.includes('%');
      const isRange = finalText.includes('-');
      const hasPlus = finalText.includes('+');

      const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        current = targetValue * easeOutQuart;
        
        let displayValue = Math.floor(current);
        let displayText = displayValue.toString();
        
        // Format based on original text
        if (isRange && targetValue === 14) {
          displayText = '7-14';
        } else if (isPercentage) {
          displayText = displayValue + '%';
        } else if (hasPlus) {
          displayText = displayValue + '+';
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
    setTimeout(animateCounters, 1000);
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

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    if (!data.name || !data.email || !data.message) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    
    // Disable submit button
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
    
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
      } else {
        throw new Error(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      alert('Error: ' + error.message);
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
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
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
};

// ==========================================================================
// FAQ Toggle Enhancement
// ==========================================================================

app.setupFAQToggle = function() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const summary = item.querySelector('summary');
    
    if (summary) {
      summary.addEventListener('click', (e) => {
        // Allow default behavior but add smooth animation class
        setTimeout(() => {
          if (item.hasAttribute('open')) {
            item.classList.add('opening');
          } else {
            item.classList.remove('opening');
          }
        }, 0);
      });
    }
  });
};

// ==========================================================================
// Performance Optimizations
// ==========================================================================

// Debounce function for scroll events
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

// Lazy load images
const setupLazyLoading = () => {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.src; // Trigger loading
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
};

// ==========================================================================
// Error Handling
// ==========================================================================

window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});

// ==========================================================================
// Initialize Application
// ==========================================================================

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  app.init();
  setupLazyLoading();
  
  // Remove loading class from body
  document.body.classList.remove('loading');
});

// Additional setup after full page load
window.addEventListener('load', () => {
  // Any additional setup that requires full page load
  console.log('🎉 MNL-AI Website fully loaded');
});

// Export for potential external use
window.MNL_AI = app;