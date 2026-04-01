/* ==========================================================================
   Minimal Portfolio JavaScript
   Modern interactions and smooth scrolling
   ========================================================================== */

(function() {
  'use strict';

  // ==========================================================================
  // Configuration
  // ==========================================================================

  const CONFIG = {
    // Navigation
    navActiveClass: 'active',
    navScrolledClass: 'scrolled',
    
    // Smooth scrolling
    scrollDuration: 800,
    scrollEasing: 'easeInOutCubic',
    
    // Intersection Observer
    observerThreshold: 0.1,
    observerRootMargin: '-50px 0px -50px 0px',
    
    // Debounce timing
    debounceDelay: 100,
    
    // Breakpoints
    mobileBreakpoint: 768
  };

  // ==========================================================================
  // Utility Functions
  // ==========================================================================

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

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animateScroll = (startTime, startPosition, targetPosition, duration) => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);
    
    window.scrollTo(0, startPosition + (targetPosition - startPosition) * easeProgress);
    
    if (progress < 1) {
      requestAnimationFrame(() => animateScroll(startTime, startPosition, targetPosition, duration));
    }
  };

  // ==========================================================================
  // Navigation
  // ==========================================================================

  class Navigation {
    constructor() {
      this.nav = document.querySelector('.nav');
      this.navToggle = document.querySelector('.nav-toggle');
      this.navMenu = document.querySelector('.nav-menu');
      this.navLinks = document.querySelectorAll('.nav-link');
      this.isMenuOpen = false;
      
      this.init();
    }

    init() {
      this.setupEventListeners();
      this.setupScrollListener();
      this.setupActiveLinkTracking();
    }

    setupEventListeners() {
      // Mobile menu toggle
      if (this.navToggle) {
        this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
      }

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (this.isMenuOpen && !this.nav.contains(e.target)) {
          this.closeMobileMenu();
        }
      });

      // Handle escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isMenuOpen) {
          this.closeMobileMenu();
        }
      });

      // Smooth scrolling for navigation links
      this.navLinks.forEach(link => {
        link.addEventListener('click', (e) => this.handleNavLinkClick(e));
      });
    }

    setupScrollListener() {
      let lastScrollY = window.scrollY;
      
      const handleScroll = debounce(() => {
        const currentScrollY = window.scrollY;
        
        // Add scrolled class to navigation
        if (currentScrollY > 50) {
          this.nav.classList.add(CONFIG.navScrolledClass);
        } else {
          this.nav.classList.remove(CONFIG.navScrolledClass);
        }
        
        lastScrollY = currentScrollY;
      }, CONFIG.debounceDelay);

      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    setupActiveLinkTracking() {
      const sections = document.querySelectorAll('section[id]');
      
      const observerOptions = {
        threshold: CONFIG.observerThreshold,
        rootMargin: CONFIG.observerRootMargin
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.updateActiveLink(entry.target.id);
          }
        });
      }, observerOptions);

      sections.forEach(section => observer.observe(section));
    }

    toggleMobileMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      this.updateMenuState();
    }

    closeMobileMenu() {
      this.isMenuOpen = false;
      this.updateMenuState();
    }

    updateMenuState() {
      if (this.navMenu) {
        this.navMenu.classList.toggle(CONFIG.navActiveClass, this.isMenuOpen);
      }
      
      if (this.navToggle) {
        this.navToggle.setAttribute('aria-expanded', this.isMenuOpen);
      }
    }

    handleNavLinkClick(e) {
      const href = e.currentTarget.getAttribute('href');
      
      // Only handle internal links
      if (href.startsWith('#')) {
        e.preventDefault();
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          this.scrollToElement(targetElement);
          this.closeMobileMenu();
        }
      }
    }

    scrollToElement(element) {
      const startPosition = window.pageYOffset;
      const targetPosition = element.offsetTop - 80; // Account for fixed nav
      const startTime = Date.now();
      
      animateScroll(startTime, startPosition, targetPosition, CONFIG.scrollDuration);
    }

    updateActiveLink(activeId) {
      this.navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${activeId}`) {
          link.classList.add(CONFIG.navActiveClass);
        } else {
          link.classList.remove(CONFIG.navActiveClass);
        }
      });
    }
  }

  // ==========================================================================
  // Scroll Animations
  // ==========================================================================

  class ScrollAnimations {
    constructor() {
      this.animatedElements = document.querySelectorAll('[data-animate]');
      this.observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      this.init();
    }

    init() {
      if (this.animatedElements.length === 0) return;
      
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
          }
        });
      }, this.observerOptions);

      this.animatedElements.forEach(element => {
        this.observer.observe(element);
      });
    }

    animateElement(element) {
      const animationType = element.dataset.animate || 'fade-in';
      const delay = element.dataset.delay || 0;
      
      setTimeout(() => {
        element.classList.add('animate', animationType);
      }, delay);
      
      this.observer.unobserve(element);
    }
  }

  // ==========================================================================
  // Performance Optimization
  // ==========================================================================

  class PerformanceOptimizer {
    constructor() {
      this.init();
    }

    init() {
      this.lazyLoadImages();
      this.preloadCriticalResources();
    }

    lazyLoadImages() {
      const images = document.querySelectorAll('img[data-src]');
      
      if (images.length === 0) return;
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
      });
    }

    preloadCriticalResources() {
      // Preload fonts that might be needed
      const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
      fontLinks.forEach(link => {
        const font = new FontFace(link.href.split('/').pop(), `url(${link.href})`);
        font.load().then(loadedFont => {
          document.fonts.add(loadedFont);
        });
      });
    }
  }

  // ==========================================================================
  // Theme Management
  // ==========================================================================

  class ThemeManager {
    constructor() {
      this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
      this.init();
    }

    init() {
      this.applyTheme(this.currentTheme);
      this.setupThemeToggle();
    }

    getStoredTheme() {
      return localStorage.getItem('theme');
    }

    getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      this.currentTheme = theme;
      localStorage.setItem('theme', theme);
    }

    setupThemeToggle() {
      // This can be expanded to add a theme toggle button
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  class ErrorHandler {
    constructor() {
      this.init();
    }

    init() {
      window.addEventListener('error', this.handleError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }

    handleError(event) {
      console.error('JavaScript Error:', event.error);
      // In production, you might want to send this to an error tracking service
    }

    handlePromiseRejection(event) {
      console.error('Unhandled Promise Rejection:', event.reason);
      // In production, you might want to send this to an error tracking service
    }
  }

  // ==========================================================================
  // Application Initialization
  // ==========================================================================

  class App {
    constructor() {
      this.components = {};
      this.init();
    }

    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    }

    start() {
      try {
        // Initialize components
        this.components.navigation = new Navigation();
        this.components.scrollAnimations = new ScrollAnimations();
        this.components.performanceOptimizer = new PerformanceOptimizer();
        this.components.themeManager = new ThemeManager();
        this.components.errorHandler = new ErrorHandler();

        // Add loading complete class for CSS transitions
        document.body.classList.add('loaded');
        
        console.log('Portfolio application initialized successfully');
      } catch (error) {
        console.error('Failed to initialize application:', error);
      }
    }
  }

  // ==========================================================================
  // Start the Application
  // ==========================================================================

  // Initialize the app when this script loads
  const portfolioApp = new App();

  // Expose useful functions for external use
  window.PortfolioApp = {
    scrollToElement: (elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        const startPosition = window.pageYOffset;
        const targetPosition = element.offsetTop - 80;
        const startTime = Date.now();
        animateScroll(startTime, startPosition, targetPosition, CONFIG.scrollDuration);
      }
    },
    toggleMobileMenu: () => {
      if (portfolioApp.components.navigation) {
        portfolioApp.components.navigation.toggleMobileMenu();
      }
    }
  };

})();
