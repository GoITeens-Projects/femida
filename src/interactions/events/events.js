const SettingsInterface = require("../../utils/settings");

async function getEvents() {
    try {
     
        
        const settings = await SettingsInterface.getSettings();
        const events = settings?.events ?? []; // Переконуємось, що події є в налаштуваннях
        return events;
    } catch (error) {
        console.error("❌ Помилка отримання івентів:", error);
        return []; // Якщо сталася помилка, повертаємо порожній масив
    }
}

async function calculateXP(currentDate, baseXP) {
    // Отримуємо івенти з бази даних
    const events = await getEvents();

    // Перетворюємо поточну дату у формат Date
    const currentDateObj = new Date(currentDate);

    // Масив для зберігання результатів
    let totalXP = 0;
    let activeEvent = null; // Це буде зберігати активний івент для поточної дати

    // Перебираємо всі івенти і знаходимо той, який підходить під поточну дату
    events.forEach(event => {
        // Перевіряємо чи поточна дата входить в діапазон startDate - endDate
        const startDate = event.startDate ? new Date(event.startDate) : null;
        const endDate = event.endDate ? new Date(event.endDate) : null;

        // Якщо дата входить в діапазон, обираємо цей івент
        if ((!startDate || currentDateObj >= startDate) && (!endDate || currentDateObj <= endDate)) {
            // Якщо знайдений активний івент
            activeEvent = event; // Зберігаємо поточний івент як активний
        }
    });

    // Якщо знайдений активний івент
    if (activeEvent) {
        // Перевіряємо активності цього івенту і додаємо відповідне XP
        if (activeEvent.activities.messages) {
            totalXP += baseXP;  // Додаємо базовий XP
        }
        if (activeEvent.activities.voice) {
            totalXP += baseXP;  // Додаємо базовий XP
        }
        if (activeEvent.activities.stage) {
            totalXP += baseXP;  // Додаємо базовий XP
        }
        if (activeEvent.activities.boosts) {
            totalXP += baseXP;  // Додаємо базовий XP
        }
    }

    return totalXP;
}

module.exports = calculateXP;
