const { EmbedBuilder } = require("discord.js");
const addPoints = require("../utils/xp/addPoints");
const {
  channels: { boostChannel },
} = require("../constants/config");
const SettingsInterface = require("../utils/settings");

module.exports = async (oldMember, newMember, client) => {
  const genSettings = await SettingsInterface.getSettings();
              const settings = genSettings.xps;
  if (oldMember.premiumSinceTimestamp || newMember.premiumSinceTimestamp) {
    if (
      oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp &&
      newMember.premiumSinceTimestamp > oldMember.premiumSinceTimestamp
    ) {
        
            
      const userId = newMember.user.id;
      const amount = settings?.boost || 500; //? XP for boost

      //? Adding XP for boost

      const addedXp = await addPoints(userId, amount, true);

      //? Sending a message of boost into the system channel

      const titleChoose = [
        "Неочікуваний буст!",
        "Приємний буст!",
        "Несподіваний буст!",
      ][Math.floor(Math.random() * 3)];

      const userIcon = newMember.user.avatar
        ? newMember.user.displayAvatarURL({ format: "png" })
        : null;
      const boostEmbed = new EmbedBuilder()
        .setColor("#f47fff")
        .setTitle(titleChoose)
        .setDescription(
          `<@${userId.toString()}> тільки що забустив/ла цей сервер!\nВам нараховано ${addedXp} XP. Дякуємо за підтримку💜`
        )
        .setAuthor({
          name: newMember.user.username,
          iconURL: userIcon,
        })
        .setThumbnail(userIcon)
        .setTimestamp();

      client.channels.fetch(boostChannel).then((channel) =>
        channel
          .send({
            embeds: [boostEmbed],
          })
          .catch((err) => console.log(err))
      );
    }
  }
};
