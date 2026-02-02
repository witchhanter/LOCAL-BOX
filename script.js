const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let isModalOpen = false;
let scrollPosition = 0;
let activeSection = '';

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('mobileCartCount').textContent = count;
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const paymentItems = document.getElementById('paymentItems');
    const paymentTotal = document.getElementById('paymentTotal');
    
    let total = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        if (paymentItems) {
            paymentItems.innerHTML = '<p>Нет товаров</p>';
        }
    } else {
        cartItems.innerHTML = '';
        if (paymentItems) {
            paymentItems.innerHTML = '';
        }
        
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='images/box-starter.jpg'">
                </div>
                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <div class="cart-item-price">${item.price} ₽ × ${item.quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease-quantity" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase-quantity" data-index="${index}">+</button>
                    <button class="remove-item" data-index="${index}">✕</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
            
            if (paymentItems) {
                const paymentItem = document.createElement('div');
                paymentItem.className = 'payment-item';
                paymentItem.innerHTML = `
                    <span>${item.name} × ${item.quantity}</span>
                    <span>${item.price * item.quantity} ₽</span>
                `;
                paymentItems.appendChild(paymentItem);
            }
        });
    }
    
    cartTotal.textContent = `${total} ₽`;
    if (paymentTotal) {
        paymentTotal.textContent = `${total} ₽`;
    }
    
    saveCart();
}

function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification();
}

function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function disableScroll() {
    if (isModalOpen) return;
    
    isModalOpen = true;
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.height = '100%';
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        const header = document.querySelector('header');
        if (header) header.style.paddingRight = `${scrollbarWidth}px`;
    }
}

function enableScroll() {
    if (!isModalOpen) return;
    
    isModalOpen = false;
    
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.height = '';
    document.body.style.paddingRight = '';
    const header = document.querySelector('header');
    if (header) header.style.paddingRight = '';
    
    window.scrollTo(0, scrollPosition);
    scrollPosition = 0;
}

function closeAllModals() {
    const cartDropdown = document.getElementById('cartDropdown');
    const paymentModal = document.getElementById('paymentModal');
    const mobileNav = document.getElementById('mobileNav');
    
    cartDropdown.classList.remove('active');
    paymentModal.classList.remove('active');
    mobileNav.classList.remove('active');
    
    enableScroll();
    
    const spans = document.querySelectorAll('.menu-toggle span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
}

function smoothScrollTo(element, duration = 600) {
    const start = window.pageYOffset;
    const target = element.offsetTop - 80;
    const distance = target - start;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const ease = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, start + distance * ease);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            if (activeSection !== sectionId) {
                activeSection = sectionId;
                
                document.querySelectorAll('.desktop-nav a[href^="#"]').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
                
                document.querySelectorAll('.mobile-nav a[href^="#"]').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
}

const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (mobileNav.classList.contains('active')) {
        mobileNav.classList.remove('active');
        enableScroll();
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    } else {
        closeAllModals();
        mobileNav.classList.add('active');
        disableScroll();
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -5px)';
    }
});

document.addEventListener('click', (event) => {
    if (!menuToggle.contains(event.target) && !mobileNav.contains(event.target)) {
        mobileNav.classList.remove('active');
        enableScroll();
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            if (mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                enableScroll();
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
            
            smoothScrollTo(targetElement);
        }
    });
});

const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', toggleTheme);

const cartToggle = document.getElementById('cartToggle');
const cartDropdown = document.getElementById('cartDropdown');
const closeCart = document.getElementById('closeCart');
const mobileCartBtn = document.getElementById('mobileCartBtn');

cartToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (cartDropdown.classList.contains('active')) {
        cartDropdown.classList.remove('active');
        enableScroll();
    } else {
        closeAllModals();
        cartDropdown.classList.add('active');
        disableScroll();
    }
});

closeCart.addEventListener('click', () => {
    cartDropdown.classList.remove('active');
    enableScroll();
});

mobileCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeAllModals();
    cartDropdown.classList.add('active');
    disableScroll();
});

document.addEventListener('click', (e) => {
    if (!cartToggle.contains(e.target) && !cartDropdown.contains(e.target)) {
        cartDropdown.classList.remove('active');
        enableScroll();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        const btn = e.target;
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        const image = btn.dataset.image || 'images/box-starter.jpg';
        
        addToCart(id, name, price, image);
        
        if (window.innerWidth > 768) {
            cartDropdown.classList.add('active');
            disableScroll();
        }
    }
    
    if (e.target.classList.contains('increase-quantity')) {
        const index = parseInt(e.target.dataset.index);
        cart[index].quantity += 1;
        updateCartDisplay();
    }
    
    if (e.target.classList.contains('decrease-quantity')) {
        const index = parseInt(e.target.dataset.index);
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartDisplay();
    }
    
    if (e.target.classList.contains('remove-item')) {
        const index = parseInt(e.target.dataset.index);
        cart.splice(index, 1);
        updateCartDisplay();
    }
});

const checkoutBtn = document.getElementById('checkoutBtn');
const paymentModal = document.getElementById('paymentModal');
const closePayment = document.getElementById('closePayment');
const processPayment = document.getElementById('processPayment');

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    closeAllModals();
    paymentModal.classList.add('active');
    disableScroll();
});

closePayment.addEventListener('click', () => {
    paymentModal.classList.remove('active');
    enableScroll();
});

paymentModal.addEventListener('click', (e) => {
    if (e.target === paymentModal) {
        paymentModal.classList.remove('active');
        enableScroll();
    }
});

const paymentModalContent = document.querySelector('.payment-modal-content');
if (paymentModalContent) {
    paymentModalContent.addEventListener('wheel', (e) => {
        const isAtTop = paymentModalContent.scrollTop === 0;
        const isAtBottom = paymentModalContent.scrollHeight - paymentModalContent.scrollTop === paymentModalContent.clientHeight;
        
        if (e.deltaY < 0 && isAtTop) {
            e.preventDefault();
        }
        else if (e.deltaY > 0 && isAtBottom) {
            e.preventDefault();
        }
    }, { passive: false });
}

function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function saveOrderToLocalStorage(order) {
    try {
        const orders = JSON.parse(localStorage.getItem('lokalbox_orders') || '[]');
        orders.push(order);
        localStorage.setItem('lokalbox_orders', JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error('Error saving order:', error);
        return false;
    }
}

async function sendOrderToTelegram(order) {
    try {
        const TELEGRAM_BOT_TOKEN = window.TELEGRAM_CONFIG?.BOT_TOKEN || '';
        const TELEGRAM_CHAT_ID = window.TELEGRAM_CONFIG?.CHAT_ID || '';
        
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.warn('Telegram config not set');
            return false;
        }
        
        // Формируем сообщение
        const itemsList = order.items.map(item => 
            `  • ${item.name} × ${item.quantity} = ${item.price * item.quantity} ₽`
        ).join('\n');
        
        const message = `🛒 *НОВЫЙ ЗАКАЗ LOKAL BOX*

📦 *Заказ №:* ${order.id}
💰 *Сумма:* ${order.total} ₽
👤 *Имя:* ${order.customerName}
💳 *Оплата:* ${order.paymentMethod}
📅 *Дата:* ${order.date}
📊 *Статус:* ${order.status}

*Товары:*
${itemsList}

————————————
🌐 *Сайт:* lokalbox.ru
⏰ *Время:* ${new Date().toLocaleTimeString('ru-RU')}`;

        // Отправляем в Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });

        const result = await response.json();
        
        if (!result.ok) {
            console.error('Telegram error:', result);
            
            // Пробуем без Markdown
            const plainResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message.replace(/\*/g, ''),
                    disable_web_page_preview: true
                })
            });
            
            const plainResult = await plainResponse.json();
            return plainResult.ok;
        }
        
        return true;
        
    } catch (error) {
        console.error('Telegram send error:', error);
        return false;
    }
}

