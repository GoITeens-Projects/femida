const { SlashCommandBuilder } = require("discord.js");
const gifCmds = require("../../interactions/gifCmds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poke")
    .setDescription("Тицьни когось з учасників (｡- .•)")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм учасника якого ти хочеш тикнути")
        .setRequired(true)
    ),

  async execute(interaction) {
    await gifCmds(interaction, "тикнув(ла)");
  },
};
