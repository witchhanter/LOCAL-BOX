// config.js - РЕАЛЬНЫЕ ДАННЫЕ

window.TELEGRAM_CONFIG = {
    BOT_TOKEN: '8279089726:AAEgvJvTumogTomlK8_KF4Hmap0_xSjDY80', // ваш токен бота
    CHAT_ID: '5419768999' // ваш chat_id
};

// Пример конфигурации для платежной системы
window.PAYMENT_CONFIG = {
    // Для ЮKassa
    YOOKASSA: {
        SHOP_ID: '',
        SECRET_KEY: '',
        API_URL: 'https://api.yookassa.ru/v3/'
    },
    
    // Для CloudPayments
    CLOUDPAYMENTS: {
        PUBLIC_ID: '',
        API_SECRET: '',
        API_URL: 'https://api.cloudpayments.ru/'
    },
    
    // Режим работы
    MODE: 'test', // 'test' или 'production'
    
    // Валюты
    CURRENCY: 'RUB',
    
    // Описание платежа
    DESCRIPTION_PREFIX: 'LOKAL BOX - Заказ №'
};