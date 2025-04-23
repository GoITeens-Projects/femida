const {
  extraMultipliers: { studentMultiplier },
} = require("../../constants/config");
const calculateXPLimit = require("../../interactions/events/events");
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







// module.exports = (level, isStudent) => {

//   if (level <= 1) {
//     return isStudent ? 150 * studentMultiplier : 150;
//   } else {
//     const standart = Math.round(150 * (1 + (level - 1) * 0.1));
//     console.log('стандарти:', standart);
//     const limitWithEvents = calculateXPLimit(standart).then()
//     console.log('ліміти:',limitWithEvents.then());
//     return isStudent ? limitWithEvents * studentMultiplier : standart;
//   }
// };
