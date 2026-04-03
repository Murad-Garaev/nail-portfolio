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
        // Блокируем скролл фона при открытии
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { img.src = ''; }, 300);
    }

    close.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    document.addEventListener('click', (e) => {
        // Улучшенная проверка: ищем атрибут data-lightbox у изображения или родителя
        const lightboxTrigger = e.target.closest('[data-lightbox]');
        if (lightboxTrigger && e.target.tagName === 'IMG') {
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
    }, { threshold: 0.1, rootMargin: '20px' }); // Добавил rootMargin для более ранней анимации
    elements.forEach(el => observer.observe(el));
}

// ========== СЧЁТЧИК КЛИЕНТОВ ==========
function initCounter() {
    const counter = document.querySelector('.counter-number');
    if (!counter) return;
    const target = parseInt(counter.getAttribute('data-target'), 10);
    if (isNaN(target)) return; // Проверка на валидность
    
    let current = 0;
    let animationFrame = null;
    
    const updateCounter = () => {
        const increment = target / 50;
        if (current < target) {
            current = Math.min(current + increment, target);
            counter.textContent = Math.floor(current);
            animationFrame = setTimeout(updateCounter, 30);
        } else {
            counter.textContent = target;
            if (animationFrame) clearTimeout(animationFrame);
        }
    };
    
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            updateCounter();
            observer.disconnect();
        }
    }, { threshold: 0.5 }); // Увеличил порог для надежности
    
    observer.observe(counter);
}

// ========== ЛЕНИВАЯ ЗАГРУЗКА ==========
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        images.forEach(img => {
            // Если есть data-src, используем его
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            img.setAttribute('loading', 'lazy');
        });
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });
        
        images.forEach(img => {
            if (img.dataset.src) {
                observer.observe(img);
            }
        });
    }
}

// ========== ОТПРАВКА ФОРМЫ В TELEGRAM ==========
// Безопасная версия: отправка через бэкенд
function initTelegramForm() {
    const form = document.getElementById('inlineBookingForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = form.querySelector('#inlineName')?.value.trim();
        const phone = form.querySelector('#inlinePhone')?.value.trim();
        
        if (!name || !phone) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent || 'Отправить';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';
        }
        
        try {
            // ВАЖНО: токен и CHAT_ID должны быть на сервере, а не в клиентском коде!
            // Пример отправки на ваш бэкенд
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            });
            
            if (response.ok) {
                alert('✅ Заявка отправлена! Я свяжусь с вами в ближайшее время.');
                form.reset();
            } else {
                throw new Error('Server error');
            }
        } catch (err) {
            console.error('Form submission error:', err);
            alert('❌ Ошибка отправки. Попробуйте позже или напишите мне в Telegram.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

// ========== ПОПАП ПРИ ВЫХОДЕ ==========
function initExitPopup() {
    let popupShown = false;
    let hasInteracted = false; // Проверка, взаимодействовал ли пользователь с сайтом
    
    // Отмечаем, что пользователь взаимодействовал с сайтом
    const markInteraction = () => {
        hasInteracted = true;
        document.removeEventListener('click', markInteraction);
        document.removeEventListener('scroll', markInteraction);
    };
    
    document.addEventListener('click', markInteraction);
    document.addEventListener('scroll', markInteraction);
    
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
        
        setTimeout(() => popup.classList.add('active'), 10);
        
        const closePopup = () => popup.remove();
        popup.querySelector('.exit-popup-close').addEventListener('click', closePopup);
        popup.addEventListener('click', (e) => { if (e.target === popup) closePopup(); });
        
        // Закрытие по Escape
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    };
    
    let exitTimer = null;
    
    document.addEventListener('mouseleave', (e) => {
        // Показываем попап только если курсор ушел вверх и пользователь взаимодействовал с сайтом
        if (e.clientY <= 0 && hasInteracted && !popupShown) {
            // Небольшая задержка, чтобы не срабатывало слишком агрессивно
            if (exitTimer) clearTimeout(exitTimer);
            exitTimer = setTimeout(showPopup, 100);
        }
    });
}

// ========== ЗАГРУЗКА КОНТЕНТА ИЗ JSON ==========
async function fetchData(filename) {
    try {
        const res = await fetch(`content/${filename}`);
        if (!res.ok) {
            console.warn(`Ошибка загрузки ${filename}: ${res.status}`);
            return null;
        }
        return await res.json();
    } catch (err) {
        console.warn(`Не удалось загрузить ${filename}`, err);
        return null;
    }
}

// Универсальная функция загрузки данных с обработкой ошибок
async function loadPageData(pageType, containerId, dataFile, templateFn) {
    const container = document.querySelector(containerId);
    if (!container) return;
    
    const data = await fetchData(dataFile);
    if (data && data.length) {
        container.innerHTML = data.map(templateFn).join('');
    } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Если данные - объект (как settings.json)
        if (templateFn) {
            container.innerHTML = templateFn(data);
        }
    } else {
        container.innerHTML = '<p>Информация скоро появится.</p>';
    }
}

