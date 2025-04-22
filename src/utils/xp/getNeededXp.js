const {
  extraMultipliers: { studentMultiplier },
} = require("../../constants/config");
const calculateXPLimit = require("../../interactions/events/events");





module.exports = (level, isStudent) => {
  if (level <= 1) {
    return isStudent ? 150 * studentMultiplier : 150;
  } else {
    const standart = Math.round(150 * (1 + (level - 1) * 0.1));
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
