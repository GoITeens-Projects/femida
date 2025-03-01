const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Level = require("../models/Level");
const getColors = require("get-image-colors");
const SettingsInterface = require("../utils/settings");
const gifs = require("discord-actions");
const ainasepics = require("ainasepics");
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
        (timeLeft < 5 && timeLeft !== 1)
          ? "и"
          : ""
      }${timeLeft.toString().endsWith(1) && timeLeft !== 11 ? "у" : ""}`,
      ephemeral: true,
    });
  }
  async function checkLevel(userId, command) {
    const { funCommands } = await SettingsInterface.getSettings();
    const commandsLevels = {
      // hug: 0,
      // slap: 0,
      // poke: 0,
      // highfive: 0, //? 5
      // cuddle: 10,
      // nope: 0, //?10
      // wave: 0, //?10
      // pat: 0, //?15
      // wink: 0, //?15
      // cry: 0, //?15
      // panic: 15,
    };

    Object.keys(funCommands).forEach((key) => {
      commandsLevels[key.replace("Lvl", "").toLowerCase()] = funCommands[key];
    });
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
  async function getGif(action) {
    let resp = {};
    if (action === "cry" || action === "nope") {
      resp = await ainasepics.get(action);
    } else {
      resp = await gifs[action]();
    }
    return resp.url;
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
      const attachment = new AttachmentBuilder(
        "src/imgs/coffeeError.gif",
        "coffeeError.gif"
      );
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
        .setImage("attachment://coffeeError.gif");
      return await interaction.editReply({
        embeds: [lowLevelEmbed],
        files: [attachment],
      });
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
    const url = await getGif(interaction.commandName);
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
