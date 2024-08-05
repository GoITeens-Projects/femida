const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wave")
    .setDescription("Привітай когось з учасників (*＾▽＾)／")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника якого ти хочеш привітати")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "вітає");
  },
};
