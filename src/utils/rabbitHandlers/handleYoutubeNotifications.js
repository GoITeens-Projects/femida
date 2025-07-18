const main = require("../../index");
const {
  channels: { youtubeChannel },
} = require("../../constants/config");

module.exports = async (content, channel, msg) => {
  try {
    setTimeout(async () => {
      console.log("Youtube Notification Explode🦀");
      const chat = await main.client.channels.fetch(youtubeChannel);
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
