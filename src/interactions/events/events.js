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


async function calculateXP(baseXP) {
    const events = await getEvents();
    const currentDateObj = new Date();
    let totalXP = baseXP;

    events.forEach(event => {
        const startDate = event.startDate ? new Date(event.startDate) : null;
        const endDate = event.endDate ? new Date(event.endDate) : null;

        if ((!startDate || currentDateObj >= startDate) && (!endDate || currentDateObj <= endDate)) {
            const activities = event.activities;

            // Перевіряємо активності і множимо XP на `k`, якщо активність є
            if (activities.messages || activities.voice || activities.stage || activities.boosts) {
                totalXP *= event.k;
            }
        }
    });

    return totalXP;
}

module.exports = calculateXP;


async function calculateXPLimit(baseXP) {
    const events = await getEvents();
    const currentDateObj = new Date();
    let totalXP = baseXP;

    events.forEach(event => {
        const startDate = event.startDate ? new Date(event.startDate) : null;
        const endDate = event.endDate ? new Date(event.endDate) : null;

        if ((!startDate || currentDateObj >= startDate) && (!endDate || currentDateObj <= endDate)) {
            const activities = event.activities;

            // Перевіряємо активності і множимо XP на `k`, якщо активність є
            if (activities.messages || activities.voice || activities.stage || activities.boosts) {
                totalXP *= event.kLimit;
            }
        }
    });

    return totalXP;
}

module.exports = calculateXPLimit;