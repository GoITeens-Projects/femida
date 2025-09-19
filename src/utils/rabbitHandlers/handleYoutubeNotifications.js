const main = require("../../index");
const {
  channels: { youtubeChannel },
} = require("../../constants/config");
const SettingsInterface = require("../settings");
const axios = require("axios");

function extractVideoIdFromLink(url) {
  try {
    const parsedUrl = new URL(url);

    //? short URLs https://youtu.be/VIDEO_ID format
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1);
    }

    //? Handle standard URLs like https://www.youtube.com/watch?v=VIDEO_ID
    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoID = parsedUrl.searchParams.get("v");
      if (videoID) return videoID;
      //? https://www.youtube.com/embed/VIDEO_ID format
      const pathParts = parsedUrl.pathname.split("/");
      const embedIndex = pathParts.indexOf("embed");
      if (embedIndex !== -1 && pathParts[embedIndex + 1]) {
        return pathParts[embedIndex + 1];
      }
      //? /v/VIDEO_ID format
      const vIndex = pathParts.indexOf("v");
      if (vIndex !== -1 && pathParts[vIndex + 1]) {
        return pathParts[vIndex + 1];
      }
    }

    return null;
  } catch (e) {
    return null;
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
