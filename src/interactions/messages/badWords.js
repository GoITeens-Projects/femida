// const badWords = require("../../constants/badWords");
const {
  roles: { adminRoles },
} = require("../../constants/config");
const { giveWarn, giveSoftWarn } = require("../../utils/warnSystem");
const SettingsInterface = require("../../utils/settings");
const Level = require("../../models/Level");

module.exports = async (message) => {
  try {
    if (
      !message.member.roles.cache.some((role) => adminRoles.includes(role.id))
    )
      return;

    const settings = await SettingsInterface.getSettings();
    console.log(settings.badwords.words);
    for (const word of settings.badwords.words) {
      if (!message.content.toLowerCase().includes(word.toLowerCase())) continue;
      const userObj = await Level.findOne({ userId: message.author.id });
      if (userObj) {
        if (userObj.warnings?.amount > 0) {
          await giveWarn(
            message.author.id,
            "Неодноразове використання нецензурної лексики"
          );
          message.channel.send(
            `<@${message.author.id}> не використовуй нецензурну лексику! Додаю тобі твій черговий варн`
          );
          await message.delete();
          await message.member.timeout(
            30 * 1000,
            "Не перше використання нецензурної лайки"
          );
          break;
        } else {
          await giveSoftWarn(
            message.author.id,
            "Використання нецензурної лексики (вперше)"
          );
          message.channel.send(
            `<@${message.author.id}> не використовуй нецензурну лексику! \n Так як у тебе це вперше, ти отримав(-ла) "м'яке" попередження`
          );
          message.delete();
          break;
        }
      }
      // const mutedRole = guild.roles.cache.get(mutedRoleID);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
};
