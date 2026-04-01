// ========== МОБИЛЬНОЕ МЕНЮ ==========
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    if (!btn) return;

    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.innerHTML = `
        <div class="mobile-nav-close">&times;</div>
        <ul>
            <li><a href="index.html">Главная</a></li>
            <li><a href="about.html">Обо мне</a></li>
            <li><a href="portfolio.html">Портфолио</a></li>
            <li><a href="prices.html">Услуги и цены</a></li>
            <li><a href="reviews.html">Отзывы</a></li>
            <li><a href="blog.html">Блог</a></li>
            <li><a href="contact.html">Контакты</a></li>
        </ul>
    `;
    document.body.appendChild(overlay);

    btn.addEventListener('click', () => overlay.classList.add('active'));
    overlay.querySelector('.mobile-nav-close').addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
}

// ========== ЛАЙТБОКС ==========
function initLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<span class="lightbox-close">&times;</span><img src="" alt="">';
    document.body.appendChild(lightbox);
    const img = lightbox.querySelector('img');
    const close = lightbox.querySelector('.lightbox-close');

    function open(src) {
        img.src = src;
        lightbox.classList.add('active');
    }
    function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => { img.src = ''; }, 300);
    }

    close.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && e.target.closest('[data-lightbox]')) {
            e.preventDefault();
            open(e.target.src);
        }
    });
}

// ========== АНИМАЦИЯ ПРИ СКРОЛЛЕ ==========
function initScrollAnimation() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    elements.forEach(el => observer.observe(el));
}

// ========== СЧЁТЧИК КЛИЕНТОВ ==========
function initCounter() {
    const counter = document.querySelector('.counter-number');
    if (!counter) return;
    const target = parseInt(counter.getAttribute('data-target'), 10);
    let current = 0;
    const updateCounter = () => {
        const increment = target / 50;
        if (current < target) {
            current = Math.min(current + increment, target);
            counter.textContent = Math.floor(current);
            setTimeout(updateCounter, 30);
        } else {
            counter.textContent = target;
        }
    };
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            updateCounter();
            observer.disconnect();
        }
    });
    observer.observe(counter);
}

// ========== ЛЕНИВАЯ ЗАГРУЗКА ==========
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        images.forEach(img => img.setAttribute('loading', 'lazy'));
    } else {
        // Fallback для старых браузеров
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => observer.observe(img));
    }
}

// ========== ОТПРАВКА ФОРМЫ В TELEGRAM ==========
function initTelegramForm() {
    const form = document.getElementById('inlineBookingForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.querySelector('#inlineName').value;
        const phone = form.querySelector('#inlinePhone').value;
        const text = `Новая заявка с сайта:\nИмя: ${name}\nТелефон: ${phone}`;
        // Вставьте сюда свой токен бота и chat_id
        const BOT_TOKEN = 'ВАШ_ТОКЕН_БОТА';
        const CHAT_ID = 'ВАШ_CHAT_ID';
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: CHAT_ID, text: text })
            });
            alert('Заявка отправлена! Я свяжусь с вами в ближайшее время.');
            form.reset();
        } catch (err) {
            alert('Ошибка отправки. Попробуйте позже или напишите мне в Telegram.');
        }
    });
}

// ========== ПОПАП ПРИ ВЫХОДЕ ==========
function initExitPopup() {
    let popupShown = false;
    const showPopup = () => {
        if (popupShown) return;
        popupShown = true;
        const popup = document.createElement('div');
        popup.className = 'exit-popup';
        popup.innerHTML = `
            <div class="exit-popup-content">
                <span class="exit-popup-close">&times;</span>
                <h3>Не уходите!</h3>
                <p>Оставьте заявку и получите скидку 10% на первый визит</p>
                <a href="https://ваша-ссылка-на-запись.ru" class="btn-primary" target="_blank">Записаться</a>
            </div>
        `;
        document.body.appendChild(popup);
        popup.classList.add('active');
        popup.querySelector('.exit-popup-close').addEventListener('click', () => popup.remove());
        popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
    };
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0) showPopup();
    });
}

