document.addEventListener('DOMContentLoaded', function() {
  // Theme Toggle Functionality
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme');
  
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
  
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      localStorage.setItem('theme', 'light');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Mobile menu toggle
  const navTrigger = document.getElementById('nav-trigger');
  const menuIcon = document.querySelector('.menu-icon');
  
  navTrigger.addEventListener('change', function() {
    if (this.checked) {
      menuIcon.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      menuIcon.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Close mobile menu when clicking on a link
  document.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        navTrigger.checked = false;
        menuIcon.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
  
  // Lazy loading images
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  }
  
  // Featured posts carousel navigation
  const carousel = document.getElementById('featured-carousel');
  if (carousel) {
    let isDown = false;
    let startX;
    let scrollLeft;
    
    carousel.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.style.cursor = 'grabbing';
      carousel.style.scrollBehavior = 'auto';
    });
    
    carousel.addEventListener('mouseleave', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
    });
    
    carousel.addEventListener('mouseup', () => {
      isDown = false;
      carousel.style.cursor = 'grab';
      carousel.style.scrollBehavior = 'smooth';
    });
    
    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2;
      carousel.scrollLeft = scrollLeft - walk;
    });
    
    // Touch events for mobile
    carousel.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.style.scrollBehavior = 'auto';
    });
    
    carousel.addEventListener('touchend', () => {
      isDown = false;
      carousel.style.scrollBehavior = 'smooth';
    });
    
    carousel.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.touches[0].pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2;
      carousel.scrollLeft = scrollLeft - walk;
    });
  }
  
  // Reading time calculation
  document.querySelectorAll('.post-card-content').forEach(card => {
    const text = card.textContent || card.innerText;
    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 wpm
    
    const readingTimeElement = card.querySelector('.reading-time');
    if (readingTimeElement) {
      readingTimeElement.textContent = `${readingTime} min read`;
    }
  });
  
  // Newsletter form submission
  const newsletterForm = document.querySelector('.newsletter form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();
      
      if (email && validateEmail(email)) {
        // Here you would typically send the data to your server
        alert('Thanks for subscribing! You\'ll hear from us soon.');
        emailInput.value = '';
      } else {
        alert('Please enter a valid email address.');
      }
    });
  }
  
  // Email validation helper
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // Progressive enhancement: Add class to body when JS is loaded
  document.body.classList.add('js-loaded');
});