const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle } = require("discord.js");
const cancelCloseTicketBtn = require("../cancelCloseTicketBtn/cancelCloseTicketBtn");
const closeTicketBtn = require("../closeTicketBtn/closeTicketBtn");
const { ActionRowBuilder } = require("@discordjs/builders");
const {
  roles: { adminRoles },
} = require("../../constants/config");

const preCloseTicketBtn = new ButtonBuilder()
  .setCustomId("preclose-ticket-btn")
  .setLabel("Закрити тікет🔒")
  .setStyle(ButtonStyle.Danger)
  .setDisabled(false);

module.exports = {
  component: preCloseTicketBtn,
  async execute(interaction) {
    const isAdmin = interaction.guild.members.cache
      .get(interaction.user.id)
      .roles.cache.some((role) => adminRoles.includes(role.id));

    if (!isAdmin) {
      interaction.reply("Тільки адміністрація може закривати тікети🙃");
      return;
    }
    interaction.reply({
      content: "Ти впевнений/а що хочеш закрити тікет?",
      components: [
        new ActionRowBuilder().addComponents(
          cancelCloseTicketBtn.component,
          closeTicketBtn.component,
        ),
      ],
    });
  },
};
