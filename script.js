/* ============================================================
   A&T Technical Services — script.js v2
   ============================================================ */
(function () {
    'use strict';

    // ---- DOM ----
    const heroIntro = document.getElementById('heroIntro');
    const welcomeText = document.getElementById('welcomeText');

    // ============================================================
    // 10. HERO WELCOME ANIMATION (REFINED FADE CYCLE)
    // ============================================================
    function initWelcomeAnimation() {
        if (!heroIntro || !welcomeText) return;
        const textWrap = document.querySelector('.intro-text-wrap');

        const languages = [
            { text: 'Welcome', lang: 'en' },
            { text: 'Bienvenido', lang: 'es' },
            { text: 'Velkommen', lang: 'da' },
            { text: 'Witamy', lang: 'pl' },
            { text: 'नमस्ते', lang: 'hi' },
            { text: 'Bienvenue', lang: 'fr' },
            { text: 'أهلاً بك', lang: 'ar' },
            { text: 'Willkommen', lang: 'de' }
        ];

        let index = 0;

        async function cycle() {
            // 1. Show Text
            const current = languages[index];
            welcomeText.textContent = current.text;
            welcomeText.dir = current.lang === 'ar' ? 'rtl' : 'ltr';
            
            textWrap.classList.add('active');

            // Wait 1.2s (still) - Faster pace
            await new Promise(r => setTimeout(r, 1200));

            // Fade Out
            textWrap.classList.remove('active');

            // Wait 0.1s (tiny gap)
            await new Promise(r => setTimeout(r, 100));

            // Next
            index = (index + 1) % languages.length;
            cycle();
        }

        cycle();
    }
    initWelcomeAnimation();
    const body        = document.getElementById('body');
    const header      = document.getElementById('header');
    const themeBtn    = document.getElementById('themeBtn');

    const burger      = document.getElementById('burger');
    const drawer      = document.getElementById('drawer');
    const drawerClose = document.getElementById('drawerClose');
    const scrim       = document.getElementById('scrim');
    const drawerRentals     = document.getElementById('drawerRentals');
    const drawerRentalsBody = document.getElementById('drawerRentalsBody');
    const quoteForm   = document.getElementById('quoteForm');
    const galleryRunner = document.getElementById('galleryRunner');
    const cursor        = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursorFollower');

    // ============================================================
    // 1. CUSTOM CURSOR
    // ============================================================
    if (cursor && cursorFollower && window.matchMedia('(hover: hover)').matches) {
        let mx = 0, my = 0, fx = 0, fy = 0;

        document.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            cursor.style.left = mx + 'px';
            cursor.style.top  = my + 'px';
        });

        // Smooth follower
        (function follow() {
            fx += (mx - fx) * 0.1;
            fy += (my - fy) * 0.1;
            cursorFollower.style.left = fx + 'px';
            cursorFollower.style.top  = fy + 'px';
            requestAnimationFrame(follow);
        })();

        // Hover effect on interactive elements
        const hoverEls = document.querySelectorAll('a, button, .g-card, .svc-card, input, textarea');
        hoverEls.forEach(el => {
            el.addEventListener('mouseenter', () => body.classList.add('cursor-hovered'));
            el.addEventListener('mouseleave', () => body.classList.remove('cursor-hovered'));
        });

        // Hover effect on red backgrounds to change cursor color
        const redBgEls = document.querySelectorAll('.lv-about, .lv-testimonials, .btn-red, .drawer-cta');
        redBgEls.forEach(el => {
            el.addEventListener('mouseenter', () => body.classList.add('cursor-on-red'));
            el.addEventListener('mouseleave', () => body.classList.remove('cursor-on-red'));
        });
    }

    // ============================================================
    // 2. THEME SWITCH (Toggle)
    // ============================================================
    const savedTheme = localStorage.getItem('at-theme') || 'dark';
    applyTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        applyTheme(body.classList.contains('dark-mode') ? 'light' : 'dark');
    });

    function applyTheme(mode) {
        if (mode === 'dark') {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
        }
        localStorage.setItem('at-theme', mode);
    }


    // ============================================================
    // 4. HEADER — Solid on scroll
    // ============================================================
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';
    
    // Hero Parallax Elements
    const heroSection = document.getElementById('home');
    const pxLayer1 = document.getElementById('pxLayer1');
    const pxLayer3 = document.getElementById('pxLayer3');
    const pxVideoLayer = document.getElementById('pxVideoLayer');
    const pxScrollHint = document.getElementById('pxScrollHint');
    const heroVideo = document.getElementById('heroVideo');
    const pxVideoContent = pxVideoLayer ? pxVideoLayer.querySelector('.px-video-content') : null;
    let videoStarted = false;

    function handleScroll() {
        const scrolled = window.scrollY > 70;
        header.classList.toggle('solid', scrolled);
        
        if (isHomePage) {
            body.classList.toggle('header-at-top', !scrolled);

            // Hero Parallax Timeline Logic (3 stages: Logo → Slogan → Video)
            if (heroSection && pxLayer1 && pxLayer3 && pxVideoLayer) {
                const scrollY = window.scrollY;
                const heroScrollable = heroSection.offsetHeight - window.innerHeight;
                
                if (heroScrollable > 0) {
                    const progress = Math.min(Math.max(scrollY / heroScrollable, 0), 1);
                    
                    // 3 stages = ~0.33 each
                    const STAGE = 1 / 3;
                    const FADE_ZONE = STAGE * 0.4; // fade transition zone

                    // --- Scroll Hint: fade out quickly ---
                    if (pxScrollHint) {
                        const hintFade = Math.min(scrollY / 100, 1);
                        pxScrollHint.style.opacity = 1 - hintFade;
                        pxScrollHint.style.pointerEvents = scrollY > 50 ? 'none' : 'auto';
                    }

                    // --- Stage 1: Logo ---
                    const logoEnd = STAGE;
                    if (progress < logoEnd - FADE_ZONE) {
                        // Fully visible
                        pxLayer1.style.opacity = 1;
                        pxLayer1.style.transform = 'translateY(0) scale(1)';
                    } else if (progress < logoEnd) {
                        // Fading out
                        const fadeOut = 1 - ((progress - (logoEnd - FADE_ZONE)) / FADE_ZONE);
                        pxLayer1.style.opacity = fadeOut;
                        pxLayer1.style.transform = `translateY(${-30 * (1 - fadeOut)}px) scale(${1 - 0.1 * (1 - fadeOut)})`;
                    } else {
                        pxLayer1.style.opacity = 0;
                        pxLayer1.style.pointerEvents = 'none';
                    }

                    // --- Stage 2: Slogan ---
                    const sloganStart = STAGE;
                    const sloganEnd = STAGE * 2;
                    if (progress < sloganStart - FADE_ZONE) {
                        pxLayer3.style.opacity = 0;
                        pxLayer3.style.transform = 'translateY(40px)';
                    } else if (progress < sloganStart) {
                        // Fading in
                        const fadeIn = (progress - (sloganStart - FADE_ZONE)) / FADE_ZONE;
                        pxLayer3.style.opacity = fadeIn;
                        pxLayer3.style.transform = `translateY(${40 * (1 - fadeIn)}px)`;
                    } else if (progress < sloganEnd - FADE_ZONE) {
                        // Fully visible
                        pxLayer3.style.opacity = 1;
                        pxLayer3.style.transform = 'translateY(0)';
                    } else if (progress < sloganEnd) {
                        // Fading out
                        const fadeOut = 1 - ((progress - (sloganEnd - FADE_ZONE)) / FADE_ZONE);
                        pxLayer3.style.opacity = fadeOut;
                        pxLayer3.style.transform = `translateY(${-20 * (1 - fadeOut)}px)`;
                    } else {
                        pxLayer3.style.opacity = 0;
                        pxLayer3.style.pointerEvents = 'none';
                    }

                    // --- Stage 3: Video ---
                    const videoStart = STAGE * 2;
                    if (progress < videoStart - FADE_ZONE) {
                        pxVideoLayer.style.opacity = 0;
                        pxVideoLayer.style.pointerEvents = 'none';
                        pxVideoLayer.classList.remove('is-visible');
                        if (pxVideoContent) {
                            pxVideoContent.style.opacity = 0;
                            pxVideoContent.style.transform = 'translateY(30px)';
                        }
                    } else if (progress < videoStart) {
                        // Fading in
                        const fadeIn = (progress - (videoStart - FADE_ZONE)) / FADE_ZONE;
                        pxVideoLayer.style.opacity = fadeIn;
                        pxVideoLayer.style.pointerEvents = fadeIn > 0.5 ? 'auto' : 'none';
                        pxVideoLayer.classList.add('is-visible');
                        // Start video when it begins to appear
                        if (!videoStarted && heroVideo) {
                            heroVideo.play().catch(function(){});
                            videoStarted = true;
                        }
                        if (pxVideoContent) {
                            pxVideoContent.style.opacity = 0;
                            pxVideoContent.style.transform = 'translateY(30px)';
                        }
                    } else {
                        // Fully visible — hold
                        pxVideoLayer.style.opacity = 1;
                        pxVideoLayer.style.pointerEvents = 'auto';
                        pxVideoLayer.classList.add('is-visible');
                        if (!videoStarted && heroVideo) {
                            heroVideo.play().catch(function(){});
                            videoStarted = true;
                        }
                        // Fade in the text content after video is fully visible
                        const textProgress = Math.min((progress - videoStart) / (STAGE * 0.5), 1);
                        if (pxVideoContent) {
                            pxVideoContent.style.opacity = textProgress;
                            pxVideoContent.style.transform = `translateY(${30 * (1 - textProgress)}px)`;
                        }
                    }
                }
            }
        } else {
            body.classList.remove('header-at-top');
        }

        // ============================================================
        // SERVICES PARALLAX LOGIC
        // ============================================================
        if (svcParallax) {
            const rect = svcParallax.getBoundingClientRect();
            const svcScrollable = svcParallax.offsetHeight - window.innerHeight;
            
            if (svcScrollable > 0) {
                // Only animate when section is in view
                const svcTop = -rect.top;
                const svcProgress = Math.min(Math.max(svcTop / svcScrollable, 0), 1);

                const TOTAL_STAGES = 8; // title + 6 services + cards
                const STAGE_SIZE = 1 / TOTAL_STAGES;
                const FADE_ZONE = STAGE_SIZE * 0.25; // 25% of each stage for crossfade

                // Stage 0: Title
                const titleEnd = STAGE_SIZE;
                if (svcProgress < titleEnd - FADE_ZONE) {
                    svcPxTitle.style.opacity = 1;
                    svcPxTitle.style.pointerEvents = 'auto';
                } else if (svcProgress < titleEnd) {
                    svcPxTitle.style.opacity = 1 - ((svcProgress - (titleEnd - FADE_ZONE)) / FADE_ZONE);
                    svcPxTitle.style.pointerEvents = 'none';
                } else {
                    svcPxTitle.style.opacity = 0;
                    svcPxTitle.style.pointerEvents = 'none';
                }

                // Stages 1-6: Service Slides
                for (var si = 0; si < svcSlides.length; si++) {
                    var slideStart = STAGE_SIZE * (si + 1);
                    var slideEnd = slideStart + STAGE_SIZE;
                    var slide = svcSlides[si];
                    var textEl = slide.querySelector('.svc-px-text');
                    var imgEl = slide.querySelector('.svc-px-img');

                    if (svcProgress < slideStart - FADE_ZONE) {
                        // Before this slide
                        slide.style.opacity = 0;
                        slide.style.pointerEvents = 'none';
                        if (textEl) { textEl.style.opacity = 0; textEl.style.transform = 'translateY(30px)'; }
                        if (imgEl) { imgEl.style.transform = 'translateX(100px)'; imgEl.style.opacity = 0; }
                    } else if (svcProgress < slideStart) {
                        // Fading in
                        var fadeIn = (svcProgress - (slideStart - FADE_ZONE)) / FADE_ZONE;
                        slide.style.opacity = fadeIn;
                        if (textEl) { textEl.style.opacity = fadeIn; textEl.style.transform = 'translateY(' + (30 * (1 - fadeIn)) + 'px)'; }
                        if (imgEl) { imgEl.style.transform = 'translateX(' + (100 * (1 - fadeIn)) + 'px)'; imgEl.style.opacity = fadeIn; }
                    } else if (svcProgress < slideEnd - FADE_ZONE) {
                        // Fully visible
                        slide.style.opacity = 1;
                        slide.style.pointerEvents = 'auto';
                        if (textEl) { textEl.style.opacity = 1; textEl.style.transform = 'translateY(0)'; }
                        if (imgEl) { imgEl.style.transform = 'translateX(0)'; imgEl.style.opacity = 1; }
                    } else if (svcProgress < slideEnd) {
                        // Fading out
                        var fadeOut = 1 - ((svcProgress - (slideEnd - FADE_ZONE)) / FADE_ZONE);
                        slide.style.opacity = fadeOut;
                        if (textEl) { textEl.style.opacity = fadeOut; textEl.style.transform = 'translateY(' + (-20 * (1 - fadeOut)) + 'px)'; }
                        if (imgEl) { imgEl.style.transform = 'translateX(' + (-50 * (1 - fadeOut)) + 'px)'; imgEl.style.opacity = fadeOut; }
                    } else {
                        // After this slide
                        slide.style.opacity = 0;
                        slide.style.pointerEvents = 'none';
                    }
                }

                // Stage 7: Cards
                var cardsStart = STAGE_SIZE * 7;
                if (svcProgress < cardsStart - FADE_ZONE) {
                    svcPxCards.style.opacity = 0;
                    svcPxCards.style.pointerEvents = 'none';
                } else if (svcProgress < cardsStart) {
                    svcPxCards.style.opacity = (svcProgress - (cardsStart - FADE_ZONE)) / FADE_ZONE;
                    svcPxCards.style.pointerEvents = 'none';
                } else {
                    svcPxCards.style.opacity = 1;
                    svcPxCards.style.pointerEvents = 'auto';
                }
            }
        }
    }

    // Services Parallax Elements
    const svcParallax = document.querySelector('.svc-parallax');
    const svcPxTitle = document.getElementById('svcPxTitle');
    const svcSlides = [];
    for (var i = 0; i < 6; i++) {
        var s = document.getElementById('svcSlide' + i);
        if (s) svcSlides.push(s);
    }
    const svcPxCards = document.getElementById('svcPxCards');

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init on load

    // ============================================================
    // 5. MOBILE DRAWER
    // ============================================================
    burger.addEventListener('click',      openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    scrim.addEventListener('click',       closeDrawer);

    function openDrawer() {
        drawer.classList.add('open');
        scrim.classList.add('open');
        burger.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('open');
        scrim.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
    }

    // Close drawer on link click
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

    // Rentals accordion
    if (drawerRentals && drawerRentalsBody) {
        drawerRentals.addEventListener('click', () => {
            const isOpen = drawerRentalsBody.classList.toggle('open');
            drawerRentals.classList.toggle('open', isOpen);
            drawerRentals.setAttribute('aria-expanded', String(isOpen));
        });
    }

    // Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });

    // ============================================================
    // 6. SCROLL REVEAL
    // ============================================================
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = parseFloat(entry.target.style.getPropertyValue('--delay')) || 0;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

    // ============================================================
    // 7. GALLERY — DRAG SCROLL
    // ============================================================
    if (galleryRunner) {
        let active = false, startX, startScroll;

        galleryRunner.addEventListener('mousedown', e => {
            active = true;
            startX = e.pageX - galleryRunner.offsetLeft;
            startScroll = galleryRunner.scrollLeft;
        });
        document.addEventListener('mouseup',   () => { active = false; });
        document.addEventListener('mouseleave',() => { active = false; });
        galleryRunner.addEventListener('mousemove', e => {
            if (!active) return;
            e.preventDefault();
            const x    = e.pageX - galleryRunner.offsetLeft;
            const walk = (x - startX) * 1.5;
            galleryRunner.scrollLeft = startScroll - walk;
        });

        // Gallery Navigation Buttons
        const galleryPrev = document.getElementById('galleryPrev');
        const galleryNext = document.getElementById('galleryNext');
        
        if (galleryPrev && galleryNext) {
            const scrollAmount = 350; // Width of one card + gap roughly
            galleryPrev.addEventListener('click', () => {
                galleryRunner.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
            galleryNext.addEventListener('click', () => {
                galleryRunner.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }

        // Placeholder removed, handled by index-portfolio.js
    }

    // ============================================================
    // 8. QUOTE FORM
    // ============================================================
    if (quoteForm) {
        quoteForm.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const orig = btn.innerHTML;

            // Get Formspree ID from Sanity siteSettings
            let formspreeId = "mldgjzda"; 
            try {
                const settingsArray = await fetchSanity('*[_type == "siteSettings"]');
                const settings = settingsArray && settingsArray.length > 0 ? settingsArray[0] : {};
                if (settings.formspreeId) formspreeId = settings.formspreeId;
            } catch(e) {}

            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
            btn.disabled = true;

            const formData = new FormData(quoteForm);
            
            try {
                const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sent Successfully!';
                    btn.style.background = '#16a34a';
                    quoteForm.reset();
                } else {
                    throw new Error('Failed to send');
                }
            } catch (err) {
                btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error sending';
                btn.style.background = '#dc2626';
            } finally {
                setTimeout(() => {
                    btn.innerHTML = orig;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 4500);
            }
        });
    }

    // ============================================================
    // 9. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 10;
            window.scrollTo({ top, behavior: 'smooth' });
            if (drawer.classList.contains('open')) closeDrawer();
        });
    });

    // ============================================================
    //  GLOBAL SETTINGS (CMS DYNAMIC)
    // ============================================================
    async function initGlobalSettings() {
        try {
            const settingsArray = await fetchSanity('*[_type == "siteSettings"]');
            const settings = settingsArray && settingsArray.length > 0 ? settingsArray[0] : null;
            if (!settings) return;

            // Logos & Favicon
            if (settings.logo) {
                const logoUrl = buildSanityImageUrl(settings.logo);
                document.querySelectorAll('.brand-logo').forEach(el => {
                    el.src = logoUrl;
                    el.style.filter = 'none'; // Ensure no weird filters if they upload colored logo
                });
            }
            if (settings.footerLogo) {
                const footerLogoUrl = buildSanityImageUrl(settings.footerLogo);
                document.querySelectorAll('.footer-brand-logo').forEach(el => {
                    el.src = footerLogoUrl;
                    // Note: If they upload a black logo, we might still need filter: invert(1).
                    // If they upload a white logo, we should remove the filter.
                    // For now, assume they upload the exact logo they want, so remove the filter:
                    el.style.filter = 'none';
                });
            }
            if (settings.favicon) {
                const faviconUrl = buildSanityImageUrl(settings.favicon);
                const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
                link.type = 'image/x-icon';
                link.rel = 'shortcut icon';
                link.href = faviconUrl;
                document.getElementsByTagName('head')[0].appendChild(link);
            }

            // Phone
            if (settings.phone) {
                document.querySelectorAll('.cms-phone').forEach(el => el.textContent = settings.phone);
                document.querySelectorAll('.cms-phone-link').forEach(el => {
                    el.href = 'tel:' + settings.phone.replace(/\s+/g, '');
                });
            }

            // Email
            if (settings.email) {
                document.querySelectorAll('.cms-email').forEach(el => el.textContent = settings.email);
            }

            // Location
            if (settings.location) {
                document.querySelectorAll('.cms-location').forEach(el => el.textContent = settings.location);
            }
            if (settings.googleMapsLink) {
                document.querySelectorAll('.cms-location-link').forEach(el => el.href = settings.googleMapsLink);
            }

            // Portfolio
            if (settings.portfolio_link) {
                document.querySelectorAll('.cms-portfolio').forEach(el => el.href = settings.portfolio_link);
            }

            // Socials
            if (settings.socials) {
                if (settings.socials.instagram) document.querySelectorAll('.soc-instagram').forEach(el => el.href = settings.socials.instagram);
                if (settings.socials.facebook)  document.querySelectorAll('.soc-facebook').forEach(el => el.href = settings.socials.facebook);
                if (settings.socials.linkedin)  document.querySelectorAll('.soc-linkedin').forEach(el => el.href = settings.socials.linkedin);
                if (settings.socials.youtube)   document.querySelectorAll('.soc-youtube').forEach(el => el.href = settings.socials.youtube);
            }

        } catch (err) {
            console.error('Error loading settings:', err);
        }
    }

    // ============================================================
    // 11. FLOATING BAR LOGIC (SCROLL & CLOCK)
    // ============================================================
    function initFloatingBar() {
        const bar = document.getElementById('floatingBar');
        const toTopBtn = document.getElementById('fbToTop');
        const dateEl = document.getElementById('fbDateLabel');
        const timeEl = document.getElementById('fbTimeLabel');

        if (!bar) return;

        // A. Scroll Reveal
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                bar.classList.add('visible');
            } else {
                bar.classList.remove('visible');
            }
        });

        // B. Back to Top
        if (toTopBtn) {
            toTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // C. System Clock
        function updateClock() {
            const now = new Date();
            
            // Format: WED, APR 08
            const dateStr = now.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: '2-digit' 
            }).toUpperCase();
            
            // Format: 18:35
            const timeStr = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            if (dateEl) dateEl.textContent = dateStr;
            if (timeEl) timeEl.textContent = timeStr;
        }

        updateClock();
        setInterval(updateClock, 1000 * 30); // Update every 30s
    }

    // ============================================================
    // 10. HERO WELCOME ANIMATION (REFINED FADE CYCLE)
    // ============================================================
    function initWelcomeAnimation() {
        if (!heroIntro || !welcomeText) return;
        const textWrap = document.querySelector('.intro-text-wrap');
        const logoWrap = document.querySelector('.intro-logo-wrap');

        const languages = [
            { text: 'Welcome', lang: 'en' },
            { text: 'Bienvenido', lang: 'es' },
            { text: 'Velkommen', lang: 'da' },
            { text: 'Witamy', lang: 'pl' },
            { text: 'नमस्ते', lang: 'hi' },
            { text: 'Bienvenue', lang: 'fr' },
            { text: 'أهلاً بك', lang: 'ar' },
            { text: 'Willkommen', lang: 'de' }
        ];

        let index = 0;

        async function cycle() {
            // 1. Show Text
            const current = languages[index];
            welcomeText.textContent = current.text;
            welcomeText.dir = current.lang === 'ar' ? 'rtl' : 'ltr';
            
            textWrap.classList.add('active');
            logoWrap.classList.remove('active');

            // Wait 2s (still)
            await new Promise(r => setTimeout(r, 2000));

            // Fade Out
            textWrap.classList.remove('active');

            // Wait 0.3s (blank)
            await new Promise(r => setTimeout(r, 300) );

            // 2. Show Logo
            logoWrap.classList.add('active');

            // Wait 2s (still)
            await new Promise(r => setTimeout(r, 2000));

            // Fade Out
            logoWrap.classList.remove('active');

            // Wait 0.3s (blank)
            await new Promise(r => setTimeout(r, 300));

            // Move to next language
            index = (index + 1) % languages.length;
            cycle();
        }

        cycle();
    }

    // ============================================================
    // 12. SERVICES SCROLL (MOBILE ARROWS)
    // ============================================================
    function initServicesScroll() {
        const grid = document.getElementById('svcGrid');
        const prev = document.getElementById('svcPrev');
        const next = document.getElementById('svcNext');

        if (!grid || !prev || !next) return;

        const scrollAmount = 300; 

        prev.addEventListener('click', () => {
            grid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        next.addEventListener('click', () => {
            grid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    // ============================================================
    // 13. HOMEPAGE CMS DATA
    // ============================================================
    async function initHomepageCMS() {
        if (!isHomePage) return;
        try {
            const hpArray = await fetchSanity('*[_type == "homepage"]');
            const hp = hpArray && hpArray.length > 0 ? hpArray[0] : null;
            if (!hp) return;

            // Partner Logos
            if (hp.partnerLogos && hp.partnerLogos.length > 0) {
                const pTrack1 = document.getElementById('partnerTrack1');
                const pTrack2 = document.getElementById('partnerTrack2');
                if (pTrack1 && pTrack2) {
                    const logosHtml = hp.partnerLogos.map(logo => `<img src="${buildSanityImageUrl(logo)}" alt="Partner">`).join('');
                    pTrack1.innerHTML = logosHtml;
                    pTrack2.innerHTML = logosHtml;
                }
            }

            // About Image
            if (hp.aboutImage) {
                const aboutImgEl = document.getElementById('hpAboutImage');
                if (aboutImgEl) aboutImgEl.src = buildSanityImageUrl(hp.aboutImage);
            }

            // Video & Poster (needs special query to get file URL)
            // Sanity file URLs need to be built or we can just fetch the file ref.
            // For now, if they provide a poster, let's set it.
            if (hp.heroPoster) {
                const heroVideo = document.getElementById('heroVideo');
                if (heroVideo) heroVideo.poster = buildSanityImageUrl(hp.heroPoster);
            }
        } catch (e) {
            console.error('Error loading homepage CMS data', e);
        }
    }

    // ============================================================
    // 14. ABOUT PAGE CMS DATA
    // ============================================================
    async function initAboutCMS() {
        if (!window.location.pathname.includes('about.html')) return;
        try {
            const aboutArray = await fetchSanity('*[_type == "aboutSettings"]');
            const about = aboutArray && aboutArray.length > 0 ? aboutArray[0] : null;
            if (!about) return;

            if (about.workshopImage) {
                const workshopImgEl = document.getElementById('aboutWorkshopImage');
                if (workshopImgEl) workshopImgEl.src = buildSanityImageUrl(about.workshopImage);
            }

            if (about.heroPoster) {
                const aboutHeroVideo = document.getElementById('aboutHeroVideo');
                if (aboutHeroVideo) aboutHeroVideo.poster = buildSanityImageUrl(about.heroPoster);
            }
        } catch (e) {
            console.error('Error loading about page CMS data', e);
        }
    }

    // ============================================================
    // 15. FEATURED 360 PROJECT (HOMEPAGE)
    // ============================================================
    function initFeatured360() {
        const container = document.getElementById('featured360');
        if (!container) return;

        // Array of 360 project embeds (using iframes instead of scripts for reliable dynamic loading)
        const projects360 = [
            `<iframe class="ku-embed" frameborder="0" allowfullscreen="true" allow="xr-spatial-tracking; gyroscope; accelerometer" scrolling="no" src="https://kuula.co/share/h5JtP?logo=1&info=1&fs=1&vr=0&zoom=1&autorotate=0.26&thumbs=1&margin=24" style="width: 100%; height: 100%; border: none;"></iframe>`
        ];

        // Select a random project
        const randomProject = projects360[Math.floor(Math.random() * projects360.length)];

        // Inject the embed directly
        container.innerHTML = randomProject;
    }

    initWelcomeAnimation();
    initServicesScroll();
    initFloatingBar();
    initGlobalSettings();
    initHomepageCMS();
    initAboutCMS();
    initFeatured360();

})();
