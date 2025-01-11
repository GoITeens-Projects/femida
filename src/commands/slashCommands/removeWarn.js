const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  roles: { adminRoles },
} = require("../../constants/config");
const WarnSystem = require("../../utils/warnSystem");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-warn")
    .setDescription("Зняти попередження (варн) користувачеві")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("target-user")
        .setDescription(
          "Нікнейм користувача, у якого треба забрати попередження"
        )
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription(
          "Кількість варнів (попереджень) яку треба зняти. Звичайний варн дорівнює 1, м'який - 0,5"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      
      if (
        !interaction.member.roles.cache.some((role) =>
          adminRoles.includes(role.id)
        )
      ) {
        await interaction.editReply(
          "Тільки адміністрація має право використовувати цю команду🙃"
        );
        return;
      }
      const data = {
        userId: interaction.options.get("target-user")?.value,
        amount: interaction.options.get("amount")?.value,
      };
      const result = await WarnSystem.removeWarn(data.userId, data.amount);
      const embed = new EmbedBuilder().setTitle(result.message);
      if (result.ok) {
        embed
          .setColor("#FFD23F")
          .setDescription("Попередження зняті(-те), а користувач сповіщений");
      } else {
        embed
          .setTitle("Щось пішло не так")
          .setColor("#D04848")
          .setDescription(result.message);
      }
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.log("Error in removeWarn", err);
    }
  },
};
