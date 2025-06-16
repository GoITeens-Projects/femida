const { EmbedBuilder } = require("discord.js");
const getColors = require("get-image-colors");

module.exports = async (gift) => {
  const colors = await getColors(gift.image);
  const embed = new EmbedBuilder()
    .setTitle(gift.title)
    .setColor(colors[0]._rgb)
    .setDescription(gift.description)
    .setThumbnail(gift.image)
    .addFields({
      name: "Ціна",
      value: gift.toReceive?.presentXpPrice?.toString() + " XP",
      inline: true,
    });
  if (gift.toReceive?.onlyForStudents) {
    embed.addFields({
      name: "Тільки для учнів GoITeens",
      value: "✅",
      inline: true,
    });
  }
  if (gift.status.available) {
    embed.addFields({ name: "Статус", value: "В наявності", inline: true });
  } else {
    embed.addFields({
      name: "Статус - недоступний",
      value: `Причина - ${
        gift.status.reason ? gift.status.reason : "не вказана"
      }`,
      inline: false,
    });
  }
  embed.addFields({
    name: "Номер (id)",
    value: gift.giftId.toString(),
    inline: true,
  });
  return embed;
};
