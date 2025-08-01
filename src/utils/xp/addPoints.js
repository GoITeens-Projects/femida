const { config } = require("dotenv");
const { guildId } = require("../../constants/config.js");
const Level = require("../../models/Level.js");
const getLimit = require("./getNeededXp.js");
const updateLevel = require("./updateLevel.js");
const studentRoleId = require("../../constants/studentRoleId.js");
const main = require("../../index.js");
const { calculateXP, calculateXPLimit } = require("../../interactions/events/events.js");

const SettingsInterface = require("../settings.js");

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
  const genSettings = await SettingsInterface.getSettings();
        const settings = genSettings.xps;
       
  const user = await Level.findOne({ userId: id });
  const GUILD_ID = process.env.GUILD_ID;
  const guild = main.client.guilds.cache.get(GUILD_ID);
  const member = guild.members.cache.get(id);
  const isStudent = member.roles.cache.has(studentRoleId);
  const xpWithEvents = await calculateXP(amount)
  const studentMultiplier = settings?.studentMultiplier || 1.25;

  if (exeption) {
    const up = isStudent ? user.xp + amount * studentMultiplier : user.xp + amount;
    const presentUp = isStudent ? user.presentXp + amount * studentMultiplier : user.presentXp + amount
    await Level.updateOne({ userId: id }, { xp: up, presentXp: presentUp });
    const newUser = await Level.findOne({ userId: id });
    await updateLevel(newUser, newUser.userId);
    return up;
  } else {
    const limit = getLimit(user.level, isStudent);
    if (user.currentXp === limit) return;
    const extra = amount * studentMultiplier;
    let up = isStudent ? user.xp + extra : user.xp + amount;
    let presentUp = isStudent ? user.presentXp + extra : user.presentXp + amount;
    let curLimit = isStudent
      ? user.currentXp + xpWithEvents * studentMultiplier
      : user.currentXp + xpWithEvents;
    if (curLimit > limit) {
      curLimit = limit;
      const addAmount = limit - user.currentXp
      up = user.xp + addAmount;
      presentUp = user.presentXp + addAmount
    }
    await Level.updateOne({ userId: id }, { xp: up, currentXp: curLimit, presentXp: presentUp });
    const newUser = await Level.findOne({ userId: id });
    await updateLevel(newUser, newUser.userId);
    return up;
  }
};
