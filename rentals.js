/* ============================================================
   rentals.js — Rentals Page Logic
   Handles: dynamic product data (from rentals.json), filtering, 
   counters, booking modal
   ============================================================ */
(function () {
    'use strict';

    // ============================================================
    //  STATE & DATA
    // ============================================================
    let PRODUCTS = [];
    let currentCat = 'all';
    const quantities = {}; // Per-card quantities (keyed by product id)
    let bookingItem = null;
    let modalQty = 1;

    // Initialization: Fetch dynamic data
    async function initRentals() {
        try {
            const sanityRentals = await fetchSanity('*[_type == "rental"]');
            if (!sanityRentals) throw new Error('Failed to fetch from Sanity');
            PRODUCTS = sanityRentals.map(r => ({
                id: r._id,
                name: r.name,
                category: r.category,
                img: buildSanityImageUrl(r.image),
                tags: [],
                availability: 'available',
                description: r.description
            }));

            // Initialize quantities for each product
            PRODUCTS.forEach(p => { if (!quantities[p.id]) quantities[p.id] = 1; });

            // Run initial UI updates
            updateCounts();
            renderGrid('all');

            // Handle URL parameters (e.g., ?cat=furniture)
            const urlCat = new URLSearchParams(window.location.search).get('cat');
            if (urlCat) {
                const target = urlCat === 'furniture' ? 'all' : urlCat;
                setCategory(target);
            }
        } catch (err) {
            console.error('Error initializing rentals:', err);
            const grid = document.getElementById('productGrid');
            if (grid) grid.innerHTML = '<p class="error-msg">Unable to load catalog. Please try again later.</p>';
        }
    }

    initRentals();

    // ============================================================
    //  RENDER COUNTS IN SIDEBAR
    // ============================================================
    function updateCounts() {
        const cats = ['chairs', 'sofas', 'barstools', 'tables', 'office', 'another items', 'devices'];
        const allCount = PRODUCTS.length;

        const cntAll = document.getElementById('cnt-all');
        if (cntAll) cntAll.textContent = allCount;

        cats.forEach(c => {
            const id = c.replace(/\s+/g, '-');
            const el = document.getElementById(`cnt-${id}`);
            if (el) el.textContent = PRODUCTS.filter(p => p.category === c).length;
        });
    }

    // ============================================================
    //  CATEGORY FILTERING
    // ============================================================
    function setCategory(cat) {
        currentCat = cat;

        // Update active states on sidebar buttons
        document.querySelectorAll('.cat-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cat === cat);
        });
        // Update active states on mobile filter buttons
        document.querySelectorAll('.mcat-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.cat === cat);
        });

        renderGrid(cat);
    }

    // Bind Category Buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => setCategory(btn.dataset.cat));
    });
    document.querySelectorAll('.mcat-btn').forEach(btn => {
        btn.addEventListener('click', () => setCategory(btn.dataset.cat));
    });

    // ============================================================
    //  RENDER PRODUCT GRID
    // ============================================================
    const grid        = document.getElementById('productGrid');
    const resultsText = document.getElementById('resultsText');

    function renderGrid(cat) {
        const filtered = cat === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);

        if (resultsText) {
            resultsText.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''} ${cat !== 'all' ? 'in ' + catLabel(cat) : 'available'}`;
        }

        if (!grid) return;
        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fa-solid fa-box-open"></i>
                    <p>No items found in this category.</p>
                </div>`;
            return;
        }

        filtered.forEach((prod) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('role', 'listitem');

            const hashHTML = (prod.tags || []).map(t =>
                `<span class="hashtag">${t}</span>`
            ).join('');

            const availClass = prod.availability === 'limited' ? 'limited' : 'available';
            const availLabel = prod.availability === 'limited' ? 'Limited' : 'Available';

            card.innerHTML = `
                <div class="product-img-wrap">
                    <span class="avail-badge ${availClass}">${availLabel}</span>
                    <img src="${prod.img}" alt="${prod.name}" class="product-img" loading="lazy">
                </div>
                <div class="product-body">
                    <span class="product-cat-label">${catLabel(prod.category)}</span>
                    <h3 class="product-name">${prod.name}</h3>
                    <div class="product-hashtags">${hashHTML}</div>
                    <div class="product-qty-row" data-id="${prod.id}">
                        <button class="pqty-btn pqty-minus" data-id="${prod.id}" aria-label="Decrease quantity">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="pqty-val" id="qty-${prod.id}">${quantities[prod.id] || 1}</span>
                        <button class="pqty-btn pqty-plus" data-id="${prod.id}" aria-label="Increase quantity">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="btn-pill btn-red rent-now-btn" data-id="${prod.id}">
                    <i class="fa-solid fa-calendar-check"></i> Rent Now
                </button>
            `;

            grid.appendChild(card);
        });

        // Re-bind quantity button events for the new cards
        grid.querySelectorAll('.pqty-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (quantities[id] > 1) {
                    quantities[id]--;
                    const el = document.getElementById(`qty-${id}`);
                    if (el) el.textContent = quantities[id];
                }
            });
        });
        grid.querySelectorAll('.pqty-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                quantities[id] = (quantities[id] || 1) + 1;
                const el = document.getElementById(`qty-${id}`);
                if (el) el.textContent = quantities[id];
            });
        });

        // Re-bind Rent Now buttons
        grid.querySelectorAll('.rent-now-btn').forEach(btn => {
            btn.addEventListener('click', () => openModal(btn.dataset.id));
        });
    }

    // ============================================================
    //  BOOKING MODAL
    // ============================================================
    const modal      = document.getElementById('bookingModal');
    const bmClose    = document.getElementById('bmClose');
    const bmBackdrop = document.getElementById('bmBackdrop');
    const bmSubmit   = document.getElementById('bmSubmit');
    const bmThumb    = document.getElementById('bmThumb');
    const bmItemName = document.getElementById('bmItemName');
    const bmCatTag   = document.getElementById('bmCatTag');
    const bmHashtags = document.getElementById('bmHashtags');
    const bmQtyMinus = document.getElementById('bmQtyMinus');
    const bmQtyPlus  = document.getElementById('bmQtyPlus');
    const bmQtyValue = document.getElementById('bmQtyValue');
    const bmDateFrom = document.getElementById('bmDateFrom');
    const bmDateTo   = document.getElementById('bmDateTo');
    const bmSummary  = document.getElementById('bmSummary');

    // Set min date to today for rentals
    const todayStr = new Date().toISOString().split('T')[0];
    if (bmDateFrom) bmDateFrom.min = todayStr;
    if (bmDateTo)   bmDateTo.min   = todayStr;

    function openModal(prodId) {
        const prod = PRODUCTS.find(p => p.id === prodId);
        if (!prod || !modal) return;

        bookingItem = prod;
        modalQty    = quantities[prodId] || 1;

        // Populate modal data
        if (bmThumb) { bmThumb.src = prod.img; bmThumb.alt = prod.name; }
        if (bmItemName) bmItemName.textContent = prod.name;
        if (bmCatTag)   bmCatTag.textContent   = catLabel(prod.category);
        if (bmHashtags) bmHashtags.innerHTML   = (prod.tags || []).map(t => `<span class="hashtag">${t}</span>`).join('');
        if (bmQtyValue) bmQtyValue.textContent = modalQty;

        refreshSummary();

        modal.hidden = false;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        if (bmClose) bmClose.focus();
    }

    function closeModal() {
        if (modal) modal.hidden = true;
        document.body.style.overflow = '';
    }

    function refreshSummary() {
        if (!bmSummary) return;
        const itemS   = bmSummary.querySelector('#sumItem strong');
        const qtyS    = bmSummary.querySelector('#sumQty strong');
        const datesS  = bmSummary.querySelector('#sumDates strong');

        if (itemS)  itemS.textContent  = bookingItem ? bookingItem.name : '—';
        if (qtyS)   qtyS.textContent   = `${modalQty} unit${modalQty !== 1 ? 's' : ''}`;

        const f = bmDateFrom ? bmDateFrom.value : '';
        const t = bmDateTo   ? bmDateTo.value   : '';
        if (datesS) {
            datesS.textContent = f && t ? `${formatDate(f)} → ${formatDate(t)}` : '—';
        }
    }

    // Modal Events
    if (bmQtyMinus) bmQtyMinus.addEventListener('click', () => { if (modalQty > 1) { modalQty--; bmQtyValue.textContent = modalQty; refreshSummary(); } });
    if (bmQtyPlus)  bmQtyPlus.addEventListener('click', () => { modalQty++; bmQtyValue.textContent = modalQty; refreshSummary(); });

    if (bmDateFrom) {
        bmDateFrom.addEventListener('change', () => {
            if (bmDateTo && bmDateTo.value && bmDateTo.value < bmDateFrom.value) bmDateTo.value = bmDateFrom.value;
            if (bmDateTo) bmDateTo.min = bmDateFrom.value;
            refreshSummary();
        });
    }
    if (bmDateTo) bmDateTo.addEventListener('change', refreshSummary);

    if (bmClose)    bmClose.addEventListener('click', closeModal);
    if (bmBackdrop) bmBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal && !modal.hidden) closeModal(); });

    // Handle Form Submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', e => {
            e.preventDefault();
            const orig = bmSubmit.innerHTML;
            bmSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            bmSubmit.disabled = true;

            setTimeout(() => {
                bmSubmit.innerHTML = '<i class="fa-solid fa-circle-check"></i> Request Sent!';
                bmSubmit.style.background = '#16a34a';

                setTimeout(() => {
                    bmSubmit.innerHTML = orig;
                    bmSubmit.style.background = '';
                    bmSubmit.disabled = false;
                    bookingForm.reset();
                    modalQty = 1;
                    if (bmQtyValue) bmQtyValue.textContent = '1';
                    closeModal();
                }, 3000);
            }, 1500);
        });
    }

    // ============================================================
    //  UTILITIES
    // ============================================================
    function catLabel(cat) {
        const map = {
            'chairs': 'Chairs', 'sofas': 'Sofas', 'barstools': 'Barstools',
            'tables': 'Tables', 'office': 'Office Furniture', 'devices': 'Devices',
            'another items': 'Another Items'
        };
        return map[cat] || cat;
    }

    function formatDate(str) {
        if (!str) return '—';
        const d = new Date(str + 'T00:00:00');
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

})();
