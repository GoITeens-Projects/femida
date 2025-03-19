const NodeCache = require("node-cache");
const antiSpam = require("../../constants/antiSpam.js");
const SettingsInterface = require("../../utils/settings");
const {
    roles: { adminRoles },
} = require("../../constants/config.js");
const WarnSystem = require("../../utils/warnSystem.js");

const myCache = new NodeCache({
    stdTTL: 30, // seconds
});

async function getMuteThreshold() {
    try {
        const settings = await SettingsInterface.getSettings();
        console.log("Отримані налаштування антиспаму:", settings?.spam);
        return settings?.spam?.messagesLimit || antiSpam.muteTreshold;
    } catch (error) {
        console.error("❌ Помилка отримання muteTreshold:", error);
        return antiSpam.muteTreshold;
    }
}

async function shouldNotifyUser() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.notifyUser?.enabled ?? false; // Якщо налаштування немає - false
    } catch (error) {
        console.error("❌ Помилка отримання notifyUser.enabled:", error);
        return false;
    }
}
async function isAntiSpamEnabled() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.enabled ?? true; // Якщо налаштування немає, за замовчуванням true
    } catch (error) {
        console.error("❌ Помилка отримання spam.enabled:", error);
        return true;
    }
    
}
async function getDeleteTimeout() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.notifyUser?.deleteTimeoutMs ?? 5000; // Якщо немає в БД, дефолт - 5000 мс
    } catch (error) {
        console.error("❌ Помилка отримання deleteTimeoutMs:", error);
        return 5000;
    }
}
async function shouldDeleteMessages() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.action?.deleteMessages ?? true; // Якщо немає в БД, за замовчуванням true
    } catch (error) {
        console.error("❌ Помилка отримання action.deleteMessages:", error);
        return true;
    }
}
async function getMuteTime() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.action?.mute?.muteTimeMs ?? 60000; // 1 хвилина за замовчуванням
    } catch (error) {
        console.error("❌ Помилка отримання muteTimeMs:", error);
        return 60000;
    }
}
async function sendDM(user, text) {
    try {
        await user.send(text);
    } catch (error) {
        console.warn(`⚠️ Не вдалося відправити повідомлення в ЛС для ${user.id}`);
    }
}

module.exports = async (message) => {
     if (!(await isAntiSpamEnabled())) return; // Якщо антиспам вимкнено - виходимо
    const userId = message.author.id;
    const content = message.content;

    try {
        const member = message.guild.members.cache.get(userId);
        const hasAdminRoles = adminRoles.some((role) =>
            member.roles.cache.has(role)
        );

        if (hasAdminRoles) return;

        const cacheKey = `${userId}_${content}`;
        const cachedMessages = myCache.get(cacheKey) || [];

        cachedMessages.push({
            messageId: message.id,
            channelId: message.channel.id,
        });

        myCache.set(cacheKey, cachedMessages);
        console.log("Cached messages length:", cachedMessages.length);

        const muteTreshold = await getMuteThreshold();
        const notifyUser = await shouldNotifyUser(); // Отримуємо налаштування
        const deleteTimeout = await getDeleteTimeout(); // Отримуємо затримку перед видаленням
         const deleteMessages = await shouldDeleteMessages();
        const muteTime = await getMuteTime(); // Отримуємо час мута
        if (cachedMessages.length >= antiSpam.warnThreshold) {
            if (cachedMessages.length >= muteTreshold) {
                console.log(`❗ Мутимо користувача ${userId} за спам.`);
                await message.guild.members.cache
                    .get(userId)
                     .timeout(muteTime, "Мут за спам");
                await WarnSystem.giveWarn(
                    userId,
                    "Спрацювання системи антиспаму",
                    true
                );
                await message.channel.send(`<@${userId}> ${antiSpam.muteMessage}`);
                
                if (notifyUser) {
                    await sendDM(member.user, `❗ Ви отримали мут за спам у сервері **${message.guild.name}**.\n\nПричина: ${antiSpam.muteMessage}`);
                }
            } else {
                await message.channel.send(`<@${userId}> ${antiSpam.warnMessage}`);
                await WarnSystem.giveSoftWarn(userId, "Мут за спам", false);

                if (notifyUser) {
                    await sendDM(member.user, `⚠️ Попередження! Ви підозрюєтесь у спамі на сервері **${message.guild.name}**.\n\nПричина: ${antiSpam.warnMessage}`);
                }
                if (deleteMessages) {
                    for (const cachedMsg of cachedMessages) {
                        try {
                            const channel = message.guild.channels.cache.get(
                                cachedMsg.channelId
                            );
                            if (!channel) continue;

                            const spamMessage = await channel.messages
                                .fetch(cachedMsg.messageId)
                                .catch(() => null);
                            if (!spamMessage) continue;

                            setTimeout(async () => {
                                await spamMessage.delete();
                            }, deleteTimeout); // Використовуємо затримку з БД або 5 сек за замовчуванням
                        } catch (error) {
                            console.error("Error deleting message:", error);
                        }
                    }
                }
                return;
            }
        }
    } catch (err) {
        console.error("antispamErr:", err);
    }
};
