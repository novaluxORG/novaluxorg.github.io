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
        allScrollAnimations(); 
        introAnimations(); 
        setupSectionMarkers(); 
        // setupContactForm(); // APPEL SUPPRIMÉ
        setupParticles();
        updateCopyrightYear();
    }

    function setupNavigation() {
        const burgerMenuButton = document.getElementById('burger-menu-button');
        const mobileNav = document.getElementById('mobile-nav-links');
        const mobileNavLinks = mobileNav.querySelectorAll('a.nav-link');
        
        // Modification pour inclure les liens du logo dans la gestion du scroll smooth
        const allScrollLinks = document.querySelectorAll('a.scroll-link, .desktop-nav a.nav-link, .mobile-nav-links a.nav-link');


        function toggleMobileMenu() {
            const isExpanded = burgerMenuButton.getAttribute('aria-expanded') === 'true';
            burgerMenuButton.setAttribute('aria-expanded', String(!isExpanded));
            mobileNav.classList.toggle('open');
            burgerMenuButton.classList.toggle('toggle');
            
            // Utilisation de la classe no-scroll sur body pour mobile
            if (mobileNav.classList.contains('open')) {
                body.classList.add('no-scroll'); 
            } else {
                body.classList.remove('no-scroll');
            }


            if (mobileNav.classList.contains('open')) {
                gsap.fromTo(mobileNavLinks, 
                           { opacity: 0, y: 20 }, 
                           { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, delay: 0.2, ease: "power2.out" });
            } else {
                gsap.to(mobileNavLinks, { opacity: 0, y: 20, duration: 0.3, stagger: {each: 0.05, from: "end"}, ease: "power2.in" });
            }
        }
        if (burgerMenuButton) burgerMenuButton.addEventListener('click', toggleMobileMenu);

        allScrollLinks.forEach(link => { // Changé pour allScrollLinks
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        // console.log("Scrolling to:", href, "Target Element:", targetElement); // Pour débogage

                        let scrollOptions = {
                            offset: 0, // Default Lenis offset
                            duration: 1.5,
                            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                        };

                        // --- Fix #1: Specific offset for #hero-portail to ensure correct landing ---
                        if (href === '#hero-portail') {
                           scrollOptions.offset = -1; // A small negative offset can help land precisely at the top
                        }

                        lenis.scrollTo(targetElement, scrollOptions);

                    } else {
                        console.warn("Target element not found for:", href); // Pour débogage
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
        
        const tlIntro = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.5 }); 
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
                pinSpacing: false, 
                anticipatePin: 0.5, 
                onEnter: () => {
                    // Check if the section has an ID before trying to activate nav/dot
                    if (panel.id) { 
                        setActiveNavLink(panel.id);
                        updateActiveDot(panel.id);
                    }
                },
                onEnterBack: () => {
                     // Check if the section has an ID before trying to activate nav/dot
                     if (panel.id) {
                        setActiveNavLink(panel.id);
                        updateActiveDot(panel.id);
                    }
                },
            });

            const animatedElements = panel.querySelectorAll('.animate-on-scroll:not(.testimonial-item, .text-flow)'); // Exclure text-flow et testimonial-item car ils ont leurs propres animations
            animatedElements.forEach(el => {
                gsap.fromTo(el,
                    { opacity: 0, y: 60, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out",
                        scrollTrigger: {
                            trigger: el, // Utiliser l'élément lui-même comme déclencheur
                            start: "top 90%", // Déclenche quand le haut de l'élément arrive à 90% du viewport
                            toggleActions: "play none none none", 
                            // markers: true // Pour débogage
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
                            trigger: panel, // Utiliser le panel comme déclencheur pour le groupe
                            start: "top center-=20%", 
                            toggleActions: "play none none none",
                             // markers: true // Pour débogage
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
                        trigger: panel, // Utiliser le panel comme déclencheur pour le groupe
                        start: "top center", 
                        toggleActions: "play none none none",
                         // markers: true // Pour débogage
                    }
                });
            }

            if (panel.id === 'phare') { 
                const profilePicContainer = panel.querySelector('.phare-image-container');
                const quoteBlock = panel.querySelector('blockquote');
                if (profilePicContainer && quoteBlock) { 
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: panel,
                            start: 'top center-=15%', 
                            toggleActions: "play none none none",
                            // markers: true // Pour débogage
                        }
                    })
                    .fromTo(profilePicContainer, { opacity:0, scale:0.8 }, { opacity:1, scale:1, duration: 0.9, ease:'elastic.out(1, 0.7)' })
                    .fromTo(quoteBlock, { opacity:0, y:30 }, { opacity:1, y:0, duration: 0.8, ease:'power2.out' }, "-=0.5");
                }
            }
        });
    }
    
    function updateActiveDot(sectionId) { 
        if (!sectionId) return;
        const activeDot = document.querySelector(`.scroll-marker-dot[data-target="#${sectionId}"]`);
        document.querySelectorAll('.scroll-marker-dot').forEach(dot => dot.classList.remove('active'));
        if (activeDot) {
            activeDot.classList.add('active');
        }
    }

    function setupSectionMarkers() {
        // Sélectionne uniquement les sections avec un ID qui sont des panels
        const sections = gsap.utils.toArray("main section.panel[id]");
        const markerContainer = document.querySelector(".scroll-marker-container");
        
        const navLinkTexts = {};
        document.querySelectorAll('a.nav-link[href^="#"]').forEach(link => {
            const href = link.getAttribute('href');
            navLinkTexts[href] = link.textContent.trim();
        });

        if (!markerContainer || sections.length === 0) {
             // Cacher le conteneur s'il n'y a pas de sections avec ID ou s'il est manquant
             if(markerContainer) markerContainer.style.display = 'none';
             return; 
        }
        
        markerContainer.innerHTML = ''; // Nettoyer avant de remplir

        sections.forEach((section, index) => {
            const sectionId = section.id;
            // Exclure la section hero-portail des marqueurs latéraux si souhaité,
            // ou l'inclure si on veut un marqueur pour elle. Incluons-la pour l'instant.
            // if (sectionId === 'hero-portail') return; 

            const dot = document.createElement("div");
            dot.classList.add("scroll-marker-dot");
            dot.dataset.index = index;
            dot.dataset.target = `#${sectionId}`;

            const tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");
            // Utiliser le texte du lien de navigation s'il existe, sinon générer un nom simple
            tooltip.textContent = navLinkTexts[`#${sectionId}`] || sectionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            dot.appendChild(tooltip);
            
            markerContainer.appendChild(dot);

            dot.addEventListener("click", () => {
                lenis.scrollTo(section, { 
                    offset: (sectionId === 'hero-portail' ? -1 : 0), // Utiliser l'offset spécifique pour hero-portail
                    duration: 1.5 
                });
            });
        });
        
        // Activer le premier marqueur/lien au chargement si des sections existent
        if(sections.length > 0 && sections[0].id) {
           updateActiveDot(sections[0].id);
           setActiveNavLink(sections[0].id); 
        }
    }
    
    function setActiveNavLink(sectionId) {
        if (!sectionId) return; 
        // Sélectionnez tous les liens de navigation dans le header, desktop et mobile
        const allHeaderNavLinks = document.querySelectorAll('#site-header .nav-link');
        allHeaderNavLinks.forEach(link => {
            link.classList.remove('active');
            // Le href peut être "#sectionId" ou juste "sectionId" (bien que le # soit standard)
            if (link.getAttribute('href') && link.getAttribute('href').endsWith(`#${sectionId}`)) {
                link.classList.add('active');
            }
        });
    }

    // FONCTION setupContactForm() SUPPRIMÉE

    function setupParticles() {
        if (document.getElementById('particles-js')) {
             // particles.js config (unchanged)
            particlesJS("particles-js", { "particles": { "number": { "value": 60, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#daa520" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 0.7, "opacity_min": 0.1, "sync": false } }, "size": { "value": 2.5, "random": true }, "line_linked": { "enable": true, "distance": 120, "color": "#b8860b", "opacity": 0.25, "width": 1 }, "move": { "enable": true, "speed": 1.2, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false }, "resize": true }, "modes": { "grab": { "distance": 130, "line_linked": { "opacity": 0.5 } } } }, "retina_detect": true
            });
        }
    }

    function updateCopyrightYear() {
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();
    }

});