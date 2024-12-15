const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  roles: { adminRoles },
} = require("../../constants/config");
const WarnSystem = require("../../utils/warnSystem");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("give-warn")
    .setDescription("Видати попередження (варн) користувачу")
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription("Нікнейм користувача, якому треба дати попередження")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("is-soft")
        .setDescription("Використати 'м`яке' попередження, чи звичайне?")
        .addChoices(
          { name: "звичайне", value: "default" },
          { name: "м'яке", value: "soft" }
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription(
          "Причина, з якої користувач заслуговує отримати попередження"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      if (!interaction.inGuild()) {
        await interaction.editReply(
          "Ви не можете запустити цю команду не на сервері"
        );
        return;
      }
      // if (!interaction.member.roles.cache.some((role) => adminRoles.includes(role.id))) {
      //   interaction.reply(
      //     "Тільки адміністрація має право використовувати цю команду🙃"
      //   );
      //   return;
      // }
      const data = {
        userId: interaction.options.get("target-user")?.value,
        isSoft: interaction.options.get("is-soft")?.value === "soft",
        reason: interaction.options.get("reason")?.value,
      };
      if (data.isSoft) {
        await WarnSystem.giveSoftWarn(data.userId, data.reason, true);
        const embed = new EmbedBuilder()
          .setTitle("М'яке попередження успішно видано")
          .setColor("#FFD23F")
          .setDescription(`Користувач <@${data.userId}> вже про це сповіщений`)
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        return;
      } else {
        await WarnSystem.giveWarn(data.userId, data.reason, true);
        const embed = new EmbedBuilder()
          .setTitle("Попередження успішно видано")
          .setColor("#FFD23F")
          .setDescription(`Користувач <@${data.userId}> вже про це сповіщений`)
          .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (err) {
      console.log("Error in giveWarn", err);
    }
  },
};
