const Settings = require("../../models/Settings");

const SettingsInterface = require("../settings");

module.exports = async (content, channel, msg) => {
  try {
    await SettingsInterface.setSettings(content);
    channel.ack(msg);
  } catch (err) {
    console.log("Error while handling settings queue", err);
  }
};