async function loadHomePage() {
    const settings = await fetchData('settings.json');
    
    const heroTitle = document.querySelector('#heroTitle');
    const heroText = document.querySelector('#heroText');
    const shortAbout = document.querySelector('#shortAbout');
    
    if (heroTitle && settings?.heroTitle) heroTitle.textContent = settings.heroTitle;
    if (heroText && settings?.heroText) heroText.textContent = settings.heroText;
    if (shortAbout && settings?.aboutShort) shortAbout.innerHTML = `<p>${settings.aboutShort}</p>`;
}

async function loadAboutPage() {
    const settings = await fetchData('settings.json');
    const aboutFull = document.querySelector('#aboutFull');
    if (aboutFull && settings?.aboutFull) {
        aboutFull.innerHTML = settings.aboutFull;
    }
}

async function loadPortfolioPage() {
    await loadPageData('portfolio', '#portfolioGrid', 'portfolio.json', item => `
        <div class="work-card" data-lightbox="true">
            <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy" data-lightbox="true">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description || '')}</p>
        </div>
    `);
}

async function loadPricesPage() {
    await loadPageData('prices', '#servicesList', 'services.json', service => `
        <div class="service-item">
            <h3>${escapeHtml(service.title)}</h3>
            ${service.description ? `<p>${escapeHtml(service.description)}</p>` : ''}
            <span class="price">${escapeHtml(service.price)}</span>
        </div>
    `);
}

async function loadReviewsPage() {
    await loadPageData('reviews', '#reviewsList', 'reviews.json', review => `
        <div class="review-card">
            ${review.photo ? `<img src="${review.photo}" alt="${escapeHtml(review.name)}" class="review-photo" loading="lazy">` : ''}
            <h3>${escapeHtml(review.name)}</h3>
            <p>"${escapeHtml(review.text)}"</p>
        </div>
    `);
}

async function loadBlogPage() {
    await loadPageData('blog', '#blogList', 'blog.json', post => `
        <div class="blog-post">
            ${post.image ? `<img src="${post.image}" alt="${escapeHtml(post.title)}" class="blog-image" loading="lazy">` : ''}
            <h3>${escapeHtml(post.title)}</h3>
            <span class="date">${escapeHtml(post.date)}</span>
            <div class="blog-body">${post.body}</div>
        </div>
    `);
}

async function loadContactsPage() {
    const settings = await fetchData('settings.json');
    const container = document.querySelector('#contactsInfo');
    if (container && settings) {
        let html = '';
        if (settings.phone) html += `<p>📞 ${escapeHtml(settings.phone)}</p>`;
        if (settings.email) html += `<p>✉️ ${escapeHtml(settings.email)}</p>`;
        if (settings.socials) {
            html += '<div class="social-links">';
            for (const [name, url] of Object.entries(settings.socials)) {
                html += `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a> `;
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
            `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>`
        ).join('');
    }
}

// ========== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ БЕЗОПАСНОСТИ ==========
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
    console.log('Текущая страница:', path);
    
    // Определяем текущую страницу более надежно
    const pageName = path.split('/').pop() || 'index.html';
    
    switch(pageName) {
        case 'index.html':
        case '':
            loadHomePage();
            break;
        case 'about.html':
            loadAboutPage();
            break;
        case 'portfolio.html':
            loadPortfolioPage();
            break;
        case 'prices.html':
            loadPricesPage();
            break;
        case 'reviews.html':
            loadReviewsPage();
            break;
        case 'blog.html':
            loadBlogPage();
            break;
        case 'contact.html':
            loadContactsPage();
            break;
        default:
            console.log('Неизвестная страница:', pageName);
    }
});

// ========== ПЛАВНАЯ СМЕНА ФОТО (5 СЕКУНД) + СТАТИЧЕСКОЕ СВЕЧЕНИЕ ==========
let imagesList = [];
let currentIndex = 0;
let isFading = false;
let intervalId = null;

// Загружаем фотографии из JSON
async function loadImages() {
    try {
        const res = await fetch('content/gallery.json');
        if (!res.ok) throw new Error();
        const data = await res.json();
        imagesList = data.images;
        if (imagesList.length) {
            await showImage(currentIndex, true);
            startAutoSlide();
        }
    } catch (err) {
        // Фото по умолчанию, если JSON нет
        imagesList = [
            { src: 'images/work1.jpg' },
            { src: 'images/work2.jpg' },
            { src: 'images/work3.jpg' }
        ];
        await showImage(currentIndex, true);
        startAutoSlide();
    }
}

// Плавная смена фото
async function showImage(index, skipFade = false) {
    if (isFading && !skipFade) return;
    if (index < 0) index = imagesList.length - 1;
    if (index >= imagesList.length) index = 0;
    if (index === currentIndex && !skipFade) return;

    isFading = true;
    const img = document.getElementById('glowImage');

    if (!skipFade) {
        img.style.transition = 'opacity 2s ease';
        img.style.opacity = '0';
        await new Promise(r => setTimeout(r, 2000));
    }

    img.src = imagesList[index].src;
    img.style.opacity = '1';

    currentIndex = index;
    isFading = false;
}

// Автоматическое переключение каждые 5 секунд
function startAutoSlide() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        if (!isFading) {
            let next = currentIndex + 1;
            if (next >= imagesList.length) next = 0;
            showImage(next);
        }
    }, 5000); // 5000 мс = 5 секунд
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    loadImages();
});