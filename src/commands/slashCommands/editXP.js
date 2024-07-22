const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Level = require("../../models/Level");
const updateLevel = require("../../utils/updateLevel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-xp")
    .setDescription("Додати чи відняти XP користувачу")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Користувач XP якого ви хочете редагувати")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("xp")
        .setDescription("Скільки XP ви хочете додати або відняти користувачеві")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription(
          "Виберіть «додати», щоб додати XP, або «відняти», щоб відняти XP"
        )
        .addChoices(
          { name: "Add", value: "add" },
          { name: "Subtract", value: "subtract" }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply("Ви не можете запустити цю команду на сервері");
      return;
    }

    const allowedRoles = ["953717386224226385", "953795856308510760"];

    const member = interaction.guild.members.cache.get(interaction.user.id);

    const hasAllowedRole = member.roles.cache.some((role) =>
      allowedRoles.includes(role.id)
    );

    if (!hasAllowedRole) {
      interaction.reply(
        "Тільки адміністрація має право використовувати цю команду🙃"
      );
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get("target-user")?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    let userInfo = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!userInfo) {
      const newUser = new Level({
        userId: targetUserId,
        guildId: interaction.guild.id,
        xp: 0,
        currentXp: 0,
        level: 0,
      });

      await newUser.save();
      userInfo = await Level.findOne({
        userId: targetUserId,
        guildId: interaction.guild.id,
      });
    }
    const replyEmbed = new EmbedBuilder()
      .setTitle("Операція прошла успішно")
      .setColor("#FFD23F")
      .setTimestamp();
    if (interaction.options.get("mode").value === "add") {
      const xpToAdd = interaction.options.get("xp").value;
      userInfo.xp += xpToAdd;
      await userInfo.save();
      await updateLevel(userInfo, userInfo.userId);
      const userNewXP = await Level.findOne({ userId: targetUserId });
      await interaction.editReply({
        embeds: [
          replyEmbed.setDescription(
            `\`${xpToAdd}\` XP було додано до ${targetUserObj.user.tag}. Новий XP користувача - \`${userNewXP.xp}\`. `
          ),
        ],
      });
    } else if (interaction.options.get("mode").value === "subtract") {
      let xpToSubtract = interaction.options.get("xp").value;
      if (xpToSubtract > userInfo.xp) {
        xpToSubtract = userInfo.xp;
      }
      userInfo.xp -= xpToSubtract;
      await userInfo.save();
      await updateLevel(userInfo, userInfo.userId);
      const userNewXP = await Level.findOne({ userId: targetUserId });
      await interaction.editReply({
        embeds: [
          replyEmbed.setDescription(
            `\`${xpToSubtract}\` XP було віднято у ${targetUserObj.user.tag}. Новий XP користувача - \`${userNewXP.xp}\`. `
          ),
        ],
      });
    }
  },
};
