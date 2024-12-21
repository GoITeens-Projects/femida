const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wink")
    .setDescription("Підморгни комусь з учасників (｡•̀ᴗ-)")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника якому ти хочеш підморгнути")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "підморгнув(ла)");
  },
};
