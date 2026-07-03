// ===== UI COMPONENTS =====
// Toast, Navbar, Mobile Menu, FAQ Accordion, Carousel, Stats, Smooth Scroll

// ===== NAVBAR SCROLL EFFECT =====
function initNavbarScroll() {
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    if (!mobileMenuBtn || !mobileMenu) return;
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
    
    // Close mobile menu on link click
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });
}

// ===== TOAST NOTIFICATION =====
function showToast(title, message) {
    if (!toast) return;
    
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// ===== FAQ ACCORDION =====
function initFAQAccordion() {
    document.querySelectorAll('.faq-question').forEach(question => {
        // Remove existing listeners by cloning
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);
        
        newQuestion.addEventListener('click', () => {
            const item = newQuestion.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ===== TESTIMONIALS CAROUSEL =====
function initTestimonialsCarousel() {
    cards = document.querySelectorAll('.testimonial-card');
    totalCards = cards.length;
    cardsPerView = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
    maxSlide = Math.max(0, totalCards - cardsPerView);
    currentSlide = 0;
    
    createCarouselDots();
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.onclick = () => goToSlide(currentSlide - 1);
    }
    if (nextBtn) {
        nextBtn.onclick = () => goToSlide(currentSlide + 1);
    }
    
    // Resize handler
    window.addEventListener('resize', () => {
        cardsPerView = window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
        maxSlide = Math.max(0, totalCards - cardsPerView);
        createCarouselDots();
    });
}

function createCarouselDots() {
    if (!carouselDots) return;
    carouselDots.innerHTML = '';
    const dotsCount = Math.max(1, maxSlide + 1);
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('span');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        carouselDots.appendChild(dot);
    }
}

function updateCarouselDots() {
    document.querySelectorAll('.carousel-dots .dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    if (!cards || cards.length === 0 || !testimonialCarousel) return;
    currentSlide = Math.max(0, Math.min(index, maxSlide));
    const cardWidth = cards[0].offsetWidth + 24;
    testimonialCarousel.scrollTo({
        left: currentSlide * cardWidth,
        behavior: 'smooth'
    });
    updateCarouselDots();
}

// ===== STATS COUNTER ANIMATION =====
function initStatsAnimation() {
    const statsSection = document.getElementById('stats');
    if (!statsSection) return;
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                animateCounters();
            }
        });
    }, { threshold: 0.3 });
    
    statsObserver.observe(statsSection);
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-card-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        if (!target || isNaN(target)) return;
        
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = formatNumber(Math.floor(current));
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = formatNumber(target);
            }
        };
        
        updateCounter();
    });
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target && navbar) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
