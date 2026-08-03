/**
 * BOOTCAMP — Computer Club Website JavaScript
 * ============================================
 * Демонстрационная версия. Все данные хранятся в localStorage.
 * Для реального обновления статусов необходимо подключение backend.
 */

// ============================================
// 1. ДАННЫЕ КОМПЬЮТЕРОВ (48 шт.)
// ============================================
// ПК 01-20 — Standard (20 мест)
// ПК 21-40 — Standard+ (20 мест)
// ПК 41-45 — VIP 1 (5 мест)
// ПК 46-48 — VIP 2 (3 места)

const COMPUTERS_DATA = [
    // Standard — ПК 01-20
    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `ПК ${String(i + 1).padStart(2, '0')}`,
        zone: 'Standard',
        baseStatus: 'free',
        price: 1000,
        cpu: 'Intel Core i5-12400F',
        gpu: 'NVIDIA GeForce RTX 4060',
        ram: '16 GB',
        monitor: 'ASUS 27" (280 Hz)',
        mouse: 'SteelSeries Aerox 3',
        keyboard: 'HyperX Alloy Origins Core PBT',
        headset: 'HyperX Cloud III',
        chair: 'DXRacer Prince'
    })),

    // Standard+ — ПК 21-40
    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 21,
        name: `ПК ${String(i + 21).padStart(2, '0')}`,
        zone: 'Standard+',
        baseStatus: 'free',
        price: 1100,
        cpu: 'AMD Ryzen 5 7600X',
        gpu: 'NVIDIA GeForce RTX 4060 Ti',
        ram: '32 GB',
        monitor: 'Dell Alienware 25" (360 Hz)',
        mouse: 'Lamzu Atlantis OG V2 Pro (беспроводные)',
        keyboard: 'HyperX Alloy Origins Core PBT',
        headset: 'HyperX Cloud Alpha (беспроводные)',
        chair: 'AndaSeat Luna'
    })),

    // VIP 1 — ПК 41-45
    ...Array.from({ length: 5 }, (_, i) => ({
        id: i + 41,
        name: `ПК ${String(i + 41).padStart(2, '0')}`,
        zone: 'VIP 1',
        baseStatus: 'free',
        price: 1200,
        cpu: 'Intel Core i5-13400F',
        gpu: 'NVIDIA GeForce RTX 4070',
        ram: '16 GB',
        monitor: 'ASUS 25" (380 Hz)',
        mouse: 'Lamzu Atlantis OG V2 Pro (беспроводные)',
        keyboard: 'Logitech G Pro',
        headset: 'HyperX Cloud Alpha (беспроводные)',
        chair: 'AndaSeat Kaiser 2 Big Pillow'
    })),

    // VIP 2 — ПК 46-48
    ...Array.from({ length: 3 }, (_, i) => ({
        id: i + 46,
        name: `ПК ${String(i + 46).padStart(2, '0')}`,
        zone: 'VIP 2',
        baseStatus: 'free',
        price: 1700,
        cpu: 'Intel Core i7-13700F',
        gpu: 'NVIDIA GeForce RTX 4070 Ti',
        ram: '32 GB',
        monitor: 'Dell Alienware 25" (500 Hz)',
        mouse: 'Logitech G Pro X Superlight 2 (беспроводные)',
        keyboard: 'Logitech G Pro',
        headset: 'Logitech G Pro X2 Lightspeed (беспроводные)',
        chair: 'AndaSeat Kaiser 2 Big Pillow'
    }))
];

// ============================================
// 2. КАРТА КЛУБА
// ============================================

let currentZoneFilter = 'all';

function renderClubMap() {
    const container = document.getElementById('clubMap');
    if (!container) return;

    container.innerHTML = '';
    const zones = ['Standard', 'Standard+', 'VIP 1', 'VIP 2'];

    zones.forEach(zone => {
        if (currentZoneFilter !== 'all' && currentZoneFilter !== zone) return;

        const zoneComputers = COMPUTERS_DATA.filter(pc => pc.zone === zone);
        const zoneEl = document.createElement('div');
        zoneEl.className = 'map-zone';
        zoneEl.innerHTML = `
            <div class="map-zone__title">
                ${zone}
                <span class="map-zone__count">${zoneComputers.length} мест</span>
            </div>
            <div class="map-zone__grid"></div>
        `;

        const grid = zoneEl.querySelector('.map-zone__grid');
        zoneComputers.forEach(pc => grid.appendChild(createPcCard(pc)));
        container.appendChild(zoneEl);
    });
}

