const main = require("../../index");

module.exports = async (content, channel, msg) => {
  try {
    setTimeout(async () => {
      console.log("startrtrrtt");
      const chat = await main.client.channels.fetch("1389895557744562236");
      chat.send({ content: `**${content.title}** \n\n${content.link}` });
    }, 1000 * 60 * 5);
    console.log("timer");
    channel.ack(msg);
  } catch (err) {
    console.log("Error while handling gift-requests queue", err);
  }
};
