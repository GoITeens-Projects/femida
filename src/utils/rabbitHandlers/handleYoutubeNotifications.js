const main = require("../../index");
const {
  channels: { youtubeChannel },
} = require("../../constants/config");
const SettingsInterface = require("../settings");
const axios = require("axios");

function extractVideoIdFromLink(link) {
  if (link.includes("youtube/shorts")) {
    //? Short video
    return link.replace("https://www.youtube.com/shorts/", "");
  } else {
    //? Simple video
    //? https://www.youtube.com/watch?v=
    return link.replace("https://www.youtube.com/watch?v=", "");
  }
}

module.exports = async (content, channel, msg) => {
  try {
    setTimeout(async () => {
      console.log("Youtube Notification Explode🦀");
      const settings = await SettingsInterface.getSettings();
      if (!settings?.mediaNotes?.enabled) return;
      const videoResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${extractVideoIdFromLink(
          content.link
        )}&key=${process.env.YOUTUBE_KEY}&part=snippet,statistics`
      );
      if (videoResponse.data.pageInfo.totalResults === 0) {
        return;
      }
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
