const NodeCache = require("node-cache");
const antiSpam = require("../../constants/antiSpam.js");
const {
  roles: { adminRoles },
} = require("../../constants/config.js");
const WarnSystem = require("../../utils/warnSystem.js");
const myCache = new NodeCache({
  stdTTL: 30, // seconds
});

module.exports = async (message) => {
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

    if (cachedMessages.length >= antiSpam.warnThreshold) {
      if (cachedMessages.length >= antiSpam.muteTreshold) {
        await message.guild.members.cache
          .get(userId)
          .timeout(60000, "Мут за спам");
        await WarnSystem.giveWarn(
          userId,
          "Спрацювання системи антиспаму",
          true
        );
        await message.channel.send(`<@${userId}> ${antiSpam.muteMessage}`);
      } else {
        await message.channel.send(`<@${userId}> ${antiSpam.warnMessage}`);
        await WarnSystem.giveSoftWarn(userId, "Мут за спам", false);
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

            await spamMessage.delete();
          } catch (error) {
            console.error("Error deleting message:", error);
          }
        }
        return;
      }
    }
  } catch (err) {
    console.error("antispamErr:", err);
  }
};
