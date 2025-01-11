const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
// const { execute } = require("./xp");
const Level = require("../../models/Level");
const addPoints = require("../../utils/xp/addPoints");
const {
  roles: { adminRoles },
} = require("../../constants/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("subtract-present-xp")
    .setDescription("Відняти XP після отримання подарунка")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Користувач XP якого ви хочете відняти")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Скільки XP ви хочете відняти користувачеві")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply("Ви не можете запустити цю команду на сервері");
      return;
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    const hasAllowedRole = member.roles.cache.some((role) =>
      adminRoles.includes(role.id)
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

    if (!userInfo.presentXp) {
      userInfo = await Level.findOneAndUpdate(
        { userId: targetUserId },
        { presentXp: userInfo.xp },
        { new: true }
      );
    }

    const replyEmbed = new EmbedBuilder()
      .setTitle("Операція прошла успішно")
      .setColor("#FFD23F")
      .setTimestamp();

    let xpToSubtract = interaction.options.get("amount").value;

    if (xpToSubtract > userInfo.presentXp) {
      xpToSubtract = userInfo.presentXp;
    }
    console.log(userInfo.presentXp);
    console.log(xpToSubtract);

    // await addPoints(targetUserId, -xpToSubtract, true);
    const subtractPresent = userInfo.presentXp - xpToSubtract;
    const updatedUserInfo = await Level.findOneAndUpdate(
      {
        userId: targetUserId,
        guildId: interaction.guild.id,
      },
      { presentXp: subtractPresent },
      { new: true }
    );
    // const newPresentXp = await Level.findOne({ userId: targetUserId });
    await interaction.editReply({
      embeds: [
        replyEmbed.setDescription(
          `${xpToSubtract} бали для подарунків було знято у ${targetUserObj.user.tag}. Оновлена кількість: \`${updatedUserInfo.presentXp}\``
        ),
      ],
    });
  },
};
