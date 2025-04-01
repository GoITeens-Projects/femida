const sameLetters = require("../../utils/sameLetters");
const addPoints = require("../../utils/xp/addPoints");
const {
  xps: { message },
} = require("../../constants/config");

module.exports = async function accrualPoints(msg) {
  if (msg.content.length > 3 && !msg.author.bot && sameLetters(msg.content)) {
    await addPoints(msg.author.id, message, false);
  }
};
