const { ButtonBuilder, ButtonStyle } = require("discord.js");
const { component } = require("../simpleModal/simpleModal");

const openModalBtn = new ButtonBuilder()
  .setCustomId("open-modal-btn")
  .setLabel("Отримати подарунок")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(false);

module.exports = {
  component: openModalBtn,
  async execute(interaction) {
    interaction.showModal(component);
  },
};
