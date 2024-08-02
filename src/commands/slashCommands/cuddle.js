const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cuddle")
    .setDescription("Дуууже сильно обійми когось з учасників (*^^*)♡")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника якого ти хочеш дуже сильно обійняти")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "пестить");
  },
};
