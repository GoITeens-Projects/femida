const SettingsInterface = require("../../utils/settings");
const WarnSystem = require("../../utils/warnSystem");

module.exports = async function emojisDetect(msg) {
  const genSettings = await SettingsInterface.getSettings();
  const settings = genSettings.emojisSpam;

  const emotes = str =>
    str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);
  const inMessageEmojis = emotes(msg.content) || [];

  console.log('settings.enabled',settings.enabled);

  if (!settings.enabled || inMessageEmojis.length < 2) return;
  // const testUsers = ["559058726519046156"];
  // const testChanels = ["1192080421677191288"];

  console.log(settings);
  if (
    settings.targetRoles.includes(msg.author.id) ||
    settings.targetChannels.includes(msg.channelId)
  ) {
    console.log(inMessageEmojis);
    if (settings.actions.deleteMsg) {
      if (settings.actions.notifyUser.deleteTimeoutMs) {
        useTimeout(
          () => msg.delete(),
          settings.actions.notifyUser.deleteTimeoutMs
        );
      } else {
        msg.delete();
      }
    }
    if (settings.actions.giveWarn) {
      WarnSystem.giveWarn(
        msg.author.id,
        settings.actions.notifyUser.messageFn,
        settings.actions.notifyUser.enabled
      );
    }
    if (settings.actions.mute.enabled) {
      const muteTime = settings.actions.mute.muteTimeMs || 60000; // 1 хвилина за замовчуванням
      const userId = msg.author.id;
      await msg.guild.members.cache
        .get(userId)
        .timeout(muteTime, "Мут за спам");
    }
    if (settings.actions.notifyUser.enabled) {
      msg.channel.send(
        `<@${msg.author.id}> не використовуй забагато емоджі у своїх повідомленнях`
      );
    }
   
  }
};
