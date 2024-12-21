const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nope")
    .setDescription("Вислови свою незгоду ( `ε´ )")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника з думкою якого ти незгоден")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "незгоден з");
  },
};
