const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
// const { execute } = require("./xp");
const Level = require("../../models/Level");
const addPoints = require("../../utils/xp/addPoints");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("subtract-present-points")
    .setDescription("Відняти XP після отримання подарунка")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Користувач XP якого ви хочете відняти")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("present-xp")
        .setDescription("Скільки XP ви хочете відняти користувачеві")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply("Ви не можете запустити цю команду на сервері");
      return;
    }

    const allowedRoles = [
      "953717386224226385",
      "953795856308510760",
      "1192066790717661245",
    ];

    const member = interaction.guild.members.cache.get(interaction.user.id);

    const hasAllowedRole = member.roles.cache.some((role) =>
      allowedRoles.includes(role.id)
    );

    if (!hasAllowedRole) {
      await interaction.reply(
        "Тільки адміністрація має право використовувати цю команду🙃"
      );
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get("target-user")?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    // console.log("mentionedUserId", mentionedUserId);
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    let userInfo = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!userInfo) {
      await interaction.reply("Нажаль такого юзера не знайдено(");
    }

    const replyEmbed = new EmbedBuilder()
      .setTitle("Операція прошла успішно")
      .setColor("#FFD23F")
      .setTimestamp();

    let xpToSubtract = interaction.options.get("present-xp");

    if (xpToSubtract > userInfo.presentXp) {
      xpToSubtract = userInfo.presentXp;
    }

    await addPoints(targetUserId, -xpToSubtract, true);
    const newPresentXp = await Level.findOne({ userId: targetUserId });
    await interaction.editReply({
      embeds: [
        replyEmbed.setDescription(
          `${xpToSubtract} present-xp було віднято у ${targetUserObj.user.tag}. Новий present-xp у користувача \`${newPresentXp.presentXp}\``
        ),
      ],
    });
  },
};
