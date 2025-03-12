const SettingsInterface = require("../../utils/settings");

async function getSpamSettings() {
    const settings = await SettingsInterface.getSettings();
  return settings.spam?.messagesLimit || 4; // Якщо в БД нема значення, то дефолтне 4
}

module.exports = (async() => {
    const muteTreshold = await getSpamSettings();
    return {
        warnThreshold: 3,
        muteTreshold,
        warnMessage: "Припини спамити!:warning:",
        muteMessage: "Ти отримав мут за спам!:warning:",
        unMuteTime: 60,
        verbose: true,
        removeMessages: true,
    };
})();