const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
require("dotenv").config();
const { Kawaii } = require("kawaii-api");
const api = new Kawaii(process.env.KAWAII_TOKEN);
const getColors = require("get-image-colors");

module.exports = async function gifCmds(interaction, actionText) {
  try {
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
    const gifUrl = await api.get("gif", interaction.commandName);
    const colors = await getColors(gifUrl);
    const embed = new EmbedBuilder()
      .setTitle(
        `${interaction.user.globalName} ${actionText} ${targetUserObj.user.globalName}`
      )
      .setColor(colors[0]._rgb)
      .setImage(gifUrl);
    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.log(err);
  }
};
