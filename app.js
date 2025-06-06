document.addEventListener('DOMContentLoaded', function() {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // wrapper: document.body, // Default is window
        // content: document.documentElement, // Default
        // wheelEventsTarget: window, // Default
        // smoothWheel: true, // Default true
        // smoothTouch: true, // Default false, enable for better touch
        // touchMultiplier: 1.5, // Adjust touch sensitivity
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
                    // body.style.overflow = 'visible'; // Lenis gère le scroll, body peut rester overflow:hidden
                    initNovaLux();
                }
            });
        }
    }, 150);

    function initNovaLux() {
        setupNavigation();
        setupHeaderScroll();
        allScrollAnimations(); // IMPORTANT: Cette fonction configure le pinning des sections
        introAnimations(); 
        setupSectionMarkers(); // Doit être appelé APRÈS que allScrollAnimations ait défini les positions
        setupContactForm();
        setupParticles();
        updateCopyrightYear();
    }

    function setupNavigation() {
        const burgerMenuButton = document.getElementById('burger-menu-button');
        const mobileNav = document.getElementById('mobile-nav-links');
        const mobileNavLinks = mobileNav.querySelectorAll('a.nav-link');
        const allNavLinks = document.querySelectorAll('a.nav-link.scroll-link, .desktop-nav a.nav-link, .mobile-nav-links a.nav-link');

        function toggleMobileMenu() {
            const isExpanded = burgerMenuButton.getAttribute('aria-expanded') === 'true';
            burgerMenuButton.setAttribute('aria-expanded', String(!isExpanded));
            mobileNav.classList.toggle('open');
            burgerMenuButton.classList.toggle('toggle');
            body.classList.toggle('no-scroll'); // Conserve pour bloquer le scroll de Lenis si menu ouvert

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
                        lenis.scrollTo(targetElement, { 
                            offset: 0, // Ajuster si header est opaque et non fixe/overlay
                            duration: 1.5, 
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
                        });
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
            start: "top -70", end: 99999,
            toggleClass: { className: "scrolled", targets: "#site-header" }
        });
    }
    
    function introAnimations() {
        const heroTitleSpans = document.querySelectorAll(".hero-title span");
        const heroSubtitle = document.querySelector(".hero-subtitle");
        const heroCTA = document.querySelector(".hero-cta");
        const scrollIndicator = document.querySelector(".scroll-indicator-wrapper");
        
        // S'assurer que les animations d'intro ne se lancent qu'après le fondu du loader
        // et potentiellement après la mise en place des ScrollTriggers si elles dépendent de la position de scroll initiale.
        // Ici, elles sont déclenchées au chargement, ce qui est ok pour le hero.
        const tlIntro = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.5 }); // Léger délai post-loader
        tlIntro
            .to(heroTitleSpans, { opacity: 1, y: 0, stagger: 0.2, duration: 1 })
            .to(heroSubtitle, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
            .to(heroCTA, { opacity: 1, scale: 1, duration: 0.7 }, "-=0.4")
            .to(scrollIndicator, { opacity: 1, duration: 0.5 }, "-=0.2");
    }

    function allScrollAnimations() {
        const panels = gsap.utils.toArray(".panel");

        panels.forEach((panel, i) => {
            // Le pinning est la clé de l'effet section par section en plein écran
            ScrollTrigger.create({
                trigger: panel,
                start: "top top", 
                pin: true, 
                pinSpacing: false, // Important pour que les sections se superposent/succèdent directement
                anticipatePin: 0.5, // Valeur entre 0 et 1, améliore la fluidité du pinning
                // id: `panel-pin-${panel.id || i}`, // Pour débogage
                onEnter: () => {
                    setActiveNavLink(panel.id);
                    updateActiveDot(panel.id);
                },
                onEnterBack: () => {
                    setActiveNavLink(panel.id);
                    updateActiveDot(panel.id);
                },
            });

            // Animations pour les éléments à l'intérieur de chaque panel
            const animatedElements = panel.querySelectorAll('.animate-on-scroll:not(.testimonial-item)');
            animatedElements.forEach(el => {
                gsap.fromTo(el,
                    { opacity: 0, y: 60, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out",
                        scrollTrigger: {
                            trigger: panel, // Déclencher par rapport au panel parent
                            start: "top center-=10%", // Quand le haut du panel atteint un peu au-dessus du centre
                            toggleActions: "play none none none", // Joue une fois
                            // scrub: true, // Si on veut lier l'animation au scroll dans la section
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
                            trigger: panel, // Déclencher par rapport au panel parent
                            start: "top center-=20%", // Ajuster le point de départ
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
                        trigger: panel, // Déclencher par rapport au panel parent
                        start: "top center", // Ajuster le point de départ
                        toggleActions: "play none none none",
                    }
                });
            }

            // Animation spécifique pour la section Phare
            if (panel.id === 'phare') { // S'assurer que la section a bien l'ID 'phare'
                const profilePicContainer = panel.querySelector('.phare-image-container');
                const quoteBlock = panel.querySelector('blockquote');
                if (profilePicContainer && quoteBlock) { // Vérifier que les éléments existent
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: panel,
                            start: 'top center-=15%', // Déclencher quand le haut du panel est un peu au-dessus du centre
                            toggleActions: "play none none none",
                        }
                    })
                    .fromTo(profilePicContainer, { opacity:0, scale:0.8 }, { opacity:1, scale:1, duration: 0.9, ease:'elastic.out(1, 0.7)' })
                    .fromTo(quoteBlock, { opacity:0, y:30 }, { opacity:1, y:0, duration: 0.8, ease:'power2.out' }, "-=0.5");
                }
            }
        });
    }
    
    function updateActiveDot(sectionId) { // Fonction utilitaire pour les marqueurs latéraux
        const activeDot = document.querySelector(`.scroll-marker-dot[data-target="#${sectionId}"]`);
        document.querySelectorAll('.scroll-marker-dot').forEach(dot => dot.classList.remove('active'));
        if (activeDot) {
            activeDot.classList.add('active');
        }
    }

    function setupSectionMarkers() {
        const sections = gsap.utils.toArray("main section.panel[id]");
        const markerContainer = document.querySelector(".scroll-marker-container");
        
        // Trouver les noms pour les tooltips à partir des liens de navigation existants
        const navLinkTexts = {};
        document.querySelectorAll('a.nav-link[href^="#"]').forEach(link => {
            const href = link.getAttribute('href');
            navLinkTexts[href] = link.textContent.trim();
        });

        if (!markerContainer || sections.length === 0) return;
        markerContainer.innerHTML = ''; 

        sections.forEach((section, index) => {
            const dot = document.createElement("div");
            dot.classList.add("scroll-marker-dot");
            dot.dataset.index = index;
            const sectionId = section.id;
            dot.dataset.target = `#${sectionId}`;

            const tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");
            tooltip.textContent = navLinkTexts[`#${sectionId}`] || sectionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            dot.appendChild(tooltip);
            
            markerContainer.appendChild(dot);

            dot.addEventListener("click", () => {
                lenis.scrollTo(section, { 
                    offset: 0, 
                    duration: 1.5 
                });
            });

            // La mise à jour de .active est maintenant gérée par le ScrollTrigger du panel dans allScrollAnimations
        });
        
        // Activer le premier point initialement (si les sections existent)
        if(sections.length > 0 && sections[0].id) {
           updateActiveDot(sections[0].id);
           setActiveNavLink(sections[0].id); // S'assurer que le lien de nav est aussi actif
        }
    }
    
    function setActiveNavLink(sectionId) {
        if (!sectionId) return; // Garde-fou si sectionId est undefined
        const allHeaderNavLinks = document.querySelectorAll('#site-header .nav-link');
        allHeaderNavLinks.forEach(link => {
            link.classList.remove('active');
            // Vérifier si l'href correspond, même s'il manque le '#' (parfois problématique)
            if (link.getAttribute('href') === `#${sectionId}` || link.getAttribute('href') === sectionId) {
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
                buttonTextSpan.textContent = ''; // Vide pour laisser place au spinner
                formStatusMessage.textContent = '';
                formStatusMessage.className = 'form-status'; // Réinitialise les classes de statut

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
                            buttonTextSpan.textContent = originalButtonText;
                            submitButton.disabled = false;
                        }, 3000);
                    } else {
                        formStatusMessage.textContent = "Une interférence a eu lieu... Veuillez réessayer.";
                        formStatusMessage.classList.add('error');
                        buttonTextSpan.textContent = originalButtonText; // Rétablit le texte en cas d'échec
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