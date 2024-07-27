const Level = require("../models/Level");
const getLimit = require("./getNeededXp")

module.exports = async (userId) => {
  const user = await Level.find({ userId });
  const limit = getLimit(user.level)
  const curLimit = user.currentXp < limit ? true : false;
  return curLimit;
};
