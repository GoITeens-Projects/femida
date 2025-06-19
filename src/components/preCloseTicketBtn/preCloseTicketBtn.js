const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle } = require("discord.js");
const cancelCloseTicketBtn = require("../cancelCloseTicketBtn/cancelCloseTicketBtn");
const closeTicketBtn = require("../closeTicketBtn/closeTicketBtn");
const { ActionRowBuilder } = require("@discordjs/builders");

const preCloseTicketBtn = new ButtonBuilder()
  .setCustomId("preclose-ticket-btn")
  .setLabel("Закрити тікет🔒")
  .setStyle(ButtonStyle.Danger)
  .setDisabled(false);

module.exports = {
  component: preCloseTicketBtn,
  async execute(interaction) {
    interaction.reply({
      content: "Ти впевнений/а що хочеш закрити тікет?",
      components: [
        new ActionRowBuilder().addComponents(
          cancelCloseTicketBtn.component,
          closeTicketBtn.component
        ),
      ],
    });
  },
};
