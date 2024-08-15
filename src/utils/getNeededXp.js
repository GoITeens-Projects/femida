module.exports = (level, onStudent) => {
  // return 5 * Math.pow(level, 2) + 50 * level + 100
  if (level <= 1) {
    return 150;
  } else {
    if (onStudent) {
      return Math.round(150 * (1 + (level - 1) * 0.14));
    } else {
      return Math.round(150 * (1 + (level - 1) * 0.1));
    }
  }
  // return 150 * (1 + (level - 1) * 0,1)
};
