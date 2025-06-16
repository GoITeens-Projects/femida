const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const validateForm = require("../../utils/gifts/validateForm");

const inputs = {
  namesInput: new ActionRowBuilder().setComponents(
    new TextInputBuilder()
      .setLabel("ПІБ (Прізвище Ім'я По-батькові)")
      .setCustomId("names")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMinLength(6)
      .setMaxLength(40)
  ),
  phoneInput: new ActionRowBuilder().setComponents(
    new TextInputBuilder()
      .setLabel("Номер телефону")
      .setCustomId("phone")
      .setStyle(TextInputStyle.Short)
      .setMinLength(9)
      .setMaxLength(12)
  ),
};

const simpleModal = new ModalBuilder()
  .setTitle("Отримати подарунок")
  .setCustomId("simple-gift-modal")
  .setComponents(...Object.values(inputs));

module.exports = {
  component: simpleModal,
  async execute(interaction) {
    await interaction.deferReply();
    const names = interaction.fields.getTextInputValue("names").split(" ");
    const giftId = interaction.message.embeds[0].fields
      .find((field) => field.name.includes("id"))
      .value.toString();
    const clientData = {
      discordId: interaction.user.id,
      phoneNumber: interaction.fields.getTextInputValue("phone"),
      firstName: names[1],
      lastName: names[0],
      patronymic: names[2],
    };
    const values = {
      names: interaction.fields.getTextInputValue("names"),
      phone: interaction.fields.getTextInputValue("phone"),
    };
    const validationResult = validateForm(values);
    console.log(validationResult);
    const errors = validationResult.filter(
      ({ result: { success } }) => !success
    );
    if (errors.length !== 0) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(
          "Деякі поля були заповнені невірно, тому запит не був відправлений"
        )
        .setColor("#D04848");
      errors.forEach((err) =>
        errorEmbed.addFields({
          name: err?.result?.error.message,
          value: "\u200B",
          inline: true,
        })
      );
      await interaction.editReply({
        embeds: [errorEmbed],
      });
      return;
    }
    const resp = await fetch(
      "https://" + process.env.FEMIDA_API + `/gifts/requests`,
      {
        method: "POST",
        body: JSON.stringify({
          giftId,
          clientData,
        }),
        headers: {
          Authorization: `Bearer ${process.env.FEMIDA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    const response = await resp.json();
    console.log(response);
    if (resp.status >= 400) {
      return interaction.reply({
        content: "Сталась помилка. Запит не відправлено і бали не знято",
      });
    }
    await interaction.editReply({
      content: `Запит на отримання ${response.giftRequest.requestedGift.title} відправлено на розгляд адміністрації`,
    });
  },
};
