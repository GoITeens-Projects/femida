const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const sendVerification = require("../../interactions/verification/sendVerification");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Верифікація учнів GoIteens"),

  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    try {
      await sendVerification(
        interaction.user,
        false,
        interaction.member.guild,
        true
      );
      await interaction.editReply({
        content: "Подивись у особисті повідомлення😉",
        ephemeral: true,
      });
    } catch (err) {
      console.log("Verify cmd error - " + err);
      await interaction.editReply({
        content: "Виникла дивна помилка. Перевір налаштування особистих повідомлень",
        ephemeral: true,
      });
    }
  },
};
