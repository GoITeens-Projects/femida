const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const createGiftEmbed = require("../../utils/gifts/createGiftEmbed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gifts")
    .setDescription(
      "Переглянути список усіх подарунків, або інформацію про якийсь конкретний"
    )
    .setDMPermission(false)
    .addNumberOption((option) =>
      option
        .setName("gift-id")
        .setDescription("Номер подарунку")
        .setRequired(false)
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      const resp = await fetch("https://" + process.env.FEMIDA_API + "/gifts", {
        headers: { Authorization: `Bearer ${process.env.FEMIDA_API_TOKEN}` },
      });
      const response = await resp.json();
      const gifts = response.gifts.filter(({ status }) => status.available);
      const giftEmbed = new EmbedBuilder().setColor("#FFD23F");
      if (interaction.options.get("gift-id")?.value) {
        const gift = gifts.find(
          (gift) =>
            Number(gift.giftId) ===
            Number(interaction.options.get("gift-id").value)
        );
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
        await interaction.editReply({ embeds: [embed] });
        return;
      } else {
        giftEmbed.setTitle("Список доступних подарунків").addFields(
          gifts
            .sort((prev, next) => Number(prev.giftId) - Number(next.giftId))
            .map((gift) => {
              return { name: `${gift.giftId}) ` + gift.title, value: "\u200b" };
            })
        );
      }
      await interaction.editReply({ embeds: [giftEmbed] });
    } catch (err) {
      console.log(err);
    }
  },
};
