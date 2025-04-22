const { config } = require("dotenv");
const { guildId } = require("../../constants/config.js");
const Level = require("../../models/Level.js");
const getLimit = require("./getNeededXp.js");
const updateLevel = require("./updateLevel.js");
const studentRoleId = require("../../constants/studentRoleId.js");
const main = require("../../index.js");
const { calculateXP, calculateXPLimit } = require("../../interactions/events/events.js");


config();

module.exports = async (id, amount, exeption) => {
  const insistUsers = await Level.find({ userId: id });
  if (insistUsers.length === 0) {
    const newUser = new Level({
      userId: id,
      guildId,
      xp: 0,
      currentXp: 0,
      presentXp: 0,
      level: 0,
    });

    await newUser.save();
  }
  const userChek = await Level.findOne({ userId: id });
  if (!userChek.presentXp) {
    await Level.findOneAndUpdate({ userId: id }, { presentXp: userChek.xp });
  }
  const user = await Level.findOne({ userId: id });
  const GUILD_ID = process.env.GUILD_ID;
  const guild = main.client.guilds.cache.get(GUILD_ID);
  const member = guild.members.cache.get(id);
  const isStudent = member.roles.cache.has(studentRoleId);
  const xpWithEvents = await calculateXP(amount)

  if (exeption) {
    const up = isStudent ? user.xp +  xpWithEvents * 1.25 : user.xp +  xpWithEvents;
    const presentUp = isStudent ? user.presentXp +  xpWithEvents * 1.25 : user.presentXp + xpWithEvents
    await Level.updateOne({ userId: id }, { xp: up, presentXp: presentUp });
    const newUser = await Level.findOne({ userId: id });
    await updateLevel(newUser, newUser.userId);
    return up;
  } else {
    const limit = getLimit(user.level, isStudent);
    const xpWithEventsLimit = await calculateXPLimit(limit)
    if (user.currentXp === xpWithEventsLimit) return;
    const extra =  xpWithEvents * 1.25;
    let up = isStudent ? user.xp + extra : user.xp + xpWithEvents;
    let presentUp = isStudent ? user.presentXp + extra : user.presentXp + xpWithEvents;
    let curLimit = isStudent
      ? user.currentXp + xpWithEvents * 1.25
      : user.currentXp + xpWithEvents;
    if (curLimit > xpWithEventsLimit) {
      curLimit = xpWithEventsLimit;
      const addAmount = xpWithEventsLimit - user.currentXp
      up = user.xp + addAmount;
      presentUp = user.presentXp + addAmount
    }
    await Level.updateOne({ userId: id }, { xp: up, currentXp: curLimit, presentXp: presentUp });
    const newUser = await Level.findOne({ userId: id });
    await updateLevel(newUser, newUser.userId);
    return up;
  }
};
