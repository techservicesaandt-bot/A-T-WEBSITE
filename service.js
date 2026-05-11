/* ============================================================
   service.js — Service Page Logic + Lightbox Controller
   Reads ?service= URL param → renders projects → handles lightbox
   ============================================================ */
(async function () {
    'use strict';

    const params  = new URLSearchParams(window.location.search);
    const svcKey  = (params.get('service') || 'events').toLowerCase();
    
    let svcData = null;
    let heroImageUrl = '';

    try {
        const services = await fetchSanity(`*[_type == "service" && id.current == "${svcKey}"]`);
        if (services && services.length > 0) {
            svcData = services[0];
            svcData.projects = [];
            if (svcData.image) {
                heroImageUrl = buildSanityImageUrl(svcData.image);
            }
        }
    } catch(err) {
        console.error("Failed to load service from Sanity", err);
    }

    // FALLBACK DATA FOR OFFLINE DESIGN
    if (!svcData) {
        console.warn("No Sanity data found. Using local fallback data for design purposes.");
        svcData = {
            title: svcKey.charAt(0).toUpperCase() + svcKey.slice(1),
            tagline: "Design, Produce, Execute.",
            description: "A showcase of our premium projects in this category.",
            projects: []
        };
        heroImageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80";
    }

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

    if (svcData.projects.length === 0) {
        // Provide dummy projects for testing
        svcData.projects = [
            {
                title: "Dummy Project Alpha",
                category: svcKey,
                year: "2025",
                location: "Dubai World Trade Centre",
                description: "An incredible setup showcasing our premium design and execution.",
                thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80",
                    "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1600&q=80",
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80"
                ]
            },
            {
                title: "Dummy Project Beta",
                category: svcKey,
                year: "2024",
                location: "Abu Dhabi",
                description: "Massive outdoor installation.",
                thumbnail: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80",
                gallery: [
                    "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1600&q=80",
                    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80"
                ]
            }
        ];
    }

    // ---- Populate page meta ----
    document.getElementById('pageTitle').textContent = `A&T — ${svcData.title || ''}`;
    document.getElementById('svcTagText').textContent = svcData.title || '';
    document.getElementById('svcTitle').textContent   = svcData.title || '';
    document.getElementById('svcTagline').textContent = svcData.tagline || '';
    document.getElementById('svcDesc').textContent    = svcData.description || '';
    document.getElementById('projectCount').textContent = `${svcData.projects.length} Projects`;

    // ---- Hero Background ----
    const heroBg = document.getElementById('svcHeroBg');
    if (heroBg && heroImageUrl) {
        heroBg.style.backgroundImage = `url('${heroImageUrl}')`;
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
    //  3D FLIP-BOOK MODAL
    // ============================================================
    const fbModal   = document.getElementById('fbModal');
    const fbBackdrop= document.getElementById('fbBackdrop');
    const fbClose   = document.getElementById('fbClose');
    const fbPrev    = document.getElementById('fbPrev');
    const fbNext    = document.getElementById('fbNext');
    const fbBook    = document.getElementById('fbBook');
    const fbCat     = document.getElementById('fbCat');
    const fbTitle   = document.getElementById('fbTitle');
    const fbYear    = document.getElementById('fbYear');
    const fbLoc     = document.getElementById('fbLoc');
    const fbCounter = document.getElementById('fbCounter');
    const fbProjPrev= document.getElementById('fbProjPrev');
    const fbProjNext= document.getElementById('fbProjNext');

    let currentProjectIndex = 0;
    let currentGalleryIndex = 0;
    let isFlipping = false;
    const projects = svcData.projects;

    function openLightbox(index) {
        currentProjectIndex = index;
        currentGalleryIndex = 0;
        
        fbModal.hidden = false;
        document.body.style.overflow = 'hidden';
        fbClose.focus();
        
        buildBook();
        updateUI();
    }

    function closeLightbox() {
        fbModal.hidden = true;
        document.body.style.overflow = '';
        const card = grid.querySelector(`[data-index="${currentProjectIndex}"]`);
        if (card) card.focus();
        
        // Clear book memory
        fbBook.innerHTML = '';
    }

    function buildBook() {
        fbBook.innerHTML = '';
        const proj = projects[currentProjectIndex];
        const gallery = proj.gallery && proj.gallery.length > 0 ? proj.gallery : [proj.thumbnail];
        
        // Build pages in reverse so the first page is on top (highest z-index)
        gallery.forEach((src, idx) => {
            const page = document.createElement('div');
            page.className = 'fb-page';
            page.style.zIndex = gallery.length - idx;
            
            const img = document.createElement('img');
            img.src = src;
            img.alt = `${proj.title} - Image ${idx + 1}`;
            
            // Flipped state if we start somewhere else (though we start at 0)
            if (idx < currentGalleryIndex) {
                page.classList.add('flipped');
            }

            page.appendChild(img);
            fbBook.appendChild(page);
        });
    }

    function updateUI() {
        const proj = projects[currentProjectIndex];
        const totalPhotos = proj.gallery && proj.gallery.length > 0 ? proj.gallery.length : 1;

        // Info
        fbCat.textContent = proj.category;
        fbTitle.textContent = proj.title;
        fbYear.innerHTML = `<i class="fa-regular fa-calendar"></i> ${proj.year}`;
        fbLoc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${proj.location}`;
        fbCounter.textContent = `${currentGalleryIndex + 1} / ${totalPhotos}`;

        // Page Arrows
        fbPrev.disabled = currentGalleryIndex === 0;
        fbNext.disabled = currentGalleryIndex === totalPhotos - 1;

        // Project Arrows
        fbProjPrev.disabled = currentProjectIndex === 0;
        fbProjNext.disabled = currentProjectIndex === projects.length - 1;
    }

    function turnPageNext() {
        if (isFlipping) return;
        const proj = projects[currentProjectIndex];
        const totalPhotos = proj.gallery && proj.gallery.length > 0 ? proj.gallery.length : 1;
        
        if (currentGalleryIndex < totalPhotos - 1) {
            isFlipping = true;
            // The page to flip is the current one
            const pages = fbBook.querySelectorAll('.fb-page');
            const pageToFlip = pages[currentGalleryIndex];
            pageToFlip.classList.add('flipped');
            
            currentGalleryIndex++;
            updateUI();
            
            setTimeout(() => isFlipping = false, 800); // matches CSS transition
        }
    }

    function turnPagePrev() {
        if (isFlipping) return;
        
        if (currentGalleryIndex > 0) {
            isFlipping = true;
            currentGalleryIndex--;
            
            // The page to un-flip is the new current one
            const pages = fbBook.querySelectorAll('.fb-page');
            const pageToUnflip = pages[currentGalleryIndex];
            pageToUnflip.classList.remove('flipped');
            
            updateUI();
            
            setTimeout(() => isFlipping = false, 800); // matches CSS transition
        }
    }

    function prevProject() {
        if (currentProjectIndex > 0) {
            openLightbox(currentProjectIndex - 1);
        }
    }

    function nextProject() {
        if (currentProjectIndex < projects.length - 1) {
            openLightbox(currentProjectIndex + 1);
        }
    }

    // ---- Event Listeners ----
    fbClose.addEventListener('click', closeLightbox);
    fbBackdrop.addEventListener('click', closeLightbox);
    fbPrev.addEventListener('click', turnPagePrev);
    fbNext.addEventListener('click', turnPageNext);
    fbProjPrev.addEventListener('click', prevProject);
    fbProjNext.addEventListener('click', nextProject);

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (fbModal.hidden) return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowLeft')   turnPagePrev();
        if (e.key === 'ArrowRight')  turnPageNext();
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    const fbStage = document.getElementById('fbStage');

    if (fbStage) {
        fbStage.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        fbStage.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) turnPageNext();
                else          turnPagePrev();
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
    fbModal.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        const focusable = fbModal.querySelectorAll('button:not(:disabled), a, [tabindex="0"]');
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
    });

})();
