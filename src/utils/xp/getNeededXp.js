const {
  extraMultipliers: { studentMultiplier },
} = require("../../constants/config");

module.exports = (level, isStudent) => {
  if (level <= 1) {
    return isStudent ? 150 * studentMultiplier : 150;
  } else {
    const standart = Math.round(150 * (1 + (level - 1) * 0.1));
    return isStudent ? standart * studentMultiplier : standart;
  }
};
