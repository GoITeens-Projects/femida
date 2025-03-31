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

// Отримуємо ліміт повідомлень для спрацьовування антиспаму
async function getMuteThreshold() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.messagesLimit || antiSpam.muteTreshold;
    } catch (error) {
        console.error("❌ Помилка отримання muteTreshold:", error);
        return antiSpam.muteTreshold;
    }
}

// Чи потрібно повідомляти користувача про покарання
async function shouldNotifyUser() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.actions?.notifyUser?.enabled ?? false;
    } catch (error) {
        console.error("❌ Помилка отримання notifyUser.enabled:", error);
        return false;
    }
}

// Чи ввімкнена система антиспаму
async function isAntiSpamEnabled() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.enabled ?? true;
    } catch (error) {
        console.error("❌ Помилка отримання spam.enabled:", error);
        return true;
    }
}

// Отримуємо таймаут перед видаленням повідомлення (якщо потрібно)
async function getDeleteTimeout() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.actions?.notifyUser?.deleteTimeoutMs ?? 5000;
    } catch (error) {
        console.error("❌ Помилка отримання deleteTimeoutMs:", error);
        return 5000;
    }
}

// Чи потрібно видаляти повідомлення спамера
async function shouldDeleteMessages() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.actions?.deleteMsg ?? true;
    } catch (error) {
        console.error("❌ Помилка отримання action.deleteMessages:", error);
        return true;
    }
}

// Отримуємо час мута (якщо потрібно)
async function getMuteTime() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.actions?.mute?.muteTimeMs ?? 60000;
    } catch (error) {
        console.error("❌ Помилка отримання muteTimeMs:", error);
        return 60000;
    }
}

// Чи потрібно мутити користувачів за спам (за замовчуванням true)
async function isMuteEnabled() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.actions?.mute?.enabled ?? true; 
    } catch (error) {
        console.error("❌ Помилка отримання mute.enabled:", error);
        return true; // Якщо сталася помилка, теж повертаємо true
    }
}

// Чи потрібно видавати попередження (варн) за спам (за замовчуванням true)
async function isGiveWarnEnabled() {
    try {
        const settings = await SettingsInterface.getSettings();
        return settings?.spam?.actions?.giveWarn ?? true; 
    } catch (error) {
        console.error("❌ Помилка отримання giveWarn:", error);
        return true; // Якщо сталася помилка, теж повертаємо true
    }
}

// Відправлення повідомлення користувачеві в особисті повідомлення
async function sendDM(user, text) {
    try {
        await user.send(text);
    } catch (error) {
        console.warn(`⚠️ Не вдалося відправити повідомлення в ЛС для ${user.id}`);
    }
}

module.exports = async (message) => {
    if (!(await isAntiSpamEnabled())) return; // Якщо антиспам вимкнено - вихід

    const userId = message.author.id;
    const content = message.content;

    try {
        const member = message.guild.members.cache.get(userId);
        const hasAdminRoles = adminRoles.some((role) => member.roles.cache.has(role));
        if (hasAdminRoles) return; // Якщо користувач — адмін, ігноруємо

        // Ключ для кешу, щоб відстежувати однакові повідомлення
        const cacheKey = `${userId}_${content}`;
        const cachedMessages = myCache.get(cacheKey) || [];

        cachedMessages.push({
            messageId: message.id,
            channelId: message.channel.id,
        });

        myCache.set(cacheKey, cachedMessages);
        console.log("Cached messages length:", cachedMessages.length);

        // Отримуємо всі необхідні налаштування
        const muteThreshold = await getMuteThreshold();
        const notifyUser = await shouldNotifyUser();
        const deleteTimeout = await getDeleteTimeout();
        const deleteMessages = await shouldDeleteMessages();
        const muteTime = await getMuteTime();
        const muteEnabled = await isMuteEnabled();
        const giveWarnEnabled = await isGiveWarnEnabled();

        // Якщо користувач перевищив допустиму кількість повідомлень
        if (cachedMessages.length >= muteThreshold) {
            if (!muteEnabled && !giveWarnEnabled) {
                console.log(`⚠️ Спам виявлено, але ні мут, ні варн не ввімкнено.`);
                await message.channel.send(`<@${userId}> ${antiSpam.warnMessage}`);
                return;
            }

            // Якщо мут увімкнено — видаємо мут
            if (muteEnabled) {
                console.log(`❗ Мутимо користувача ${userId} за спам.`);
                await message.guild.members.cache.get(userId).timeout(muteTime, "Мут за спам");
                await WarnSystem.giveWarn(userId, "Спрацювання системи антиспаму", true);
                await message.channel.send(`<@${userId}> ${antiSpam.muteMessage}`);

                if (notifyUser) {
                    await sendDM(member.user, `❗ Ви отримали мут за спам у сервері **${message.guild.name}**.\n\nПричина: ${antiSpam.muteMessage}`);
                }
            }

            // Якщо варни увімкнено — видаємо варн
            if (giveWarnEnabled) {
                console.log(`⚠️ Видаємо попередження користувачу ${userId} за спам.`);
                await message.channel.send(`<@${userId}> ${antiSpam.warnMessage}`);
                await WarnSystem.giveSoftWarn(userId, "Попередження за спам", false);

                if (notifyUser) {
                    await sendDM(member.user, `⚠️ Попередження! Ви підозрюєтесь у спамі на сервері **${message.guild.name}**.\n\nПричина: ${antiSpam.warnMessage}`);
                }
            }

            // Якщо потрібно видаляти повідомлення — видаляємо
            if (deleteMessages) {
                for (const cachedMsg of cachedMessages) {
                    try {
                        const channel = message.guild.channels.cache.get(cachedMsg.channelId);
                        if (!channel) continue;

                        const spamMessage = await channel.messages.fetch(cachedMsg.messageId).catch(() => null);
                        if (!spamMessage) continue;

                        setTimeout(async () => {
                            await spamMessage.delete();
                        }, deleteTimeout);
                    } catch (error) {
                        console.error("Error deleting message:", error);
                    }
                }
            }
        }
    } catch (err) {
        console.error("antispamErr:", err);
    }
};