async function processRealPayment() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    const cardName = document.getElementById('cardName').value;
    
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        alert('Пожалуйста, заполните все поля карты');
        return;
    }
    
    if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Номер карты должен содержать 16 цифр');
        return;
    }
    
    const originalText = processPayment.textContent;
    processPayment.textContent = 'Обработка...';
    processPayment.disabled = true;
    
    try {
        // Симуляция обработки платежа
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Проверка тестовых карт
        const testCards = {
            '4242424242424242': 'success',
            '5555555555554444': 'success',
            '4012888888881881': 'success',
            '4000000000000002': 'insufficient_funds',
            '4000000000000069': 'expired_card',
            '4000000000000119': 'blocked_card',
            '4000000000000127': 'invalid_cvv'
        };
        
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        const cardStatus = testCards[cleanCardNumber] || 'unknown_card';
        
        if (cardStatus === 'success') {
            // 1. Создаем ID заказа
            const orderId = generateOrderId();
            
            // 2. Рассчитываем сумму
            const totalAmount = getCartTotal();
            
            // 3. Формируем заказ
            const order = {
                id: orderId,
                items: [...cart], // Копируем корзину
                total: totalAmount,
                customerName: cardName,
                paymentMethod: 'Карта ••••' + cleanCardNumber.slice(-4),
                paymentCardType: cleanCardNumber.startsWith('4') ? 'Visa' : 'MasterCard',
                status: 'Оплачено',
                date: new Date().toLocaleString('ru-RU'),
                timestamp: Date.now(),
                ip: await getClientIP(),
                userAgent: navigator.userAgent
            };
            
            // 4. Сохраняем заказ
            saveOrderToLocalStorage(order);
            
            // 5. Отправляем в Telegram
            const telegramSent = await sendOrderToTelegram(order);
            
            // 6. Очищаем корзину
            cart = [];
            updateCartDisplay();
            
            // 7. Закрываем модальное окно
            paymentModal.classList.remove('active');
            enableScroll();
            
            // 8. Очищаем форму
            document.getElementById('cardNumber').value = '';
            document.getElementById('cardExpiry').value = '';
            document.getElementById('cardCvv').value = '';
            document.getElementById('cardName').value = '';
            
            // 9. Показываем успех
            let successMessage = `✅ *Оплата прошла успешно!*\n\n📦 *Заказ №:* ${orderId}\n💰 *Сумма:* ${totalAmount} ₽\n\nМы отправили подтверждение на email (если был указан).\nЗаказ будет отправлен в течение 2 рабочих дней.`;
            
            if (!telegramSent) {
                successMessage += '\n\nℹ️ *Примечание:* Уведомление в Telegram не отправлено. Проверьте настройки.';
            }
            
            alert(successMessage);
            
        } else {
            // Обработка ошибок платежа
            let errorMessage = '';
            
            switch(cardStatus) {
                case 'insufficient_funds':
                    errorMessage = '❌ *Недостаточно средств на карте*\n\nПожалуйста, попробуйте другую карту или обратитесь в банк.';
                    break;
                    
                case 'expired_card':
                    errorMessage = '❌ *Срок действия карты истек*\n\nПожалуйста, используйте карту с действующим сроком.';
                    break;
                    
                case 'blocked_card':
                    errorMessage = '❌ *Карта заблокирована банком*\n\nПожалуйста, обратитесь в банк-эмитент или используйте другую карту.';
                    break;
                    
                case 'invalid_cvv':
                    errorMessage = '❌ *Неверный CVV код*\n\nПожалуйста, проверьте код безопасности на обратной стороне карты.';
                    break;
                    
                case 'unknown_card':
                default:
                    errorMessage = `❌ *Карта не распознана*\n\nДля тестирования используйте:\n• 4242 4242 4242 4242 - успешный платеж\n• 4000 0000 0000 0002 - недостаточно средств\n\nДата: 12/34, CVV: 123`;
                    break;
            }
            
            alert(errorMessage);
        }
        
    } catch (error) {
        console.error('Payment error:', error);
        alert(`❌ *Ошибка оплаты*\n\n${error.message}\n\nПожалуйста, попробуйте еще раз или свяжитесь с поддержкой:\n📧 hello@lokalbox.ru\n📞 8 800 123-45-67`);
    } finally {
        processPayment.textContent = originalText;
        processPayment.disabled = false;
    }
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

