const Level = require("../models/Level");

module.exports = async (userId) => {
  const user = await Level.find({ userId });
  const limit = user.currentXp < 150 ? true : false;
  return limit;
};
