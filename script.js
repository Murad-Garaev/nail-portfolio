// Мобильное меню
document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
    document.querySelector('nav ul')?.classList.toggle('show');
});

// Лайтбокс
function setupLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<span class="lightbox-close">&times;</span><img src="" alt="">';
    document.body.appendChild(lightbox);
    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Делегирование для всех будущих изображений в галереях
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && e.target.closest('[data-lightbox]')) {
            e.preventDefault();
            openLightbox(e.target.src);
        }
    });
}

// Загрузка контента из JSON
async function fetchData(filename) {
    try {
        const res = await fetch(`/content/${filename}`);
        return await res.json();
    } catch (err) {
        console.warn(`Не удалось загрузить ${filename}`);
        return null;
    }
}

// Отображение на главной: последние 3 работы
async function loadFeatured() {
    const portfolio = await fetchData('portfolio.json');
    if (!portfolio || !portfolio.length) return;
    const featured = portfolio.slice(-3).reverse();
    const container = document.getElementById('featuredWorks');
    if (container) {
        container.innerHTML = featured.map(item => `
            <div class="work-card" data-lightbox="true">
                <img src="${item.image}" alt="${item.title}" data-lightbox="true">
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
            </div>
        `).join('');
    }
}

// Короткое "обо мне" на главной
async function loadShortAbout() {
    const settings = await fetchData('settings.json');
    const container = document.getElementById('shortAbout');
    if (container && settings?.aboutShort) {
        container.innerHTML = `<p>${settings.aboutShort}</p>`;
    }
}

// Соцсети в футере
async function loadSocials() {
    const settings = await fetchData('settings.json');
    const container = document.getElementById('footerSocials');
    if (container && settings?.socials) {
        container.innerHTML = Object.entries(settings.socials).map(([name, url]) => 
            `<a href="${url}" target="_blank" style="margin:0 8px; color:#9bbf8f;">${name}</a>`
        ).join('');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    setupLightbox();
    loadFeatured();
    loadShortAbout();
    loadSocials();
});
