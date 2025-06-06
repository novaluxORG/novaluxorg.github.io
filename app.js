document.addEventListener('DOMContentLoaded', function() {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    const loader = document.getElementById('loader');
    const loaderBar = loader.querySelector('.loader-bar');
    const body = document.body;
    body.classList.add('loading');

    let loadProgress = 0;
    const interval = setInterval(() => {
        loadProgress += Math.random() * 10 + 5;
        loadProgress = Math.min(loadProgress, 100);
        loaderBar.style.width = loadProgress + '%';
        if (loadProgress >= 100) {
            clearInterval(interval);
            gsap.to(loader, { 
                opacity: 0, visibility: 'hidden', duration: 0.8, delay:0.3,
                onComplete: () => {
                    loader.style.display = 'none';
                    body.classList.remove('loading');
                    initNovaLux();
                }
            });
        }
    }, 150);

    function initNovaLux() {
        setupNavigation();
        setupHeaderScroll();
        introAnimations(); 
        allScrollAnimations(); // C'est ici que la modification principale a lieu
        setupSectionMarkers();
        setupContactForm();
        setupParticles();
        updateCopyrightYear();
    }

    function setupNavigation() {
        const burgerMenuButton = document.getElementById('burger-menu-button');
        const mobileNav = document.getElementById('mobile-nav-links');
        const mobileNavLinks = mobileNav.querySelectorAll('a.nav-link');
        const allNavLinks = document.querySelectorAll('a.nav-link, .desktop-nav a.nav-link, .mobile-nav-links a.nav-link'); // Simplifié pour inclure .scroll-link implicitement

        function toggleMobileMenu() {
            const isExpanded = burgerMenuButton.getAttribute('aria-expanded') === 'true';
            burgerMenuButton.setAttribute('aria-expanded', String(!isExpanded));
            mobileNav.classList.toggle('open');
            burgerMenuButton.classList.toggle('toggle');
            body.classList.toggle('no-scroll');

            if (mobileNav.classList.contains('open')) {
                gsap.fromTo(mobileNavLinks, 
                           { opacity: 0, y: 20 }, 
                           { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, delay: 0.2, ease: "power2.out" });
            } else {
                gsap.to(mobileNavLinks, { opacity: 0, y: 20, duration: 0.3, stagger: {each: 0.05, from: "end"}, ease: "power2.in" });
            }
        }
        if (burgerMenuButton) burgerMenuButton.addEventListener('click', toggleMobileMenu);

        allNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        lenis.scrollTo(targetElement, { offset: 0 }); // Offset 0 pour aller au tout début de la section
                    }
                    if (mobileNav.classList.contains('open') && window.innerWidth < 992) {
                        toggleMobileMenu();
                    }
                }
            });
        });
    }

    function setupHeaderScroll() {
        ScrollTrigger.create({
            start: "top -70", // Se déclenche un peu après le scroll initial
            end: 99999,
            toggleClass: { className: "scrolled", targets: "#site-header" }
        });
    }
    
    function introAnimations() {
        const heroTitleSpans = document.querySelectorAll(".hero-title span");
        const heroSubtitle = document.querySelector(".hero-subtitle");
        const heroCTA = document.querySelector(".hero-cta");
        const scrollIndicator = document.querySelector(".scroll-indicator-wrapper");
        const tlIntro = gsap.timeline({ defaults: { ease: "power3.out" } });
        tlIntro
            .to(heroTitleSpans, { opacity: 1, y: 0, stagger: 0.2, duration: 1 })
            .to(heroSubtitle, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
            .to(heroCTA, { opacity: 1, scale: 1, duration: 0.7 }, "-=0.4")
            .to(scrollIndicator, { opacity: 1, duration: 0.5 }, "-=0.2");
    }

    function allScrollAnimations() {
        const panels = gsap.utils.toArray(".panel");

        panels.forEach((panel, i) => {
            ScrollTrigger.create({
                trigger: panel,
                start: "top top", 
                pin: true, 
                // pinSpacing: false, // MODIFIÉ : Commenté ou supprimé.
                                    // Par défaut, pinSpacing est true.
                                    // Cela signifie que GSAP ajoutera un espacement
                                    // pour compenser la hauteur de l'élément épinglé,
                                    // permettant à tout son contenu d'être visible avant
                                    // que la section suivante n'apparaisse.
                                    // Ceci résout le problème de rognage.
            });

            const animatedElements = panel.querySelectorAll('.animate-on-scroll:not(.testimonial-item)');
            animatedElements.forEach(el => {
                gsap.fromTo(el,
                    { opacity: 0, y: 60, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 85%", 
                            toggleActions: "play none none none",
                        }
                    }
                );
            });
            
            const testimonialItems = panel.querySelectorAll('.testimonial-item.animate-on-scroll');
            if (testimonialItems.length > 0) {
                 gsap.fromTo(testimonialItems,
                    { opacity: 0, y: 50, scale: 0.9 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.7,
                        stagger: 0.2, 
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: panel.querySelector('.testimonials-grid') || panel, 
                            start: "top 80%",
                            toggleActions: "play none none none",
                        }
                    }
                );
            }

            const textFlowElements = panel.querySelectorAll('.text-flow');
            if (textFlowElements.length > 0) {
                gsap.fromTo(textFlowElements, {
                    opacity: 0, y: 30
                }, {
                    opacity: 1, y: 0, duration: 0.7, stagger: 0.25, ease: "power2.out",
                    scrollTrigger: {
                        trigger: panel, // Déclencher quand le panel (section) entre
                        start: "top 60%", // Un peu avant que le haut du panel atteigne 60% de la fenêtre
                        toggleActions: "play none none none",
                    }
                });
            }
        });

        // Animation spécifique pour la section Phare (si besoin de la garder séparée)
        const phareSection = document.querySelector('#phare');
        if (phareSection) {
            const profilePicContainer = phareSection.querySelector('.phare-image-container');
            const quoteBlock = phareSection.querySelector('blockquote');
            // Note: Ces éléments sont aussi des .animate-on-scroll, donc ils sont déjà animés.
            // Si vous voulez une timeline spécifique pour eux, vous pouvez décommenter ce qui suit
            // et retirer .animate-on-scroll de leurs classes HTML.
            /*
             gsap.timeline({
                scrollTrigger: {
                    trigger: phareSection,
                    start: 'top 60%', // Ajuster selon le besoin
                    toggleActions: "play none none none",
                }
            })
            .fromTo(profilePicContainer, { opacity:0, scale:0.8 }, { opacity:1, scale:1, duration: 0.9, ease:'elastic.out(1, 0.7)' })
            .fromTo(quoteBlock, { opacity:0, y:30 }, { opacity:1, y:0, duration: 0.8, ease:'power2.out' }, "-=0.5");
            */
        }
    }

    function setupSectionMarkers() {
        const sections = gsap.utils.toArray("main section.panel[id]");
        const markerContainer = document.querySelector(".scroll-marker-container");
        const navLinksDesktop = gsap.utils.toArray(".desktop-nav a.nav-link");
        const navLinksMobile = gsap.utils.toArray(".mobile-nav-links a.nav-link");
        // Créez une map pour un accès plus rapide aux textes des tooltips si nécessaire
        const sectionTitlesMap = new Map();
        [...navLinksDesktop, ...navLinksMobile].forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                sectionTitlesMap.set(href.substring(1), link.textContent.trim());
            }
        });


        if (!markerContainer || sections.length === 0) return;
        markerContainer.innerHTML = ''; 

        sections.forEach((section, index) => {
            const dot = document.createElement("div");
            dot.classList.add("scroll-marker-dot");
            dot.dataset.index = index;
            dot.dataset.target = `#${section.id}`;

            const tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");
            
            tooltip.textContent = sectionTitlesMap.get(section.id) || section.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            dot.appendChild(tooltip);
            
            markerContainer.appendChild(dot);

            dot.addEventListener("click", () => {
                lenis.scrollTo(section, { offset: 0 });
            });

            ScrollTrigger.create({
                trigger: section,
                start: "top center", // La section devient active quand son haut atteint le centre de l'écran
                end: "bottom center", // Reste active jusqu'à ce que son bas quitte le centre de l'écran
                toggleClass: { targets: dot, className: "active" },
                onEnter: () => setActiveNavLink(section.id),
                onEnterBack: () => setActiveNavLink(section.id),
            });
        });
        
        // Activer le premier point et lien de nav au chargement si des sections existent
        if(sections.length > 0) {
            const firstDot = markerContainer.querySelector('.scroll-marker-dot[data-index="0"]');
            if(firstDot) firstDot.classList.add('active'); // S'assurer que le premier point est actif
            setActiveNavLink(sections[0].id); // Activer le lien de navigation correspondant
        }
    }
    
    function setActiveNavLink(sectionId) {
        const allHeaderNavLinks = document.querySelectorAll('#site-header .nav-link'); 
        allHeaderNavLinks.forEach(link => {
            link.classList.remove('active');
            // Vérifier si l'attribut href correspond à l'ID de la section
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    function setupContactForm() {
        const contactForm = document.getElementById('novaLuxContactForm');
        const formStatusMessage = document.getElementById('form-status-message');
        const submitButton = contactForm ? contactForm.querySelector('.form-submit-button') : null;

        if (contactForm && submitButton) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const buttonTextSpan = submitButton.querySelector('.button-text');
                const originalButtonText = buttonTextSpan.textContent;
                submitButton.disabled = true;
                submitButton.classList.add('is-loading');
                // Ne pas vider le buttonTextSpan ici, le CSS gère l'opacité
                // buttonTextSpan.textContent = ''; 
                formStatusMessage.textContent = '';
                formStatusMessage.className = 'form-status';

                setTimeout(() => { 
                    const isSuccess = Math.random() > 0.2; 
                    submitButton.classList.remove('is-loading');
                    if (isSuccess) {
                        submitButton.classList.add('is-success');
                        formStatusMessage.textContent = "Votre lumière a été transmise. Nous reviendrons vers vous.";
                        formStatusMessage.classList.add('success');
                        contactForm.reset();
                        setTimeout(() => {
                            submitButton.classList.remove('is-success');
                            // buttonTextSpan.textContent = originalButtonText; // Géré par CSS
                            submitButton.disabled = false;
                        }, 3000);
                    } else {
                        formStatusMessage.textContent = "Une interférence a eu lieu... Veuillez réessayer.";
                        formStatusMessage.classList.add('error');
                        // buttonTextSpan.textContent = originalButtonText; // Géré par CSS
                        submitButton.disabled = false;
                    }
                }, 2000);
            });
        }
    }

    function setupParticles() {
        if (document.getElementById('particles-js')) {
            particlesJS("particles-js", { 
                "particles": { "number": { "value": 60, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#daa520" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 0.7, "opacity_min": 0.1, "sync": false } }, "size": { "value": 2.5, "random": true }, "line_linked": { "enable": true, "distance": 120, "color": "#b8860b", "opacity": 0.25, "width": 1 }, "move": { "enable": true, "speed": 1.2, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false }, "resize": true }, "modes": { "grab": { "distance": 130, "line_linked": { "opacity": 0.5 } } } }, "retina_detect": true
            });
        }
    }

    function updateCopyrightYear() {
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();
    }

});