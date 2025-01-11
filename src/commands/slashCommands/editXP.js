const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Level = require("../../models/Level");
const addPoints = require("../../utils/xp/addPoints");
const addNewMember = require("../../interactions/addNewMember");
const {
  roles: { adminRoles },
} = require("../../constants/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit-xp")
    .setDescription("Додати чи відняти XP користувачу")
    .setDMPermission(false)
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
          { name: "Додати", value: "add" },
          { name: "Відняти", value: "subtract" }
        )
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
      await addNewMember(interaction);
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
      const addPointsResult = await addPoints(targetUserId, xpToAdd, true);
      const userNewXP = await Level.findOne({ userId: targetUserId });
      await interaction.editReply({
        embeds: [
          replyEmbed.setDescription(
            `\`${xpToAdd}\` XP було додано до ${targetUserObj.user.tag}. Новий XP користувача - \`${addPointsResult}\`. `
          ),
        ],
      });
    } else if (interaction.options.get("mode").value === "subtract") {
      let xpToSubtract = interaction.options.get("xp").value;
      if (xpToSubtract > userInfo.xp) {
        xpToSubtract = userInfo.xp;
      }
      await addPoints(targetUserId, -xpToSubtract, true);
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