processPayment.addEventListener('click', processRealPayment);

document.getElementById('cardNumber').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = value.substring(0, 19);
});

document.getElementById('cardExpiry').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value.substring(0, 5);
});

document.getElementById('cardCvv').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
});

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                if (entry.target.classList.contains('step')) {
                    entry.target.classList.add('visible');
                }
                if (entry.target.classList.contains('section')) {
                    entry.target.classList.add('visible');
                }
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('visible');
                }
            }, index * 150);
        }
    });
}, observerOptions);

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 200);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
});

const brandObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
});

const businessCardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 180);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
});

function observeElements() {
    if (isModalOpen) return;
    
    document.querySelectorAll('.section').forEach(el => {
        observer.observe(el);
    });
    
    document.querySelectorAll('.step').forEach((el, i) => {
        el.style.setProperty('--i', i);
        observer.observe(el);
    });
    
    document.querySelectorAll('.card').forEach((el, i) => {
        el.style.setProperty('--i', i);
        cardObserver.observe(el);
    });
    
    document.querySelectorAll('.brand').forEach((el, i) => {
        el.style.setProperty('--i', i);
        brandObserver.observe(el);
    });
    
    document.querySelectorAll('.business-card').forEach((el, i) => {
        el.style.setProperty('--i', i);
        businessCardObserver.observe(el);
    });
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

let lastScrollTop = 0;
const header = document.querySelector('header');

function handleHeaderScroll() {
    if (isModalOpen) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    updateActiveSection();
    
    lastScrollTop = scrollTop;
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    
    setTimeout(() => {
        observeElements();
        updateActiveSection();
    }, 300);
    
    window.addEventListener('scroll', throttle(handleHeaderScroll, 100));
    
    handleHeaderScroll();
});

window.addEventListener('load', () => {
    setTimeout(() => {
        observeElements();
        updateActiveSection();
    }, 500);
});

window.addEventListener('scroll', () => {
    if (!isModalOpen) {
        observeElements();
    }
});

window.addEventListener('resize', () => {
    if (!isModalOpen) {
        setTimeout(() => {
            observeElements();
        }, 100);
    }
});

// Функция для отправки тестового уведомления (для проверки)
async function sendTestNotification() {
    const testOrder = {
        id: 'TEST-' + Date.now(),
        items: [
            { name: 'Стандарт бокс', quantity: 1, price: 990 },
            { name: 'Подарочная упаковка', quantity: 1, price: 200 }
        ],
        total: 1190,
        customerName: 'Тестовый Клиент',
        paymentMethod: 'Карта •••• 4242',
        paymentCardType: 'Visa',
        status: 'Тестовый заказ',
        date: new Date().toLocaleString('ru-RU'),
        timestamp: Date.now()
    };
    
    const result = await sendOrderToTelegram(testOrder);
    
    if (result) {
        alert('✅ Тестовое уведомление отправлено в Telegram!');
    } else {
        alert('❌ Не удалось отправить уведомление. Проверьте настройки в config.js');
    }
}

// Добавьте эту кнопку для тестирования Telegram в режиме разработки
/*
<button onclick="sendTestNotification()" style="position: fixed; bottom: 100px; right: 20px; z-index: 9999; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px;">
    Тест Telegram
</button>
*/