// Мобильное меню
document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
    document.querySelector('nav ul')?.classList.toggle('show');
});

// Лайтбокс для увеличения фото
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

    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && e.target.closest('[data-lightbox]')) {
            e.preventDefault();
            openLightbox(e.target.src);
        }
    });
}

// Загрузка JSON
async function fetchData(filename) {
    try {
        const res = await fetch(`/content/${filename}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.warn(`Не удалось загрузить ${filename}`);
        return null;
    }
}

// === Главная страница ===
async function loadHomePage() {
    const settings = await fetchData('settings.json');
    const portfolio = await fetchData('portfolio.json');
    
    const heroTitle = document.querySelector('#heroTitle');
    const heroText = document.querySelector('#heroText');
    const shortAbout = document.querySelector('#shortAbout');
    const featuredWorks = document.querySelector('#featuredWorks');
    
    if (heroTitle && settings?.heroTitle) heroTitle.textContent = settings.heroTitle;
    if (heroText && settings?.heroText) heroText.textContent = settings.heroText;
    if (shortAbout && settings?.aboutShort) shortAbout.innerHTML = `<p>${settings.aboutShort}</p>`;
    
    if (featuredWorks && portfolio && portfolio.length) {
        const latest = portfolio.slice(-3).reverse();
        featuredWorks.innerHTML = latest.map(item => `
            <div class="work-card" data-lightbox="true">
                <img src="/${item.image}" alt="${item.title}" data-lightbox="true">
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
            </div>
        `).join('');
    }
}

// === Обо мне ===
async function loadAboutPage() {
    const settings = await fetchData('settings.json');
    const aboutFull = document.querySelector('#aboutFull');
    if (aboutFull && settings?.aboutFull) aboutFull.innerHTML = settings.aboutFull;
}

// === Портфолио ===
async function loadPortfolioPage() {
    const portfolio = await fetchData('portfolio.json');
    const container = document.querySelector('#portfolioGrid');
    if (container && portfolio && portfolio.length) {
        container.innerHTML = portfolio.map(item => `
            <div class="work-card" data-lightbox="true">
                <img src="/${item.image}" alt="${item.title}" data-lightbox="true">
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
            </div>
        `).join('');
    }
}

// === Услуги и цены ===
async function loadPricesPage() {
    const services = await fetchData('services.json');
    const container = document.querySelector('#servicesList');
    if (container && services && services.length) {
        container.innerHTML = services.map(service => `
            <div class="service-item">
                <h3>${service.title}</h3>
                ${service.description ? `<p>${service.description}</p>` : ''}
                <span class="price">${service.price}</span>
            </div>
        `).join('');
    }
}

// === Отзывы ===
async function loadReviewsPage() {
    const reviews = await fetchData('reviews.json');
    const container = document.querySelector('#reviewsList');
    if (container && reviews && reviews.length) {
        container.innerHTML = reviews.map(review => `
            <div class="review-card">
                ${review.photo ? `<img src="/${review.photo}" alt="${review.name}" class="review-photo">` : ''}
                <h3>${review.name}</h3>
                <p>"${review.text}"</p>
            </div>
        `).join('');
    }
}

// === Блог ===
async function loadBlogPage() {
    const blog = await fetchData('blog.json');
    const container = document.querySelector('#blogList');
    if (container && blog && blog.length) {
        container.innerHTML = blog.map(post => `
            <div class="blog-post">
                ${post.image ? `<img src="/${post.image}" alt="${post.title}" class="blog-image">` : ''}
                <h3>${post.title}</h3>
                <span class="date">${post.date}</span>
                <div class="blog-body">${post.body}</div>
            </div>
        `).join('');
    }
}

// === Контакты (соцсети из настроек) ===
async function loadContactsPage() {
    const settings = await fetchData('settings.json');
    const container = document.querySelector('#contactsInfo');
    if (container && settings) {
        let html = '';
        if (settings.phone) html += `<p>📞 ${settings.phone}</p>`;
        if (settings.email) html += `<p>✉️ ${settings.email}</p>`;
        if (settings.socials) {
            html += '<div class="social-links">';
            for (const [name, url] of Object.entries(settings.socials)) {
                html += `<a href="${url}" target="_blank">${name}</a> `;
            }
            html += '</div>';
        }
        container.innerHTML = html;
    }
}

// === Футер (соцсети) ===
async function loadFooterSocials() {
    const settings = await fetchData('settings.json');
    const container = document.querySelector('#footerSocials');
    if (container && settings?.socials) {
        container.innerHTML = Object.entries(settings.socials).map(([name, url]) => 
            `<a href="${url}" target="_blank">${name}</a>`
        ).join('');
    }
}

// Определяем, какая страница загружена, и вызываем нужную функцию
document.addEventListener('DOMContentLoaded', () => {
    setupLightbox();
    loadFooterSocials();
    
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') loadHomePage();
    else if (path.includes('about.html')) loadAboutPage();
    else if (path.includes('portfolio.html')) loadPortfolioPage();
    else if (path.includes('prices.html')) loadPricesPage();
    else if (path.includes('reviews.html')) loadReviewsPage();
    else if (path.includes('blog.html')) loadBlogPage();
    else if (path.includes('contact.html')) loadContactsPage();
});
