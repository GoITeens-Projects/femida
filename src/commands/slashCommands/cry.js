const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cry")
    .setDescription("Поплач у чат, якщо хочеться ＞︿＜")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription(
          "Нікнейм учасника у якому ти розчарований"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "плаче від дій");
  },
};
