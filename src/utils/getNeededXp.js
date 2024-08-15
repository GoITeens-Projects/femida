module.exports = (level, isStudent) => {
  if (level <= 1) {
    return isStudent ? 150 * 1.25 : 150;
  } else {
    const standart = 150 * (1 + (level - 1) * 0.1)
    return isStudent ? standart * 1.25 : standart;
  }
};
