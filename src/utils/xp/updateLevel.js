const Level = require("../../models/Level");
const sendLevelNotification = require("./sendLevelNotification");
const sendDmMsg = require("./sendDmMsg");
const addRoleLevel = require("./addRoleLevel");
const addGifters = require("./addGifters");

module.exports = async function updateLevel({ level, xp }, userId) {
  let newLevel = 0;
  function calculateXPForLevel(lvl) {
    let xpForLevel = 0;
    for (let i = 0; i < lvl; i++) {
      xpForLevel += 5 * Math.pow(i, 2) + 50 * i + 100;
    }
    return xpForLevel;
  }
  while (xp >= calculateXPForLevel(newLevel + 1)) {
    newLevel++;
  }
  if (newLevel > level) {
    const params = { id: userId, level: newLevel };
    await sendLevelNotification(params);
    if (newLevel - level >= 2) {
      for (let i = level + 1; i <= newLevel; i++) {
        if (i % 5 !== 0) continue;
        try {
          await sendDmMsg({ id: userId, level: i });
          await addRoleLevel({ level: i, xp }, userId);
          await addGifters(userId, i);
        } catch (err) {
          console.log("Level Error 2 - " + err);
        }
      }
    } else if (newLevel % 5 === 0 && newLevel !== 0) {
      try {
        await sendDmMsg(params);
        await addRoleLevel({ level: newLevel, xp }, userId);
        await addGifters(userId, newLevel);
      } catch (err) {
        console.log("Level Error - " + err);
      }
    }
  }
  if (level === newLevel) return level;
  await Level.findOneAndUpdate({ userId }, { level: newLevel });
  return newLevel;
};
