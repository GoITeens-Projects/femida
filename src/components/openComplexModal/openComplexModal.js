const { ButtonBuilder } = require("@discordjs/builders");
const { component } = require("../complexModal/complexModal");
const { ButtonStyle } = require("discord.js");

const openComplexModalBtn = new ButtonBuilder()
  .setCustomId("open-complex-modal-btn")
  .setLabel("Отримати подарунок")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(false);

module.exports = {
  component: openComplexModalBtn,
  async execute(interaction) {
    interaction.showModal(component);
  },
};
