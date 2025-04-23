const {
  extraMultipliers: { studentMultiplier },
} = require("../../constants/config");
const SettingsInterface = require("../../utils/settings");

module.exports = async (level, isStudent) => {
  const genSettings = await SettingsInterface.getSettings();
 const settings = genSettings.xps;
 const baseXpLimit = settings?.baseXpLimit || 150; //? XP for voice

  if (level <= 1) {
    return isStudent ? baseXpLimit * studentMultiplier : baseXpLimit;
  } else {
    const standart = Math.round(baseXpLimit * (1 + (level - 1) * 0.1));
    return isStudent ? standart * studentMultiplier : standart;
  }
};
