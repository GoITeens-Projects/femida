const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Обійми когось з учасників ⸜(｡˃ ᵕ ˂ )⸝♡")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника якого ти хочеш обійняти")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "обійняв(ла)");
  },
};
