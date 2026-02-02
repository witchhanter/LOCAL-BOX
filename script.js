// Инициализация темы
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

// Корзина
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let isModalOpen = false;
let scrollPosition = 0;
let activeSection = '';

// Параллакс эффект
let heroBackground = null;

// Флаг для анимации хедера
window.headerAnimationPlayed = false;

// Сохранение корзины
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Обновление счетчика корзины
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
    document.getElementById('mobileCartCount').textContent = count;
    document.getElementById('cartCountFab').textContent = count;
}

// Обновление отображения корзины
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const fullscreenCartItems = document.getElementById('fullscreenCartItems');
    const fullscreenCartTotal = document.getElementById('fullscreenCartTotal');
    const paymentItems = document.getElementById('paymentItems');
    const paymentTotal = document.getElementById('paymentTotal');
   
    let total = 0;
   
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        if (fullscreenCartItems) {
            fullscreenCartItems.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
        }
        if (paymentItems) {
            paymentItems.innerHTML = '<p>Нет товаров</p>';
        }
    } else {
        cartItems.innerHTML = '';
        if (fullscreenCartItems) {
            fullscreenCartItems.innerHTML = '';
        }
        if (paymentItems) {
            paymentItems.innerHTML = '';
        }
       
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
           
            // Десктопная корзина
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.setAttribute('data-item-index', index);
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
                    <button class="remove-item" data-index="${index}" data-item-id="${item.id}">✕</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
           
            // Мобильная полностраничная корзина
            if (fullscreenCartItems) {
                const fullscreenCartItem = document.createElement('div');
                fullscreenCartItem.className = 'cart-item';
                fullscreenCartItem.setAttribute('data-item-index', index);
                fullscreenCartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='images/box-starter.jpg'">
                    </div>
                    <div class="cart-item-info">
                        <h5>${item.name}</h5>
                        <div class="cart-item-price">${item.price} ₽ × ${item.quantity}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn decrease-quantity-fullscreen" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase-quantity-fullscreen" data-index="${index}">+</button>
                        <button class="remove-item remove-item-fullscreen" data-index="${index}" data-item-id="${item.id}">✕</button>
                    </div>
                `;
                fullscreenCartItems.appendChild(fullscreenCartItem);
            }
           
            // Корзина в окне оплаты
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
    if (fullscreenCartTotal) {
        fullscreenCartTotal.textContent = `${total} ₽`;
    }
    if (paymentTotal) {
        paymentTotal.textContent = `${total} ₽`;
    }
   
    saveCart();
}

// Добавление в корзину
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

// Удаление из корзины (исправленная версия)
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        updateCartDisplay();
    }
}

// Показать уведомление
function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show');
   
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Блокировка скролла
function disableScroll() {
    if (isModalOpen) return;
   
    isModalOpen = true;
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
   
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
   
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        const header = document.querySelector('header');
        if (header) header.style.paddingRight = `${scrollbarWidth}px`;
    }
}

// Разблокировка скролла
function enableScroll() {
    if (!isModalOpen) return;
   
    isModalOpen = false;
   
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    
    const header = document.querySelector('header');
    if (header) header.style.paddingRight = '';
   
    window.scrollTo(0, scrollPosition);
    scrollPosition = 0;
}

// Закрыть все модальные окна
function closeAllModals() {
    const cartDropdown = document.getElementById('cartDropdown');
    const paymentModal = document.getElementById('paymentModal');
    const fullscreenCartModal = document.getElementById('fullscreenCartModal');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const menuToggle = document.getElementById('menuToggle');
   
    cartDropdown.classList.remove('active');
    paymentModal.classList.remove('active');
    fullscreenCartModal.classList.remove('active');
    mobileNav.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
   
    enableScroll();
}

// Плавный скролл
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

// Обновление активной секции
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
               
                document.querySelectorAll('.nav-item[href^="#"]').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
               
                document.querySelectorAll('.mobile-nav-link[href^="#"]').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
}

// Мобильное меню
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');
const closeMenu = document.getElementById('closeMenu');

function toggleMobileMenu() {
    if (mobileNav.classList.contains('active')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    closeAllModals();
    mobileNav.classList.add('active');
    mobileNavOverlay.classList.add('active');
    menuToggle.classList.add('active');
    disableScroll();
}

function closeMobileMenu() {
    mobileNav.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
    enableScroll();
}

menuToggle.addEventListener('click', toggleMobileMenu);
closeMenu.addEventListener('click', closeMobileMenu);
mobileNavOverlay.addEventListener('click', closeMobileMenu);

// Навигация по якорям
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
       
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
       
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            closeMobileMenu();
            smoothScrollTo(targetElement);
        }
    });
});

// Переключение темы
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
    if (theme === 'dark') {
        document.querySelector('.sun-icon').style.display = 'none';
        document.querySelector('.moon-icon').style.display = 'block';
    } else {
        document.querySelector('.sun-icon').style.display = 'block';
        document.querySelector('.moon-icon').style.display = 'none';
    }
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', () => {
    toggleTheme();
    closeMobileMenu();
});

// Корзина десктоп
const cartToggle = document.getElementById('cartToggle');
const cartDropdown = document.getElementById('cartDropdown');
const closeCart = document.getElementById('closeCart');

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

// Мобильная корзина
const mobileCartBtn = document.getElementById('mobileCartBtn');
const mobileCartFab = document.getElementById('mobileCartFab');
const fullscreenCartModal = document.getElementById('fullscreenCartModal');
const closeFullscreenCart = document.getElementById('closeFullscreenCart');
const fullscreenCheckoutBtn = document.getElementById('fullscreenCheckoutBtn');
const testPaymentModalBtn = document.getElementById('testPaymentModalBtn');

function openFullscreenCart() {
    closeAllModals();
    fullscreenCartModal.classList.add('active');
    disableScroll();
}

mobileCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openFullscreenCart();
});

mobileCartFab.addEventListener('click', (e) => {
    e.preventDefault();
    openFullscreenCart();
});

closeFullscreenCart.addEventListener('click', () => {
    fullscreenCartModal.classList.remove('active');
    enableScroll();
});

fullscreenCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Корзина пуста!');
        return;
    }
    fullscreenCartModal.classList.remove('active');
    paymentModal.classList.add('active');
});

// Обработчик кликов вне корзины
document.addEventListener('click', (e) => {
    if (!cartToggle.contains(e.target) && !cartDropdown.contains(e.target)) {
        cartDropdown.classList.remove('active');
        enableScroll();
    }
});

// Обработка Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// Делегирование событий для корзины
document.addEventListener('click', (e) => {
    // Добавление в корзину
    if (e.target.classList.contains('add-to-cart')) {
        const btn = e.target;
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = parseInt(btn.dataset.price);
        const image = btn.dataset.image || 'images/box-starter.jpg';
       
        addToCart(id, name, price, image);
       
        // На мобильных открываем полностраничную корзину
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                openFullscreenCart();
            }, 300);
        } else {
            // На десктопе открываем выпадающую корзину
            cartDropdown.classList.add('active');
            disableScroll();
        }
    }
   
    // Увеличение количества (десктоп)
    if (e.target.classList.contains('increase-quantity')) {
        const index = parseInt(e.target.dataset.index);
        cart[index].quantity += 1;
        updateCartDisplay();
    }
   
    // Уменьшение количества (десктоп)
    if (e.target.classList.contains('decrease-quantity')) {
        const index = parseInt(e.target.dataset.index);
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            removeFromCart(index);
        }
        updateCartDisplay();
    }
   
    // Удаление (десктоп) - исправленная версия
    if (e.target.classList.contains('remove-item')) {
        const index = parseInt(e.target.dataset.index);
        const itemId = e.target.dataset.itemId;
        // Проверяем, что индекс соответствует товару
        if (cart[index] && cart[index].id === itemId) {
            removeFromCart(index);
        } else {
            // Если индекс не совпадает, ищем товар по ID
            const actualIndex = cart.findIndex(item => item.id === itemId);
            if (actualIndex !== -1) {
                removeFromCart(actualIndex);
            }
        }
    }
   
    // Увеличение количества (мобильная полностраничная)
    if (e.target.classList.contains('increase-quantity-fullscreen')) {
        const index = parseInt(e.target.dataset.index);
        cart[index].quantity += 1;
        updateCartDisplay();
    }
   
    // Уменьшение количества (мобильная полностраничная)
    if (e.target.classList.contains('decrease-quantity-fullscreen')) {
        const index = parseInt(e.target.dataset.index);
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            removeFromCart(index);
        }
        updateCartDisplay();
    }
   
    // Удаление (мобильная полностраничная) - исправленная версия
    if (e.target.classList.contains('remove-item-fullscreen')) {
        const index = parseInt(e.target.dataset.index);
        const itemId = e.target.dataset.itemId;
        // Проверяем, что индекс соответствует товару
        if (cart[index] && cart[index].id === itemId) {
            removeFromCart(index);
        } else {
            // Если индекс не совпадает, ищем товар по ID
            const actualIndex = cart.findIndex(item => item.id === itemId);
            if (actualIndex !== -1) {
                removeFromCart(actualIndex);
            }
        }
    }
});

// Окно оплаты
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

// Форматирование карты
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

// Обработка оплаты
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
            // Генерация ID заказа
            const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
           
            // Рассчет суммы
            const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
           
            // Формируем заказ
            const order = {
                id: orderId,
                items: [...cart],
                total: totalAmount,
                customerName: cardName,
                paymentMethod: 'Карта ••••' + cleanCardNumber.slice(-4),
                paymentCardType: cleanCardNumber.startsWith('4') ? 'Visa' : 'MasterCard',
                status: 'Оплачено',
                date: new Date().toLocaleString('ru-RU'),
                timestamp: Date.now()
            };
           
            // Отправляем в Telegram
            const telegramSent = await sendOrderToTelegram(order);
           
            // Очистка корзины
            cart = [];
            updateCartDisplay();
           
            // Закрытие модального окна
            paymentModal.classList.remove('active');
            enableScroll();
           
            // Очистка формы
            document.getElementById('cardNumber').value = '';
            document.getElementById('cardExpiry').value = '';
            document.getElementById('cardCvv').value = '';
            document.getElementById('cardName').value = '';
           
            // Успешное сообщение
            let successMessage = `✅ *Оплата прошла успешно!*\n\n📦 *Заказ №:* ${orderId}\n💰 *Сумма:* ${totalAmount} ₽\n\nЗаказ будет отправлен в течение 2 рабочих дней.`;
           
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

processPayment.addEventListener('click', processRealPayment);

// Функция для отправки тестового уведомления в Telegram
async function sendTestNotification() {
    try {
        const testOrder = {
            id: 'TEST-' + Date.now(),
            items: [
                { name: 'Тестовый товар 1', quantity: 2, price: 500 },
                { name: 'Тестовый товар 2', quantity: 1, price: 1000 }
            ],
            total: 2000,
            customerName: 'Тестовый Клиент',
            paymentMethod: 'Карта •••• 4242',
            paymentCardType: 'Visa',
            status: 'Тестовый заказ',
            date: new Date().toLocaleString('ru-RU'),
            timestamp: Date.now()
        };
       
        // Отправка в Telegram
        const result = await sendOrderToTelegram(testOrder);
       
        if (result) {
            alert('✅ Тестовое уведомление отправлено в Telegram!');
        } else {
            alert('❌ Не удалось отправить уведомление. Проверьте настройки в config.js');
        }
    } catch (error) {
        console.error('Test notification error:', error);
        alert('❌ Ошибка при отправке тестового уведомления');
    }
}

// Назначаем функцию для кнопки теста
testPaymentModalBtn.addEventListener('click', sendTestNotification);

// Функция для отправки заказа в Telegram (исправленная)
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
            ` • ${item.name} × ${item.quantity} = ${item.price * item.quantity} ₽`
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

// Параллакс эффект для hero секции
function initParallax() {
    heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;
    
    window.addEventListener('scroll', () => {
        if (!heroBackground || isModalOpen) return;
        
        const scrolled = window.pageYOffset;
        // Фон движется медленнее (0.5 скорости скролла)
        const rate = scrolled * 0.5;
        heroBackground.style.transform = `translate3d(0, ${rate}px, 0)`;
    });
}

// Анимация при скролле
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
                if (entry.target.classList.contains('hero')) {
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
}

// Функция для анимации элементов хедера (с защитой от повторного запуска)
function animateHeaderElements() {
    // Проверяем, была ли уже запущена анимация
    if (window.headerAnimationPlayed) {
        return;
    }
    
    // Анимируем логотип
    const logo = document.querySelector('.logo');
    if (logo && !logo.classList.contains('animate')) {
        logo.classList.add('animate');
    }
    
    // Анимируем кнопки действий (корзина и тема)
    const navActions = document.querySelector('.nav-actions');
    if (navActions && !navActions.classList.contains('animate')) {
        navActions.classList.add('animate');
    }
    
    // Анимируем пункты меню (только на десктопе)
    if (window.innerWidth > 768) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            if (!item.classList.contains('animate')) {
                setTimeout(() => {
                    item.classList.add('animate');
                }, 300 + (index * 100));
            }
        });
    }
    
    // Помечаем, что анимация уже была запущена
    window.headerAnimationPlayed = true;
}

// Функция для сброса анимации (на случай, если нужно перезапустить)
function resetHeaderAnimation() {
    const logo = document.querySelector('.logo');
    const navActions = document.querySelector('.nav-actions');
    const navItems = document.querySelectorAll('.nav-item');
    
    if (logo) logo.classList.remove('animate');
    if (navActions) navActions.classList.remove('animate');
    navItems.forEach(item => item.classList.remove('animate'));
    
    window.headerAnimationPlayed = false;
}

// Хедер при скролле
let lastScrollTop = 0;
const header = document.querySelector('header');

function handleHeaderScroll() {
    if (isModalOpen) return;
   
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
   
    if (scrollTop > 50) {
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

// Обработчик изменения размера окна
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    
    resizeTimeout = setTimeout(() => {
        // Если перешли на десктоп размер и анимация еще не запускалась
        if (window.innerWidth > 768 && !window.headerAnimationPlayed) {
            animateHeaderElements();
        }
        
        // Если перешли на мобильный размер, сбрасываем анимацию меню
        if (window.innerWidth <= 768) {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('animate'));
        }
    }, 250);
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    initParallax();
    
    // Сброс анимации при загрузке
    resetHeaderAnimation();
   
    // Анимация hero секции
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        setTimeout(() => {
            heroSection.classList.add('visible');
        }, 300);
    }
   
    // Запускаем анимацию хедера после небольшой задержки
    setTimeout(() => {
        animateHeaderElements();
    }, 500);
   
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