    // const SettingsInterface = require("../../utils/settings");

// async function getSpamSettings() {
//     const settings = await SettingsInterface.getSettings();
//     if (!settings || !settings.spam) {
//         console.warn("⚠️ Немає налаштувань спаму в БД, використовую дефолтне значення.");
//         return 4; // Дефолтне значення, якщо дані відсутні
//     }
//     return settings.spam.messagesLimit || 4;
// }

// module.exports = (async() => {
//     const muteTreshold = await getSpamSettings();
//     return {
//         warnThreshold: 3,
//         muteTreshold,
//         warnMessage: "Припини спамити!:warning:",
//         muteMessage: "Ти отримав мут за спам!:warning:",
//         unMuteTime: 60,
//         verbose: true,
//         removeMessages: true,
//     };
// })();
// 
module.exports = {
    warnThreshold: 3,
    muteTreshold: 4,
    warnMessage: "Припини спамити!:warning:",
    muteMessage: "Ти отримав мут за спам!:warning:",
    unMuteTime: 60,
    verbose: true,
    removeMessages: true,
};