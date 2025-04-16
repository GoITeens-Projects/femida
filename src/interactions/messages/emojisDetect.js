const SettingsInterface = require("../../utils/settings");
const WarnSystem = require("../../utils/warnSystem");

module.exports = async function emojisDetect(msg) {
  const genSettings = await SettingsInterface.getSettings();
  const settings = genSettings.emojisSpam;

  const emotes = str =>
    str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);
  const inMessageEmojis = emotes(msg.content);

  // console.log(emotes(msg.content));

  if (!settings.enabled || inMessageEmojis.lenght < 10) return;
  const testUsers = ["559058726519046156"];
  const testChanels = ["1192080421677191288"];

  console.log(settings);
  if (
    settings.targetRoles.includes(msg.author.id) ||
    settings.targetChannels.includes(msg.channelId)
  ) {
    console.log(inMessageEmojis);
    if (settings.actions.deleteMsg) {
      if (settings.action.notifyUser.deleteTimeoutMs) {
        useTimeout(
          () => msg.delete(),
          settings.action.notifyUser.deleteTimeoutMs
        );
      } else {
        msg.delete();
      }
    }
    if (settings.actions.giveWarn) {
      WarnSystem.giveWarn(
        msg.author.id,
        settings.actions.norifyUser.messageFn,
        settings.actions.norifyUser.enabled
      );
    }
    if (settings.actions.mute.enabled) {
      const muteTime = settings.actions.mute.muteTimeMs || 60000; // 1 хвилина за замовчуванням
      const userId = msg.author.id;
      await message.guild.members.cache
        .get(userId)
        .timeout(muteTime, "Мут за спам");
    }
    if (settings.actions.notifyUser.enabled) {
        WarnSystem.sendDirectCmdMessage(
            msg.author.id,
            1,
            (requiredAmount = 5),
            "Порушення правил використання емоцій на сервері"
          );
    }
   
  }

  if (
    testUsers.includes(msg.author.id) ||
    testChanels.includes(msg.channelId)
  ) {
    console.log(inMessageEmojis);
    // delete message

    // if (true) {
    //   if (settings.action.notifyUser.deleteTimeoutMs) {
    //     useTimeout(
    //       () => msg.delete(),
    //       settings.action.notifyUser.deleteTimeoutMs
    //     );
    //   } else {
    //     msg.delete();
    //   }
    // }

    // warn user

    // if (true) {
    //   WarnSystem.giveWarn(
    //     msg.author.id,
    //     settings.actions.norifyUser.messageFn,
    //     settings.actions.norifyUser.enabled
    //   );
    // }

// mute user

    // if (true) {
    //   const muteTime = 30000; 
    //   const userId = msg.author.id;
    //   await message.guild.members.cache
    //     .get(userId)
    //     .timeout(muteTime, "Мут за спам");
    // }

    // notify user

    // if (true) {
    //     WarnSystem.sendDirectCmdMessage(
    //         msg.author.id,
    //         1,
    //         (requiredAmount = 5),
    //         "Порушення правил використання емоцій на сервері"
    //       );
    // }
   
  }
};
