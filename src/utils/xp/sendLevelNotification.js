const main = require("../../index");
const {
  channels: { levelChannel },
} = require("../../constants/config");

module.exports = async function sendLevelNotification({ id, level }) {
  try {
    const channel = await main.client.channels.fetch(levelChannel);
    channel.send({ content: `<@${id}> досяг ${level} рівня. Вітаємо тебе!` });
  } catch (err) {
    console.log("Error while sending level msg into public channel " + err);
  }
};
