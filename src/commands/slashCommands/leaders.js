const {
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const Level = require("../../models/Level");
const paginationFn = require("../../utils/leaders/pagination");

async function sendError(interaction, description) {
  const errorEmbed = new EmbedBuilder()
    .setTitle("Помилка")
    .setColor("#D04848")
    .setDescription(description)
    .setThumbnail("attachment://catError.gif");
  const attachments = [
    new AttachmentBuilder("src/imgs/catError.gif", "catError.gif"),
  ];
  await interaction
    .editReply({
      files: attachments,
      embeds: [errorEmbed],
    })
    .catch((err) => console.log(err));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaders")
    .setDescription("Надсилає рейтинг учасників серверу")
    .setDMPermission(false),
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const totalPages = Math.ceil(
        (await Level.find({})).filter((user) => user.xp > 5).length / 10
      );
      if (totalPages === 0) {
        return await sendError(
          interaction,
          "Трапилася дивна помилка. На цьому сервері ймовірно \n немає користувачів з XP більше 4"
        );
      }
      return await paginationFn(interaction, client, totalPages);
    } catch (err) {
      await sendError(
        interaction,
        "Трапилася дуууже дивна помилка. \n За можливості зверніться до адміністрації серверу"
      );
      console.log(`[LEADERS CMD ERROR] ${err}`);
    }
  },
};
