const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const Level = require("../models/Level");
const getColors = require("get-image-colors");
const gifs = require("discord-actions");
const NodeCache = require("node-cache");
const usersInCooldown = new NodeCache({ stdTTL: 30 });
const roles = {
  0: { roleId: "967373815292264469" },
  5: { roleId: "972169804272263238" },
  10: { roleId: "970999855126298624" },
  15: { roleId: "972170463264530482" },
  20: { roleId: "972170979637882980" },
  25: { roleId: "971000630648930315" },
  30: { roleId: "972174829656629318" },
  35: { roleId: "972175023399923783" },
  40: { roleId: "972175178744348672" },
  45: { roleId: "972175521251209236" },
  50: { roleId: "971001223589298247" },
};

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
        (timeLeft < 5 && timeLeft !== 1)
          ? "и"
          : ""
      }${timeLeft.toString().endsWith(1) ? "у" : ""}`,
      ephemeral: true,
    });
  }
  async function checkLevel(userId, command) {
    const commandsLevels = {
      hug: 0,
      slap: 0,
      poke: 0,
      highfive: 5,
      cuddle: 10,
      wave: 10,
      confused: 15,
      wink: 15,
      sad: 15,
    };
    const minLevel = commandsLevels[command];
    const userObj = await Level.findOne({ userId });
    if (userObj.level >= minLevel) {
      return { access: true, minLevel };
    } else {
      const availableCmds = Object.keys(commandsLevels)
        .filter((command) => commandsLevels[command] <= userObj.level)
        .map((command) => `\`/${command}\``);
      return { access: false, minLevel, availableCmds };
    }
  }
  try {
    if (usersInCooldown.get(interaction.user.id)) {
      if (await antiSpamCmds()) return;
    }
    await interaction.deferReply();
    const accessObj = await checkLevel(
      interaction.user.id,
      interaction.commandName
    );
    if (!accessObj.access) {
      const lowLevelEmbed = new EmbedBuilder()
        .setTitle("Недостатній рівень для використання цієї команди")
        .setColor("#7C4F3C")
        .setDescription(
          `Ти зможеш її використовувати починаючи з ${
            accessObj.minLevel
          } рівня \n Доступні тобі команди реакцій: ${accessObj.availableCmds.join(
            ", "
          )}`
        )
        .setImage(
          "https://cdn.discordapp.com/attachments/1137395092584402976/1268520210764267582/c76e3102d62990e9d3cadb0fb165a4bb.gif?ex=66acb902&is=66ab6782&hm=1d83de65b1c9383de93d866dda0355f0e52144aaf7df0a70942354d25e24949c&"
        );
      return await interaction.editReply({ embeds: [lowLevelEmbed] });
    }
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
    let title = `${
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
    }`;
    if (!actionText) {
      title = "";
    }
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(colors[0]._rgb)
      .setImage(url);
    await interaction.editReply({ embeds: [embed] });
    const expiresAfter = new Date(new Date().getTime() + 1000 * 30);
    usersInCooldown.set(interaction.user.id, expiresAfter);
  } catch (err) {
    console.log(err);
  }
};
