// const badWords = require("../../constants/badWords");
const {
  roles: { adminRoles },
} = require("../../constants/config");
const { giveWarn, giveSoftWarn } = require("../../utils/warnSystem");
const SettingsInterface = require("../../utils/settings");
const Level = require("../../models/Level");
const addNewMember = require("../addNewMember");
const decodeMessage = require("../../utils/decodeMessage");
const main = require("../../index");
const { guildId } = require("../../constants/config");

function checkMessageBadWords(msg, word) {
  const regex = new RegExp(`\\b${word}\\b`, "i");
  return regex.test(msg);
}

async function notifyUser(settings, user, message) {
  const obj = {};
  const { xp, level } = await Level.findOne({ userId: user.id });
  const { messageFn } = settings.badwords.actions.notifyUser;
  if (messageFn.includes("{{username}}")) {
    obj.username = `<@${user.id}>`;
  }
  if (messageFn.includes("{{guildName}}")) {
    obj.guildName = main.client.guilds.cache.get(guildId).name;
  }
  if (messageFn.includes("{{channelName}}")) {
    obj.channelName = message.channel.name;
  }
  if (messageFn.includes("{{userXp}}")) {
    obj.userXp = xp;
  }
  if (messageFn.includes("{{userLevel}}")) {
    obj.userXp = level;
  }
  const decodedMsgFn = decodeMessage(
    settings.badwords.actions.notifyUser.messageFn
  );
  message.reply(decodedMsgFn(obj));
}

async function firstWarn(message, settings) {
  if (settings.badwords.actions.giveWarn)
    await giveSoftWarn(
      message.author.id,
      "Використання нецензурної лексики (вперше)"
    );
  // if (settings.badwords.actions.notifyUser.enabled) {
  // notifyUser(settings, message.author, message);
  // message.channel.send(
  //   `<@${message.author.id}> не використовуй нецензурну лексику! \n Так як у тебе це вперше, ти отримав(-ла) "м'яке" попередження`
  // );
  // }
}

async function anotherWarn(message, settings) {
  if (settings.badwords.actions.giveWarn)
    await giveWarn(
      message.author.id,
      "Неодноразове використання нецензурної лексики"
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
      if (!checkMessageBadWords(message.toLowerCase(), word.toLowerCase()))
        continue;
      let userObj = await Level.findOne({ userId: message.author.id });
      if (!userObj) {
        addNewMember(null, message);
        userObj = await Level.findOne({ userId: message.author.id });
      }
      if (settings.badwords.actions.deleteMsg) await message.delete();
      if (settings.badwords.actions.notifyUser.enabled) {
        if (!settings.badwords.actions.notifyUser.messageFn) {
          message.channel.send(
            `<@${message.author.id}> не використовуй нецензурну лексику! Додаю тобі твій черговий варн`
          );
        } else {
          notifyUser(settings, message.author, message);
        }
      }
      if (settings.badwords.actions.mute.enabled)
        await message.member.timeout(
          settings.badwords.actions?.mute?.muteTimeMs
            ? settings.badwords.actions.mute.muteTimeMs
            : 1000 * 60 * 30,
          "Використання нецензурної лайки"
        );
      if (!settings.badwords.actions.giveWarn) continue;
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
        await anotherWarn(message, settings);
        break;
      } else {
        await firstWarn(message, settings);
        break;
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
};