// ========== СЛАЙДЕР (карусель) ==========
function initSlider() {
    const container = document.querySelector('.slider-container');
    if (!container) return;
    let current = 0;
    const slides = container.querySelectorAll('.slider-slide');
    const total = slides.length;
    const nextBtn = container.querySelector('.slider-next');
    const prevBtn = container.querySelector('.slider-prev');
    const dotsContainer = container.querySelector('.slider-dots');
    
    function updateSlider() {
        const offset = -current * 100;
        container.querySelector('.slider-track').style.transform = `translateX(${offset}%)`;
        dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });
    }
    function next() { current = (current + 1) % total; updateSlider(); }
    function prev() { current = (current - 1 + total) % total; updateSlider(); }
    
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === current ? ' active' : '');
        dot.addEventListener('click', () => { current = i; updateSlider(); });
        dotsContainer.appendChild(dot);
    }
    
    let interval = setInterval(next, 5000);
    container.addEventListener('mouseenter', () => clearInterval(interval));
    container.addEventListener('mouseleave', () => { interval = setInterval(next, 5000); });
}

// ========== ЗАГРУЗКА КОНТЕНТА ИЗ JSON ==========
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

async function loadHomePage() {
    const settings = await fetchData('settings.json');
    const portfolio = await fetchData('portfolio.json');
    
    document.querySelector('#heroTitle').textContent = settings?.heroTitle || 'Создаю красоту на ваших руках';
    document.querySelector('#heroText').textContent = settings?.heroText || 'Маникюр, педикюр, дизайн – с любовью к деталям';
    document.querySelector('#shortAbout').innerHTML = `<p>${settings?.aboutShort || ''}</p>`;
    
    const sliderTrack = document.querySelector('.slider-track');
    if (sliderTrack && portfolio?.length) {
        sliderTrack.innerHTML = portfolio.slice(-5).reverse().map(item => `
            <div class="slider-slide">
                <img src="/${item.image}" alt="${item.title}" loading="lazy" data-lightbox="true">
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
            </div>
        `).join('');
        initSlider();
    }
}

async function loadAboutPage() {
    const settings = await fetchData('settings.json');
    document.querySelector('#aboutFull').innerHTML = settings?.aboutFull || '';
}

async function loadPortfolioPage() {
    const portfolio = await fetchData('portfolio.json');
    const grid = document.querySelector('#portfolioGrid');
    if (grid && portfolio?.length) {
        grid.innerHTML = portfolio.map(item => `
            <div class="work-card" data-lightbox="true">
                <img src="/${item.image}" alt="${item.title}" loading="lazy" data-lightbox="true">
                <h3>${item.title}</h3>
                <p>${item.description || ''}</p>
            </div>
        `).join('');
    }
}

async function loadPricesPage() {
    const services = await fetchData('services.json');
    const container = document.querySelector('#servicesList');
    if (container && services?.length) {
        container.innerHTML = services.map(service => `
            <div class="service-item">
                <h3>${service.title}</h3>
                ${service.description ? `<p>${service.description}</p>` : ''}
                <span class="price">${service.price}</span>
            </div>
        `).join('');
    }
}

async function loadReviewsPage() {
    const reviews = await fetchData('reviews.json');
    const container = document.querySelector('#reviewsList');
    if (container && reviews?.length) {
        container.innerHTML = reviews.map(review => `
            <div class="review-card">
                ${review.photo ? `<img src="/${review.photo}" alt="${review.name}" class="review-photo" loading="lazy">` : ''}
                <h3>${review.name}</h3>
                <p>"${review.text}"</p>
            </div>
        `).join('');
    }
}

async function loadBlogPage() {
    const blog = await fetchData('blog.json');
    const container = document.querySelector('#blogList');
    if (container && blog?.length) {
        container.innerHTML = blog.map(post => `
            <div class="blog-post">
                ${post.image ? `<img src="/${post.image}" alt="${post.title}" class="blog-image" loading="lazy">` : ''}
                <h3>${post.title}</h3>
                <span class="date">${post.date}</span>
                <div class="blog-body">${post.body}</div>
            </div>
        `).join('');
    }
}

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

async function loadFooterSocials() {
    const settings = await fetchData('settings.json');
    const container = document.querySelector('#footerSocials');
    if (container && settings?.socials) {
        container.innerHTML = Object.entries(settings.socials).map(([name, url]) => 
            `<a href="${url}" target="_blank">${name}</a>`
        ).join('');
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initLightbox();
    initScrollAnimation();
    initCounter();
    initLazyLoading();
    initTelegramForm();
    initExitPopup();
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
