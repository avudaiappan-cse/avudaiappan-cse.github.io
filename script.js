// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ==========================================
// SMOOTH SCROLLING FOR NAVIGATION LINKS
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ==========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for fade-in animations
document.querySelectorAll('.about, .skills, .projects, .contact').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
});

// Observe feature cards
document.querySelectorAll('.feature-card, .skill-category, .project-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// ==========================================
// CODE TYPING ANIMATION
// ==========================================
const codeElement = document.querySelector('.code-content pre code');
if (codeElement) {
    const originalCode = codeElement.innerHTML;
    let currentIndex = 0;
    const typingSpeed = 10; // milliseconds per character
    
    function typeCode() {
        if (currentIndex < originalCode.length) {
            const char = originalCode.charAt(currentIndex);
            codeElement.innerHTML = originalCode.substring(0, currentIndex + 1);
            currentIndex++;
            
            // Add cursor effect
            codeElement.innerHTML += '<span class="typing-cursor">|</span>';
            
            setTimeout(typeCode, typingSpeed);
        } else {
            // Remove cursor when done
            const cursor = codeElement.querySelector('.typing-cursor');
            if (cursor) cursor.remove();
        }
    }
    
    // Start typing animation when code window is visible
    const codeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && currentIndex === 0) {
                codeElement.innerHTML = '';
                setTimeout(typeCode, 500);
            }
        });
    }, { threshold: 0.5 });
    
    const codeWindow = document.querySelector('.code-window');
    if (codeWindow) {
        codeObserver.observe(codeWindow);
    }
}

// ==========================================
// PERFORMANCE SCORE ANIMATION
// ==========================================
const performanceScore = document.querySelector('.perf-score');
if (performanceScore) {
    const targetScore = 99;
    let currentScore = 0;
    
    const performanceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && currentScore === 0) {
                const increment = () => {
                    if (currentScore < targetScore) {
                        currentScore++;
                        performanceScore.textContent = `${currentScore}/100`;
                        setTimeout(increment, 20);
                    }
                };
                setTimeout(increment, 500);
            }
        });
    }, { threshold: 0.5 });
    
    const perfBadge = document.querySelector('.performance-badge');
    if (perfBadge) {
        performanceObserver.observe(perfBadge);
    }
}

// ==========================================
// STATS COUNTER ANIMATION
// ==========================================
function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 30);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const value = entry.target.querySelector('.stat-value, .exp-value, .metric-value');
            if (value && !value.classList.contains('animated')) {
                value.classList.add('animated');
                const text = value.textContent;
                const number = parseInt(text.match(/\d+/)?.[0] || 0);
                const suffix = text.replace(/\d+/g, '');
                if (number > 0) {
                    value.textContent = '0' + suffix;
                    animateCounter(value, number, suffix);
                }
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat, .exp-stat, .metric').forEach(stat => {
    statsObserver.observe(stat);
});

// ==========================================
// TECH BADGE HOVER EFFECTS
// ==========================================
document.querySelectorAll('.tech-badge, .skill-tag, .tech-tag').forEach(badge => {
    badge.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    badge.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ==========================================
// PROJECT CARD INTERACTIONS
// ==========================================
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const timeline = this.querySelector('.project-timeline');
        if (timeline) {
            timeline.style.background = 'var(--accent-primary)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const timeline = this.querySelector('.project-timeline');
        if (timeline) {
            timeline.style.background = 'var(--border-color)';
        }
    });
});

// ==========================================
// PARALLAX EFFECT FOR HERO BACKGROUND
// ==========================================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero::before');
    if (heroBackground) {
        const parallax = scrolled * 0.5;
        document.querySelector('.hero').style.backgroundPositionY = parallax + 'px';
    }
});

// ==========================================
// DYNAMIC YEAR IN FOOTER
// ==========================================
const yearElement = document.querySelector('.footer-content p');
if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = yearElement.textContent.replace('2025', currentYear);
}

// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .typing-cursor {
        animation: blink 1s step-end infinite;
        color: var(--accent-primary);
    }
`;
document.head.appendChild(style);

// ==========================================
// ACTIVE NAVIGATION HIGHLIGHTING
// ==========================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add active link style
const activeStyle = document.createElement('style');
activeStyle.textContent = `
    .nav-link.active {
        color: var(--text-primary);
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(activeStyle);

// ==========================================
// PRELOAD ANIMATIONS ON PAGE LOAD
// ==========================================
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    
    // Add loading animation to body
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = `
        body {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
    `;
    document.head.appendChild(loadingStyle);
});

// ==========================================
// CONSOLE EASTER EGG
// ==========================================
console.log('%c👋 Hey there!', 'font-size: 24px; font-weight: bold; color: #8b5cf6;');
console.log('%cInterested in the code? Check out the repo!', 'font-size: 14px; color: #a0a0b0;');
console.log('%c🚀 Built with HTML, CSS, and vanilla JavaScript', 'font-size: 12px; color: #6b7280;');

// ==========================================
// CONTACT FORM HANDLING
// ==========================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        formMessage.style.display = 'none';
        
        try {
            const formData = new FormData(contactForm);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Success message
                formMessage.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
                formMessage.className = 'form-message success';
                formMessage.style.display = 'block';
                
                // Reset form
                contactForm.reset();
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Error message
            formMessage.textContent = '❌ Oops! Something went wrong. Please try again or email me directly.';
            formMessage.className = 'form-message error';
            formMessage.style.display = 'block';
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
}

// ==========================================
// MOBILE MENU (Optional Enhancement)
// ==========================================
// Uncomment if you want to add a mobile menu
/*
const mobileMenuBtn = document.createElement('button');
mobileMenuBtn.classList.add('mobile-menu-btn');
mobileMenuBtn.innerHTML = '☰';
mobileMenuBtn.style.display = 'none';

const navButtons = document.querySelector('.nav-buttons');
navButtons.insertBefore(mobileMenuBtn, navButtons.firstChild);

const mobileMenuStyle = document.createElement('style');
mobileMenuStyle.textContent = `
    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: block;
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
        }
    }
`;
document.head.appendChild(mobileMenuStyle);

mobileMenuBtn.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});
*/

console.log('Portfolio website loaded successfully! 🎉');
