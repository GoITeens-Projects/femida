const Level = require("../models/Level");
const { guildId } = require("../constants/config.js");

module.exports = async (interaction, message, newState) => {
  let currentUsers = null;
  // console.log(message);
  if (interaction) {
    currentUsers = await Level.find({ userId: interaction.user.id });
    if (currentUsers.length === 0) {
      const newUser = new Level({
        userId: interaction.user.id,
        guildId: guildId,
        xp: 0,
        currentXp: 0,
        level: 0,
      });

      await newUser.save();
    }
  } else if (message) {
    if (message.author.bot) return;
    currentUsers = await Level.find({ userId: message.author.id });
    if (currentUsers.length === 0) {
      const newUser = new Level({
        userId: message.author.id,
        guildId: guildId,
        xp: 0,
        currentXp: 0,
        level: 0,
      });

      await newUser.save();
    }
  } else if (newState) {
    currentUsers = await Level.find({ userId: newState.id });
    if (currentUsers.length === 0) {
      const newUser = new Level({
        userId: newState.id,
        guildId: guildId,
        xp: 0,
        currentXp: 0,
        level: 0,
      });

      await newUser.save();
    }
  } else {
    return;
  }
};