function createPcCard(pc) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'pc-card';
    card.setAttribute('data-pc-id', pc.id);
    card.setAttribute('aria-label', `${pc.name}, зона ${pc.zone}`);
    card.innerHTML = `
        <span class="pc-card__icon" aria-hidden="true">
            <svg class="pc-card__svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="pcScreenGradient" x1="12" y1="12" x2="52" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#3dc2ff" />
                        <stop offset="1" stop-color="#1478ff" />
                    </linearGradient>
                    <linearGradient id="pcBodyGradient" x1="10" y1="8" x2="54" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stop-color="#18263d" />
                        <stop offset="1" stop-color="#0b1322" />
                    </linearGradient>
                </defs>
                <rect x="9" y="8" width="46" height="30" rx="6" fill="url(#pcBodyGradient)" stroke="#42A5FF" stroke-width="2"/>
                <rect x="14" y="13" width="36" height="20" rx="3.5" fill="url(#pcScreenGradient)" opacity="0.95"/>
                <path d="M18 28C22 22 30 20 38 22C41 23 45 25 48 28" stroke="#BFF2FF" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
                <rect x="27" y="39.5" width="10" height="5" rx="2.5" fill="#d9ecff" opacity="0.92"/>
                <rect x="22" y="45" width="20" height="4" rx="2" fill="#95bfff" opacity="0.82"/>
                <path d="M17 17H29" stroke="#d9f6ff" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
            </svg>
        </span>
        <span class="pc-card__number">${pc.name}</span>
    `;
    card.addEventListener('click', () => openPcModal(pc));
    return card;
}

// ============================================
// 3. ФИЛЬТР ПО ЗОНАМ
// ============================================

function initFilters() {
    const zoneButtons = document.querySelectorAll('#zoneFilters .filter-btn');
    zoneButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            zoneButtons.forEach(button => button.classList.remove('filter-btn--active'));
            btn.classList.add('filter-btn--active');
            currentZoneFilter = btn.dataset.filter;
            renderClubMap();
        });
    });
}

// ============================================
// 4. ИНФОРМАЦИЯ О КОМПЬЮТЕРЕ
// ============================================

function openPcModal(pc) {
    const body = document.getElementById('pcModalBody');
    if (!body) return;

    body.innerHTML = `
        <div class="pc-modal__header">
            <div>
                <h2 class="pc-modal__title" id="pcModalTitle">${pc.name}</h2>
                <span class="pc-modal__zone">${pc.zone}</span>
            </div>
        </div>
        <div class="pc-modal__price">${pc.price} ₸ / час</div>
        <div class="pc-modal__specs">
            <div class="pc-modal__spec"><div class="pc-modal__spec-label">Процессор</div><div class="pc-modal__spec-value">${pc.cpu}</div></div>
            <div class="pc-modal__spec"><div class="pc-modal__spec-label">Видеокарта</div><div class="pc-modal__spec-value">${pc.gpu}</div></div>
            <div class="pc-modal__spec"><div class="pc-modal__spec-label">Оперативная память</div><div class="pc-modal__spec-value">${pc.ram}</div></div>
            <div class="pc-modal__spec"><div class="pc-modal__spec-label">Монитор</div><div class="pc-modal__spec-value">${pc.monitor}</div></div>
            <div class="pc-modal__spec"><div class="pc-modal__spec-label">Мышь</div><div class="pc-modal__spec-value">${pc.mouse}</div></div>
            <div class="pc-modal__spec"><div class="pc-modal__spec-label">Клавиатура</div><div class="pc-modal__spec-value">${pc.keyboard}</div></div>
            <div class="pc-modal__spec"><div class="pc-modal__spec-label">Гарнитура</div><div class="pc-modal__spec-value">${pc.headset}</div></div>
            <div class="pc-modal__spec"><div class="pc-modal__spec-label">Кресло</div><div class="pc-modal__spec-value">${pc.chair}</div></div>
        </div>
        <div class="pc-modal__actions">
            <button class="btn btn--secondary btn--block" data-close-modal>Закрыть</button>
        </div>
    `;
    openModal('pcModal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('modal--active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const overlay = modal.querySelector('.modal__overlay');
    if (overlay) overlay.onclick = () => closeModal(modalId);
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.onclick = () => closeModal(modalId);
    });

    const escHandler = event => {
        if (event.key === 'Escape') {
            closeModal(modalId);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('modal--active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function initGallery() {
    const items = document.querySelectorAll('.gallery__item:not(.gallery__item--placeholder)');
    const modalImg = document.getElementById('galleryModalImage');
    items.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img && modalImg) {
                modalImg.src = img.src;
                modalImg.alt = img.alt;
                openModal('galleryModal');
            }
        });
    });
}

function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('nav--open');
        burger.classList.toggle('burger--active');
        burger.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav--open');
            burger.classList.remove('burger--active');
            burger.setAttribute('aria-expanded', 'false');
        });
    });
}

function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 50);
    });
}

function initScrollReveal() {
    const reveals = document.querySelectorAll('.section__header, .tariff-card, .equipment-card, .gallery__item');
    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('reveal--visible'));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal--visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    reveals.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderClubMap();
    initFilters();
    initGallery();
    initMobileMenu();
    initHeaderScroll();
    initScrollReveal();
});
