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

async function calculateXP() {
    const events = await getEvents(); // Отримуємо івенти з бази даних
    const currentDateObj = new Date();
    let totalXP = 0;

    events.forEach(event => {
        const startDate = event.startDate ? new Date(event.startDate) : null;
        const endDate = event.endDate ? new Date(event.endDate) : null;

        if ((!startDate || currentDateObj >= startDate) && (!endDate || currentDateObj <= endDate)) {
            const activities = event.activities;

            // Перевіряємо активності і додаємо значення `k` за кожну активність
            totalXP += activities.messages || activities.voice || activities.stage || activities.boosts ? event.k : 0;
        }
    });

    return totalXP;
}


module.exports = calculateXP;
