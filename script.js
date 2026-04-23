document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animation using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible if you only want it to animate once
                // observer.unobserve(entry.target);
            } else {
                // If you want them to fade out when scrolling up, uncomment below
                // entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    // Initial trigger for elements already in viewport (like Hero section)
    setTimeout(() => {
        const heroElements = document.querySelectorAll('#hero .animate-on-scroll');
        heroElements.forEach(el => {
            if (!el.classList.contains('visible')) {
                el.classList.add('visible');
            }
        });
    }, 100);

    // Create Embers
    function createEmbers() {
        const container = document.getElementById('fire-particles');
        if (!container) return;

        const emberCount = 60; // Number of embers

        for (let i = 0; i < emberCount; i++) {
            const ember = document.createElement('div');
            ember.classList.add('ember');
            
            // Randomize properties
            const size = Math.random() * 6 + 2; // 2px to 8px
            const left = Math.random() * 100; // 0% to 100%
            const duration = Math.random() * 4 + 2; // 2s to 6s
            const delay = Math.random() * 5; // 0s to 5s
            const drift = (Math.random() - 0.5) * 150; // drift horizontally

            ember.style.width = `${size}px`;
            ember.style.height = `${size}px`;
            ember.style.left = `${left}%`;
            ember.style.animationDuration = `${duration}s`;
            ember.style.animationDelay = `${delay}s`;
            ember.style.setProperty('--drift', drift);

            container.appendChild(ember);
        }
    }

    createEmbers();
});
