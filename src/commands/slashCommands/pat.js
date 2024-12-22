const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pat")
    .setDescription("Погладь когось, хто справді цього гідний(-на) (*^.^*)")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника якого ти хочеш погладити")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "гладить по голові");
  },
};
