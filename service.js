/* ============================================================
   service.js — Service Page Logic + Lightbox Controller
   Reads ?service= URL param → renders projects → handles lightbox
   ============================================================ */
(async function () {
    'use strict';

    // Static metadata for service categories
    const AT_SERVICES = {
       events: { title: 'Events', tagline: 'Large Scale Events', description: 'End-to-end event production and execution.' },
       exhibitions: { title: 'Exhibitions', tagline: 'Award-Winning Exhibitions', description: 'Immersive and engaging exhibition stands.' },
       fitout: { title: 'Fitout', tagline: 'Premium Fitout Solutions', description: 'World-class interior fit-out for commercial spaces.' },
       signages: { title: 'Signages and Large Format Printing', tagline: 'Digital Signages & Print', description: 'High-quality signage printing and installation.' },
       branding: { title: 'Branding', tagline: 'Brand Experiences', description: 'Brand realization and physical activations.' },
       manufacturing: { title: 'Manufacture', tagline: 'Bespoke Manufacturing', description: 'In-house production facility for custom builds.' }
    };

    const params  = new URLSearchParams(window.location.search);
    const svcKey  = (params.get('service') || 'events').toLowerCase();
    const svcData = AT_SERVICES[svcKey];

    if (!svcData) { window.location.href = 'index.html'; return; }

    try {
        const sanityProjects = await fetchSanity(`*[_type == "project" && serviceCategory == "${svcKey}"]`);
        svcData.projects = (sanityProjects || []).map(p => ({
            title: p.title,
            category: p.serviceCategory,
            year: p.year,
            location: p.location,
            description: p.description && p.description[0] ? p.description[0].children[0].text : '',
            thumbnail: buildSanityImageUrl(p.thumbnail),
            gallery: p.gallery ? p.gallery.map(g => buildSanityImageUrl(g)) : []
        }));
    } catch (err) {
        console.error("Failed to load project data from Sanity", err);
        svcData.projects = [];
    }

    // ---- Background images per service (used in hero) ----
    const HERO_IMAGES = {
        events:        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1800&q=80',
        exhibitions:   'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1800&q=80',
        fitout:        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1800&q=80',
        signages:      'https://images.unsplash.com/photo-1588693959604-3993d39ed708?w=1800&q=80',
        branding:      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1800&q=80',
        manufacturing: 'https://images.unsplash.com/photo-1504917595217-d4bf141d24c0?w=1800&q=80',
        rentals:       'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1800&q=80'
    };

    // ---- Populate page meta ----
    document.getElementById('pageTitle').textContent = `A&T — ${svcData.title}`;
    document.getElementById('svcTagText').textContent = svcData.title;
    document.getElementById('svcTitle').textContent   = svcData.title;
    document.getElementById('svcTagline').textContent = svcData.tagline;
    document.getElementById('svcDesc').textContent    = svcData.description;
    document.getElementById('projectCount').textContent = `${svcData.projects.length} Projects`;

    // ---- Hero Background ----
    const heroBg = document.getElementById('svcHeroBg');
    if (heroBg && HERO_IMAGES[svcKey]) {
        heroBg.style.backgroundImage = `url('${HERO_IMAGES[svcKey]}')`;
    }

    // ============================================================
    //  BUILD PROJECT GRID
    // ============================================================
    const grid = document.getElementById('projectsGrid');

    svcData.projects.forEach((proj, index) => {
        const card = document.createElement('article');
        card.className = 'proj-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Open project: ${proj.title}`);
        card.dataset.index = index;

        card.innerHTML = `
            <div style="overflow:hidden; border-radius:18px 18px 0 0;">
                <img
                    src="${proj.thumbnail}"
                    alt="${proj.title}"
                    class="proj-thumb"
                    loading="lazy"
                >
            </div>
            <div class="proj-overlay" aria-hidden="true">
                <div class="proj-open-hint">
                    <i class="fa-solid fa-expand"></i> View Project
                </div>
            </div>
            <div class="proj-info">
                <span class="proj-cat">${proj.category}</span>
                <h3>${proj.title}</h3>
                <div class="proj-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${proj.year}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${proj.location}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openLightbox(index));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });

        grid.appendChild(card);
    });

    // ============================================================
    //  LIGHTBOX
    // ============================================================
    const lightbox  = document.getElementById('lightbox');
    const lbBackdrop = document.getElementById('lbBackdrop');
    const lbClose   = document.getElementById('lbClose');
    const lbPrev    = document.getElementById('lbPrev');
    const lbNext    = document.getElementById('lbNext');
    const lbImage   = document.getElementById('lbImage');
    const lbLoading = document.getElementById('lbLoading');
    const lbCat     = document.getElementById('lbCat');
    const lbTitle   = document.getElementById('lbTitleText');
    const lbYear    = document.getElementById('lbYear');
    const lbLoc     = document.getElementById('lbLoc');
    const lbDesc    = document.getElementById('lbDesc');
    const lbCounter = document.getElementById('lbCounter');

    let currentProjectIndex = 0;
    let currentGalleryIndex = 0;
    const projects = svcData.projects;

    function openLightbox(index) {
        currentProjectIndex = index;
        currentGalleryIndex = 0; // always open at first photo
        renderSlide(currentProjectIndex, currentGalleryIndex);
        lightbox.hidden = false;
        lightbox.classList.add('lb-visible');
        document.body.style.overflow = 'hidden';
        lbClose.focus();
    }

    function closeLightbox() {
        lightbox.hidden = true;
        lightbox.classList.remove('lb-visible');
        document.body.style.overflow = '';
        // Return focus to the card that opened the lightbox
        const card = grid.querySelector(`[data-index="${currentProjectIndex}"]`);
        if (card) card.focus();
    }

    function renderSlide(projIndex, galIndex) {
        const proj = projects[projIndex];
        const gallery = proj.gallery || [];
        const totalPhotos = gallery.length;
        const currentImgSrc = gallery[galIndex] || proj.thumbnail;

        // Show loading
        lbLoading.classList.remove('hidden');
        lbImage.classList.add('loading');

        // Load image
        const img = new Image();
        img.src = currentImgSrc;
        img.onload = () => {
            lbImage.src = currentImgSrc;
            lbImage.alt = proj.title;
            lbImage.classList.remove('loading');
            lbLoading.classList.add('hidden');
        };
        img.onerror = () => {
            lbLoading.classList.add('hidden');
        };

        // Populate caption
        lbCat.textContent   = proj.category;
        lbTitle.textContent = proj.title;
        lbYear.innerHTML    = `<i class="fa-regular fa-calendar"></i> ${proj.year}`;
        lbLoc.innerHTML     = `<i class="fa-solid fa-location-dot"></i> ${proj.location}`;
        lbDesc.textContent  = proj.description;
        lbCounter.textContent = `${galIndex + 1} of ${totalPhotos}`;

        // Update arrow states (disable if at start or end of gallery)
        lbPrev.disabled = galIndex === 0;
        lbNext.disabled = galIndex === totalPhotos - 1;
    }

    function prevSlide() {
        if (currentGalleryIndex > 0) {
            currentGalleryIndex--;
            renderSlide(currentProjectIndex, currentGalleryIndex);
        }
    }

    function nextSlide() {
        const proj = projects[currentProjectIndex];
        const totalPhotos = proj.gallery ? proj.gallery.length : 1;
        if (currentGalleryIndex < totalPhotos - 1) {
            currentGalleryIndex++;
            renderSlide(currentProjectIndex, currentGalleryIndex);
        }
    }

    // ---- Event Listeners ----
    lbClose.addEventListener('click', closeLightbox);
    lbBackdrop.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', prevSlide);
    lbNext.addEventListener('click', nextSlide);

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowLeft')   prevSlide();
        if (e.key === 'ArrowRight')  nextSlide();
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    const lbStage = document.querySelector('.lb-stage');

    if (lbStage) {
        lbStage.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        lbStage.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else          prevSlide();
            }
        }, { passive: true });
    }

    // ============================================================
    //  SCROLL REVEAL (reuse observer from script.js)
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
    //  Focus trap inside lightbox for accessibility
    // ============================================================
    lightbox.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const focusable = lightbox.querySelectorAll('button:not(:disabled), a, [tabindex="0"]');
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
    });

})();
