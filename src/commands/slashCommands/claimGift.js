const {
  SlashCommandBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const openModalBtn = require("../../components/openSimpleModalBtn/openSimpleModalBtn");
const openComplexModalBtn = require("../../components/openComplexModal/openComplexModal");
const createGiftEmbed = require("../../utils/gifts/createGiftEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim-gift")
    .setDescription("Отримати бажаний подарунок")
    .setContexts(0, 1)
    .addNumberOption((option) =>
      option
        .setName("gift-id")
        .setDescription("Номер подарунку")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.inGuild()) {
      return await interaction.reply({
        content:
          "Цю команду можна викликати лише в особистих повідомленнях зі мною😉",
      });
    }
    const value = interaction.options.get("gift-id").value;
    await interaction.deferReply();
    const resp = await fetch(
      "https://" + process.env.FEMIDA_API + `/gifts/${value}`,
      {
        headers: { Authorization: `Bearer ${process.env.FEMIDA_API_TOKEN}` },
      }
    );
    const { gift } = await resp.json();
    if (!gift) {
      const errorEmbed = new EmbedBuilder()
        .setColor("#D04848")
        .setTitle("Подарунка з таким номером не знайдено :(")
        .setDescription(
          "Переконайся що ввів номер вірно. \n Потім спробуй ще раз"
        )
        .setThumbnail("attachment://undefined.gif");
      const attachments = [
        new AttachmentBuilder("src/imgs/undefined.gif", "undefined.gif"),
      ];
      return await interaction.editReply({
        files: attachments,
        embeds: [errorEmbed],
      });
    }
    console.log(gift);
    const embed = await createGiftEmbed(gift);
    if (gift?.isVirtual) {
      await interaction.editReply({
        embeds: [embed],
        content:
          "Цей подарунок не треба відправляти поштою, тому ці дані - лише формальність✅",
        components: [
          new ActionRowBuilder().addComponents(openModalBtn.component),
        ],
      });
    } else {
      await interaction.editReply({
        embeds: [embed],
        content:
          "❗Звертаю твою увагу на те, що ми використовуємо **тільки** Нову Пошту для відправки подарунків",
        components: [
          new ActionRowBuilder().addComponents(openComplexModalBtn.component),
        ],
      });
    }
  },
};
