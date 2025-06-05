const sameLetters = require("../../utils/sameLetters");
const addPoints = require("../../utils/xp/addPoints");
const {
  xps: { message },
} = require("../../constants/config");
const SettingsInterface = require("../../utils/settings");

module.exports = async function accrualPoints(msg) {
  if (
    msg.content.length > 3 &&
    !msg.author.bot &&
    sameLetters(msg.content)
  ) {
    const genSettings = await SettingsInterface.getSettings();
      const settings = genSettings.xps;

      const amount = settings?.message || message
     
    await addPoints(msg.author.id, amount, false);
  }
};
