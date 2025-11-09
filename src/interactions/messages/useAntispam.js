const NodeCache = require("node-cache");
const antiSpam = require("../../constants/antiSpam.js");
const SettingsInterface = require("../../utils/settings");
const {
  roles: { adminRoles },
} = require("../../constants/config.js");
const WarnSystem = require("../../utils/warnSystem.js");

const myCache = new NodeCache({ stdTTL: 30 });

// Отримуємо всі налаштування антиспаму одним запитом
async function getSpamSettings() {
  try {
    const settings = await SettingsInterface.getSettings();
    const spam = settings?.spam ?? {};

    return {
      muteThreshold: spam.messagesLimit ?? antiSpam.muteTreshold,
      notifyUser: spam.actions?.notifyUser?.enabled ?? false,
      antiSpamEnabled: spam.enabled ?? true,
      deleteTimeout: spam.actions?.notifyUser?.deleteTimeoutMs ?? 5000,
      deleteMessages: spam.actions?.deleteMsg ?? true,
      muteTime: spam.actions?.mute?.muteTimeMs ?? 3600000,
      muteEnabled: spam.actions?.mute?.enabled ?? true,
      giveWarn: spam.actions?.giveWarn ?? true,
    };
  } catch (error) {
    console.error("❌ Помилка отримання налаштувань антиспаму:", error);
    return {
      muteThreshold: antiSpam.muteTreshold,
      notifyUser: false,
      antiSpamEnabled: true,
      deleteTimeout: 5000,
      deleteMessages: true,
      muteTime: 3600000,
      muteEnabled: true,
      giveWarn: true,
    };
  }
}

// Відправлення повідомлення в ЛС
async function sendDM(user, text) {
  try {
    await user.send(text);
  } catch (error) {
    console.warn(`⚠️ Не вдалося відправити повідомлення в ЛС для ${user.id}`);
  }
}

module.exports = async (message) => {
  const userId = message.author.id;
  const content = message.content;

  try {
    const {
      antiSpamEnabled,
      muteThreshold,
      notifyUser,
      deleteTimeout,
      deleteMessages,
      muteTime,
      muteEnabled,
      giveWarn,
    } = await getSpamSettings();

    if (!antiSpamEnabled) return;

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

    if (cachedMessages.length >= muteThreshold) {
      if (!muteEnabled && !giveWarn) {
        console.log(`⚠️ Спам виявлено, але ні мут, ні варн не ввімкнено.`);
        await message.channel.send(`<@${userId}> ${antiSpam.warnMessage}`);
        return;
      }

      if (muteEnabled) {
        console.log(`❗ Мутимо користувача ${userId} за спам.`);
        await member.timeout(muteTime, "Мут за спам");
        await WarnSystem.giveWarn(
          userId,
          "Спрацювання системи антиспаму",
          true
        );
        await message.channel.send(`<@${userId}> ${antiSpam.muteMessage}`);

        if (notifyUser) {
          await sendDM(
            member.user,
            `❗ Ви отримали мут за спам у сервері **${message.guild.name}**.\n\nПричина: ${antiSpam.muteMessage}`
          );
        }
      }

      if (giveWarn) {
        console.log(`⚠️ Видаємо попередження користувачу ${userId} за спам.`);
        await message.channel.send(`<@${userId}> ${antiSpam.warnMessage}`);
        await WarnSystem.giveSoftWarn(userId, "Попередження за спам", false);

        if (notifyUser) {
          await sendDM(
            member.user,
            `⚠️ Попередження! Ви підозрюєтесь у спамі на сервері **${message.guild.name}**.\n\nПричина: ${antiSpam.warnMessage}`
          );
        }
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
              try {
                await spamMessage.delete();
              } catch (e) {
                console.log(e);
              }
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
