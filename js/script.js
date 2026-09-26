/**
 * BOOTCAMP — Computer Club Website JavaScript
 * ============================================
 * Демонстрационная версия. Все данные хранятся в localStorage.
 * Для реального обновления статусов необходимо подключение backend.
 */

// ============================================
// 1. АКТУАЛЬНАЯ СХЕМА КЛУБА (61 ПК)
// ============================================
const ZONES = [
    { name: 'Standard+', slug: 'standard-plus', numbers: [1, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], price: 1000 },
    { name: 'Standard', slug: 'standard', numbers: [28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16], price: 800 },
    { name: 'Office', slug: 'office', numbers: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39], price: 1100 },
    { name: 'VIP 1', slug: 'vip1', numbers: [49, 50, 51, 52, 53], price: 1200 },
    { name: 'VIP 2', slug: 'vip2', numbers: [54, 55, 56], price: 1700 },
    { name: 'VIP 3', slug: 'vip3', numbers: [57, 58, 59, 60, 61], price: 1300 }
];

const PUBLIC_STATUS_API = 'https://covered-mainland-citizen-atlantic.trycloudflare.com/api/status';

const COMPUTERS_DATA = ZONES.flatMap(zone => zone.numbers.map((number, index) => ({
    id: number,
    number,
    name: `ПК ${number}`,
    zone: zone.name,
    zoneSlug: zone.slug,
    slot: index + 1,
    status: 'unknown',
    price: zone.price,
    cpu: 'Уточните у администратора',
    gpu: 'Уточните у администратора',
    ram: 'Уточните у администратора',
    monitor: 'Игровой монитор',
    mouse: 'Игровая мышь',
    keyboard: 'Игровая клавиатура',
    headset: 'Игровая гарнитура',
    chair: 'Игровое кресло'
})));

// ============================================
// 2. КАРТА КЛУБА
// ============================================

function renderClubMap() {
    const container = document.getElementById('clubMap');
    if (!container) return;

    container.innerHTML = '';
    ZONES.forEach(zone => {
        const zoneComputers = COMPUTERS_DATA.filter(pc => pc.zone === zone.name);
        const zoneEl = document.createElement('div');
        zoneEl.className = `map-zone map-zone--${zone.slug}`;
        zoneEl.innerHTML = `
            <div class="map-zone__title">
                ${zone.name}
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
    card.className = `pc-card pc-card--${pc.status}`;
    card.setAttribute('data-pc-id', pc.id);
    card.style.setProperty('--slot', pc.slot);
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
        <span class="pc-card__number">${pc.number}</span>
        <span class="pc-card__status">${getPcStatusLabel(pc)}</span>
    `;
    card.addEventListener('click', () => openPcModal(pc));
    return card;
}

function getPcStatusLabel(pc) {
    if (pc.status === 'free') return 'Свободен';
    if (pc.status !== 'busy') return 'Статус неизвестен';
    if (Number(pc.remainingSeconds) > 360000) return 'ADMIN';
    if (!Number.isFinite(pc.remainingSeconds)) return 'Занят';
    const totalMinutes = Math.max(0, Math.floor(pc.remainingSeconds / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return `${String(hours).padStart(2, '0')}:${minutes}`;
}

async function updateAvailability() {
    const state = document.getElementById('availabilityState');
    const fallback = document.getElementById('availabilityFallback');
    const apiUrl = location.hostname === '192.168.10.55' ? '/api/status' : PUBLIC_STATUS_API;
    try {
        const response = await fetch(apiUrl, { cache: 'no-store', signal: AbortSignal.timeout(7000) });
        if (!response.ok) throw new Error('status unavailable');
        const data = await response.json();
        if (!data.ok || !Array.isArray(data.computers)) throw new Error('invalid status');
        const statusByNumber = new Map(data.computers.map(pc => [Number(pc.number), pc]));
        COMPUTERS_DATA.forEach(pc => {
            const live = statusByNumber.get(pc.number);
            if (!live) return;
            pc.status = live.status;
            pc.remainingSeconds = live.remainingSeconds;
        });
        renderClubMap();
        if (state) state.textContent = `Обновлено ${new Date(data.updatedAt || Date.now()).toLocaleTimeString('ru-RU')}`;
        if (fallback) fallback.hidden = true;
    } catch {
        if (state) state.textContent = 'Связь временно недоступна — показаны последние данные';
        if (fallback) fallback.hidden = false;
    }
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
    updateAvailability();
    setInterval(updateAvailability, 5000);
    initGallery();
    initMobileMenu();
    initHeaderScroll();
    initScrollReveal();
});


// Характеристики оборудования VIP-залов.
const VIP_EQUIPMENT = {
    vip1: { monitor: 'ASUS 25″, 380 Гц', mouse: 'Lamzu Atlantis OG V2 Pro (беспроводная)', keyboard: 'Logitech G Pro', headset: 'HyperX Cloud Alpha (беспроводные)', gpu: 'RTX 4070', cpu: 'Intel Core i5-13400F', ram: '16 ГБ', chair: 'AndaSeat Kaiser 2 Big Pillow' },
    vip2: { monitor: 'Dell Alienware 25″, 500 Гц', mouse: 'Logitech G Pro X Superlight 2 (беспроводная)', keyboard: 'Logitech G Pro', headset: 'Logitech G Pro X2 Lightspeed (беспроводные)', gpu: 'RTX 4070 Ti', cpu: 'Intel Core i7-13700F', ram: '32 ГБ', chair: 'AndaSeat Kaiser 2 Big Pillow' },
    vip3: { monitor: 'ASUS 24.5″, 310 Гц', mouse: 'HyperX Pulsefire Haste 2 Pro', keyboard: 'HyperX Alloy Origins PBT', headset: 'HyperX Cloud Alpha', gpu: 'RTX 5060 Ti', cpu: 'AMD Ryzen 5 7600X', ram: '32 ГБ', chair: 'AndaSeat LUNA' }
};
COMPUTERS_DATA.forEach(pc => { const equipment = VIP_EQUIPMENT[pc.zoneSlug]; if (equipment) Object.assign(pc, equipment); });


// Карточка оборудования VIP 3.
document.addEventListener('DOMContentLoaded', () => {
    const equipmentGrid = document.querySelector('#equipment .equipment-grid');
    if (!equipmentGrid) return;
    equipmentGrid.insertAdjacentHTML('beforeend', `
        <article class="equipment-card equipment-card--featured">
            <div class="equipment-card__zone">VIP 3</div>
            <h3 class="equipment-card__title">ПК 57–61 · 5 посадочных мест</h3>
            <ul class="equipment-card__list">
                <li><span>🖥️</span><div><strong>Монитор</strong><span>ASUS 24.5″ (310 Гц)</span></div></li>
                <li><span>🖱️</span><div><strong>Мышь</strong><span>HyperX Pulsefire Haste 2 Pro</span></div></li>
                <li><span>⌨️</span><div><strong>Клавиатура</strong><span>HyperX Alloy Origins PBT</span></div></li>
                <li><span>🎧</span><div><strong>Наушники</strong><span>HyperX Cloud Alpha</span></div></li>
                <li><span>🎮</span><div><strong>Видеокарта</strong><span>RTX 5060 Ti</span></div></li>
                <li><span>⚡</span><div><strong>Процессор</strong><span>AMD Ryzen 5 7600X</span></div></li>
                <li><span>💾</span><div><strong>ОЗУ</strong><span>32 GB</span></div></li>
                <li><span>🪑</span><div><strong>Кресло</strong><span>AndaSeat LUNA</span></div></li>
            </ul>
        </article>
    `);
});
