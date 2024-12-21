const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("highfive")
    .setDescription("Дай п'ять комусь з учасників (　＾＾)人(＾＾　)")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника якому ти хочеш дати п'ять")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "дав(ла) п'ять");
  },
};
