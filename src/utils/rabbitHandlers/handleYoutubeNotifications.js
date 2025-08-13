const main = require("../../index");
const {
  channels: { youtubeChannel },
} = require("../../constants/config");
const SettingsInterface = require("../settings");

module.exports = async (content, channel, msg) => {
  try {
    setTimeout(async () => {
      console.log("Youtube Notification Explode🦀");
      const settings = await SettingsInterface.getSettings();
      if (!settings?.mediaNotes?.enabled) return;
      const chat = await main.client.channels.fetch(
        settings?.mediaNotes?.discordChannelId ?? youtubeChannel
      );
      chat.send({
        content: `**${content.title}**\n${content.mediaNote}\n${content.link}`,
      });
    }, 1000 * 60 * 5);
    console.log("Youtube Notification Timer⏰");
    channel.ack(msg);
  } catch (err) {
    console.log("Error while handling gift-requests queue", err);
  }
};
