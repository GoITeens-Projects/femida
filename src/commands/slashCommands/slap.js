const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Дай ляпаса комусь з учасників (якщо ти так цього хочеш)ヽ（≧□≦）ノ")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника якому ти хочеш дати ляпаса")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "дав(ла) ляпаса");
  },
};
