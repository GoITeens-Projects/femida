const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("panic")
    .setDescription("Не нервуйся, все буде добре（‐＾▽＾‐）")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника який став причиною твоєї паніки")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "сильно нервує від дій");
  },
};
