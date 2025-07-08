const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle } = require("discord.js");

const cancelCloseTicketBtn = new ButtonBuilder()
  .setCustomId("cancel-close-ticket-btn")
  .setLabel("Відміна")
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(false);

module.exports = {
  component: cancelCloseTicketBtn,
  async execute(interaction) {
    await interaction.message.delete();
  },
};
