const Level = require("../models/Level");
const db = require("mongoose");
const sameLetters = require("../utils/sameLetters");
const updateLevel = require("../utils/updateLevel");
const getLimit = require("../utils/getNeededXp");

module.exports = async function accrualPoints(message) {
  const userId = message.author.id;
  const studentRoleId = "953728756273532978"; // Роль 'student'
  const people = await Level.findOne({ userId: userId });
  const limit = getLimit(
    people.level,
    message.member.roles.cache.has(studentRoleId)
  );

  if (people.currentXp !== limit) {
    if (
      message.content.length > 3 &&
      !message.author.bot &&
      sameLetters(message.content)
    ) {
      const userId = message.author.id;
      const people = await Level.findOne({ userId: userId });

      // Перевірка наявності ролі 'student'
      const isStudent = message.member.roles.cache.has(studentRoleId);
      let pointsToAdd = isStudent ? 4 : 2;

      let updateXp = people.currentXp + pointsToAdd;
      let upAllXp = people.xp + pointsToAdd;
      console.log("first", updateXp);

      if (updateXp > limit) {
        updateXp = limit;
        const up = limit - people.currentXp;
        upAllXp = people.xp + up;
      }

      await Level.findOneAndUpdate(
        { userId: userId },
        { currentXp: updateXp, xp: upAllXp }
      );
      await updateLevel(people, userId);
    }
  }
};
