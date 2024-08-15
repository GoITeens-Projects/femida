const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const renderRatingPage = require("./renderRatingPage");

module.exports = async function (
  interaction,
  client,
  totalPages,
  time = 60 * 1000
) {
  try {
    let index = 0;
    if (!interaction || !totalPages || !totalPages > 0)
      throw new Error("Invalid args for pagination");
    if (totalPages === 1) {
      const oneEmbed = await renderRatingPage(index, 10, client);
      return await interaction.editReply({
        embeds: [oneEmbed.embed],
        components: [],
      });
    }

    const buttonsObj = {
      firstBtn: new ButtonBuilder()
        .setCustomId("firstpage")
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      prevBtn: new ButtonBuilder()
        .setCustomId("pageprev")
        .setEmoji("◀")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      pageCounter: new ButtonBuilder()
        .setCustomId("pagecounter")
        .setLabel(`${index + 1}/${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      nextBtn: new ButtonBuilder()
        .setCustomId("pagenext")
        .setEmoji("▶")
        .setStyle(ButtonStyle.Primary),
      lastBtn: new ButtonBuilder()
        .setCustomId("lastpage")
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Primary),
    };

    const { firstBtn, prevBtn, pageCounter, nextBtn, lastBtn } = buttonsObj;

    const buttons = new ActionRowBuilder().addComponents([
      firstBtn,
      prevBtn,
      pageCounter,
      nextBtn,
      lastBtn,
    ]);
    const newEmbed = await renderRatingPage(index, 10, client);
    const msg = await interaction.editReply({
      embeds: [newEmbed.embed],
      components: [buttons],
      fetchreply: true,
    });
    let collector = await msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      dispose: false,
      time,
    });
    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id)
        return await i.reply({
          content: `Тільки ${interaction.user.username} може використовувати ці кнопки! Спробуй самостійно викликати команду \`/leaders\``,
          ephemeral: true,
        });
      await i.deferUpdate();
      switch (i.customId) {
        case "firstpage":
          index = 0;
          pageCounter.setLabel(`${index + 1}/${totalPages}`);
          break;
        case "pageprev":
          if (index > 0) index--;
          pageCounter.setLabel(`${index + 1}/${totalPages}`);
          break;
        case "pagenext":
          if (index < totalPages - 1) {
            index++;
            pageCounter.setLabel(`${index + 1}/${totalPages}`);
          }
          break;
        case "lastpage":
          index = totalPages - 1;
          pageCounter.setLabel(`${index + 1}/${totalPages}`);
          break;
        default:
          break;
      }

      if (index === 0) {
        firstBtn.setDisabled(true);
        prevBtn.setDisabled(true);
      } else {
        firstBtn.setDisabled(false);
        prevBtn.setDisabled(false);
      }

      if (index === totalPages - 1) {
        nextBtn.setDisabled(true);
        lastBtn.setDisabled(true);
      } else {
        nextBtn.setDisabled(false);
        lastBtn.setDisabled(false);
      }
      //?
      const { embed } = await renderRatingPage(index, 10, client);
      //?
      await msg
        .edit({ embeds: [embed], components: [buttons] })
        .catch((err) => console.log(err));
      collector.resetTimer();
    });

    collector.on("end", async () => {
      const { embed } = await renderRatingPage(index, 10, client);
      await msg
        .edit({ embeds: [embed], components: [] })
        .catch((err) => console.log(err));
    });
    return msg;
  } catch (err) {
    console.log(`[Error] ${err}`);
  }
};
