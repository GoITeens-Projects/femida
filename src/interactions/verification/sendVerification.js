const { EmbedBuilder } = require("discord.js");
const { guildId } = require("../../constants/config");

module.exports = async function sendVerification(
  user,
  client,
  guild,
  isCommand
) {
  const currentHours = new Date().getHours();
  const color = currentHours >= 6 && currentHours < 21 ? "#FFD23F" : "#003366";
  const icon = client
    ? client.guilds.cache.get(guildId).iconURL({ dynamic: true })
    : guild.iconURL({ dynamic: true });
  const verificationEmbed = new EmbedBuilder()
    .setColor(color)
    .setTitle("Навчаєшся в GoITeens? Тоді це повідомлення для тебе")
    .setDescription(
      "На нашому сервері є можливість верифікації учнів. Для цього потрібен лише твій email на якому зареєстрований кабінет LMS, і, звісно, доступ до нього \n\n Якщо ж ти не є учнем академії або просто хочеш залишитись інкогніто, можеш ігнорувати це повідомлення"
    )
    .addFields({
      name: "Як розпочати верифікацію?",
      value:
        "Просто напиши сюди команду типу `Verify твійemail` \n Приклад повідомлення: Verify goiteens@gmail.com",
    })
    .setThumbnail(icon)
    .setFooter({
      text: "По секрету, верифіковані учні мають деякі плюшки на сервері))",
    });
  if (isCommand) {
    verificationEmbed.setTitle(
      "Оп, схоже в нас є це один бажаючий верифікуватися)"
    );
  }
  try {
    user.send({ embeds: [verificationEmbed] });
  } catch (err) {
    return;
  }
};
