const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const getColors = require("get-image-colors");
const gifs = require("discord-actions");
const NodeCache = require("node-cache");
const usersInCooldown = new NodeCache({ stdTTL: 30 });

module.exports = async function gifCmds(interaction, actionText) {
  async function antiSpamCmds() {
    const timeLeft = Math.round(
      (usersInCooldown.get(interaction.user.id).getTime() -
        new Date().getTime()) /
        1000
    );
    if (timeLeft < 0.5) {
      return null;
    }
    return await interaction.reply({
      content: `Не використовуй команди реакцій настільки швидко. Зачекай ще ${timeLeft} секунд${
        ((timeLeft.toString().endsWith("2") ||
          timeLeft.toString().endsWith("3") ||
          timeLeft.toString().endsWith("4")) &&
          timeLeft > 15) ||
        timeLeft < 5
          ? "и"
          : ""
      }${timeLeft.toString().endsWith(1) ? "у" : ""}`,
      ephemeral: true,
    });
  }
  try {
    if (usersInCooldown.get(interaction.user.id)) {
      if (await antiSpamCmds()) return;
    }
    await interaction.deferReply();
    const mentionedUserId = interaction.options.get("target-user")?.value;
    const targetUserObj = await interaction.guild.members.fetch(
      mentionedUserId
    );
    if (interaction.user.id === mentionedUserId) {
      await interaction.editReply("Ух який!)");
      return;
    }
    if (targetUserObj.user.bot) {
      await interaction.editReply("Не знущайся над ботами. Ми хороші)");
      return;
    }
    const { url } = await gifs[interaction.commandName]();
    const colors = await getColors(url);
    const embed = new EmbedBuilder()
      .setTitle(
        `${
          interaction.member.nickname
            ? interaction.member.nickname
            : interaction.user.globalName
            ? interaction.user.globalName
            : interaction.user.username
        } ${actionText} ${
          targetUserObj.nickname
            ? targetUserObj.nickname
            : targetUserObj.user.globalName
            ? targetUserObj.user.globalName
            : targetUserObj.user.username
        }`
      )
      .setColor(colors[0]._rgb)
      .setImage(url);
    await interaction.editReply({ embeds: [embed] });
    const expiresAfter = new Date(new Date().getTime() + 1000 * 30);
    usersInCooldown.set(interaction.user.id, expiresAfter);
  } catch (err) {
    console.log(err);
  }
};
