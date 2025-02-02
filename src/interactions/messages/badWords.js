// const badWords = require("../../constants/badWords");
const {
  roles: { adminRoles },
} = require("../../constants/config");
const { giveWarn, giveSoftWarn } = require("../../utils/warnSystem");
const SettingsInterface = require("../../utils/settings");
const Level = require("../../models/Level");
const addNewMember = require("../addNewMember");

async function firstWarn(message, settings) {
  if (settings.badwords.actions.giveWarn)
    await giveSoftWarn(
      message.author.id,
      "Використання нецензурної лексики (вперше)"
    );
  if (settings.badwords.actions.notifyUser.enabled)
    message.channel.send(
      `<@${message.author.id}> не використовуй нецензурну лексику! \n Так як у тебе це вперше, ти отримав(-ла) "м'яке" попередження`
    );
  if (settings.badwords.actions.deleteMsg) message.delete();
}

async function anotherWarn(message, settings) {
  if (settings.badwords.actions.giveWarn)
    await giveWarn(
      message.author.id,
      "Неодноразове використання нецензурної лексики"
    );
  if (settings.badwords.actions.notifyUser.enabled)
    message.channel.send(
      `<@${message.author.id}> не використовуй нецензурну лексику! Додаю тобі твій черговий варн`
    );
  if (settings.badwords.actions.deleteMsg) await message.delete();
  if (settings.badwords.actions.mute.enabled)
    await message.member.timeout(
      settings.mute.muteTimeMs ? settings.mute.muteTimeMs : 1000 * 60 * 30,
      "Не перше використання нецензурної лайки"
    );
}

module.exports = async (message) => {
  try {
    const settings = await SettingsInterface.getSettings();
    if (!settings.badwords.enabled) return;

    if (
      message.member.roles.cache.some((role) => adminRoles.includes(role.id)) &&
      settings.badwords.actions.ignoreAdmins
    )
      return;

    for (const word of settings.badwords.words) {
      if (!message.content.toLowerCase().includes(word.toLowerCase())) continue;
      let userObj = await Level.findOne({ userId: message.author.id });
      if (!userObj) {
        addNewMember(null, message);
        userObj = await Level.findOne({ userId: message.author.id });
      }
      if (!settings.badwords.actions.giveWarn) break;
      if (userObj.warnings?.amount > 0) {
        // await giveWarn(
        //   message.author.id,
        //   "Неодноразове використання нецензурної лексики"
        // );
        // message.channel.send(
        //   `<@${message.author.id}> не використовуй нецензурну лексику! Додаю тобі твій черговий варн`
        // );
        // await message.delete();
        // await message.member.timeout(
        //   settings.mute.muteTimeMs ? settings.mute.muteTimeMs : 1000 * 60 * 30,
        //   "Не перше використання нецензурної лайки"
        // );
        await anotherWarn(message);
        break;
      } else {
        await firstWarn(message);
        break;
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
};
