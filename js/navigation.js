// Enhanced Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize elements
    const mobileMenuButton = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.querySelector('.navbar');
    const reportButtons = document.querySelectorAll('.report-btn, .nav-button');
    const navLinks = document.querySelectorAll('.nav-link');
    let lastScrollPos = 0;
    let scrollTimer;
    const scrollThreshold = 50;

    // Mobile menu toggle with animation
    if (mobileMenuButton && navMenu) {
        mobileMenuButton.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            mobileMenuButton.setAttribute('aria-expanded', 
                mobileMenuButton.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'
            );
        });
    }

    // Enhanced menu closing behavior
    document.addEventListener('click', (e) => {
        if (navMenu?.classList.contains('active')) {
            if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-toggle')) {
                closeMenu();
            }
        }
    });

    // Escape key to close menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
            closeMenu();
        }
    });

    // Smart active link highlighting
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentHash && href === currentHash)) {
            link.classList.add('active');
        }

        // Add hover animation class
        link.addEventListener('mouseenter', () => {
            link.classList.add('link-hover');
        });
        link.addEventListener('mouseleave', () => {
            link.classList.remove('link-hover');
        });
    });

    // Enhanced smooth scroll with offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                smoothScrollToTarget(target);
                updateActiveLink(this);
                closeMenu();
            }
        });
    });

    // Report button click handler
    reportButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const event = new CustomEvent('showReportForm');
            document.dispatchEvent(event);
        });
    });

    // Advanced scroll-based navbar styling
    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        updateActiveSection();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            closeMenu();
        }
    });

    // Helper Functions
    function closeMenu() {
        if (navMenu) {
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            if (mobileMenuButton) {
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        }
    }

    function smoothScrollToTarget(target) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        
        window.scrollTo({
            top: targetPosition - navHeight - 20,
            behavior: 'smooth'
        });

        // Update URL hash without jumping
        history.pushState(null, '', `#${target.id}`);
    }

    function updateActiveLink(clickedLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    function handleNavbarScroll() {
        const currentScroll = window.pageYOffset;

        // Add scrolled class for styling
        if (currentScroll > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Handle navbar show/hide
        if (currentScroll <= 0) {
            navbar.classList.remove('scroll-up', 'scroll-down');
        } else if (currentScroll > lastScrollPos && !navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-up');
            navbar.classList.add('scroll-down');
        } else if (currentScroll < lastScrollPos && navbar.classList.contains('scroll-down')) {
            navbar.classList.remove('scroll-down');
            navbar.classList.add('scroll-up');
        }

        lastScrollPos = currentScroll;
    }

    function updateActiveSection() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            const scrollPosition = window.scrollY + navbar.offsetHeight + 50;
            
            document.querySelectorAll('section[id]').forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${section.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, 100);
    }
});
