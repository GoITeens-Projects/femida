const NodeCache = require("node-cache");
const Level = require("../../models/Level.js");
const messages = require("../../models/messages.js");
const antiSpam = require("../../constants/antiSpam.js");
const userMuteCooldowns = new NodeCache(); // Ініціалізація node-cache
const addPoints = require("../../utils/xp/addPoints.js");
const WarnSystem = require("../../utils/warnSystem.js");
const {
  roles: { mutedRole },
} = require("../../constants/config.js");

module.exports = async (message) => {
  const userId = message.author.id;
  const content = message.content;

  try {
    const member = message.guild.members.cache.get(userId);
    const hasAdminRole = member.roles.cache.has("953717386224226385");
    const hasModeratorRole = member.roles.cache.has("953795856308510760");

    if (hasAdminRole || hasModeratorRole) {
      return;
    }

    const currentTime = Date.now();

    const newMessage = new messages({
      userId: userId,
      message: content,
    });
    await newMessage.save();

    if (!userMuteCooldowns.has(userId)) {
      userMuteCooldowns.set(userId, currentTime, 1); // Зберігання користувача в node-cache на 1 секунду

      setTimeout(async () => {
        try {
          const countOfSameMessages = await messages.countDocuments({
            userId: userId,
            message: content,
          });

          const userMessages = await message.channel.messages.fetch({
            limit: 100,
          });

          const userSpamMessages = userMessages.filter(
            (msg) =>
              msg.author.id === userId &&
              msg.content === content &&
              msg.id !== message.id
          );

          for (const msg of userSpamMessages.values()) {
            try {
              await msg.delete();
            } catch (error) {
              console.error("Error deleting message:", error);
            }
          }

          if (countOfSameMessages >= antiSpam.warnThreshold) {
            if (countOfSameMessages >= antiSpam.muteTreshold) {
              const lastMuteTime = userMuteCooldowns.get(userId);
              const muteCooldown = 60 * 1000;

              if (!lastMuteTime || currentTime - lastMuteTime > muteCooldown) {
                const muteRole = message.guild.roles.cache.find(
                  (role) => role.id === mutedRole
                );

                if (muteRole) {
                  if (member) {
                    await member.roles.add(muteRole);
                    await message.channel.send(
                      `<@${userId}> ${antiSpam.muteMessage}`
                    );

                    userMuteCooldowns.set(userId, currentTime);

                    setTimeout(async () => {
                      try {
                        await member.roles.remove(muteRole);
                      } catch (error) {
                        console.error("Error removing mute role:", error);
                      }
                    }, antiSpam.unMuteTime * 1000);
                  }
                }
              }
            } else {
              await message.channel.send(antiSpam.warnMessage);
              const levelRecord = await Level.findOne({ userId: userId });
              if (levelRecord) {
                const newXP = Math.max(levelRecord.xp - 5, 0);
                await addPoints(userId, newXP - levelRecord.xp, true);
              }
            }

            WarnSystem.giveWarn(userId);
          }

          userMuteCooldowns.del(userId);
        } catch (error) {
          console.error("Error in spam check timeout:", error);
        }
      }, 1000);
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
};
