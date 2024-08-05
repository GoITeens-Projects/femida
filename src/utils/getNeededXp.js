module.exports = (level) => {
  // return 5 * Math.pow(level, 2) + 50 * level + 100
  if (level <= 1) {
    return 150;
  } else {
    return 150 * (1 + (level - 1) * 0.1);
  }
  // return 150 * (1 + (level - 1) * 0,1)
};
