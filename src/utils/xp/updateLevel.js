const Level = require("../../models/Level");
const sendLevelNotification = require("./sendLevelNotification");
const sendDmMsg = require("./sendDmMsg");
const addRoleLevel = require("./addRoleLevel");
const addGifters = require("./addGifters");
const cfg = require("../../constants/config");

module.exports = async function updateLevel({ level, xp }, userId) {
  let newLevel = 0;

  // Функція для обчислення потрібного XP для рівня
  function calculateXPForLevel(lvl) {
    let xpForLevel = 0;
    for (let i = 0; i < lvl; i++) {
      xpForLevel += 5 * Math.pow(i, 2) + 50 * i + 100;
    }
    return xpForLevel;
  }

  // Обчислюємо новий рівень
  while (xp >= calculateXPForLevel(newLevel + 1)) {
    newLevel++;
  }

  if (newLevel > level) {
    const params = { id: userId, level: newLevel };
    await sendLevelNotification(params);

    // Рівні, на які треба видавати ролі
    const roleLevels = cfg.levelRoles.map(role => role.level);

    for (let i = level + 1; i <= newLevel; i++) {
      try {
        if (roleLevels.includes(i)) {
          await sendDmMsg({ id: userId, level: i });
          await addRoleLevel({ level: i, xp }, userId);
          // await addGifters(userId, i);
        }
      } catch (err) {
        console.log("Level Error - " + err);
      }
    }
  }

  if (level === newLevel) return level;

  await Level.findOneAndUpdate({ userId }, { level: newLevel });

  return newLevel;
};