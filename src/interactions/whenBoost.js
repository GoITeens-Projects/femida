const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");
const { EmbedBuilder } = require("discord.js");

module.exports = async (oldMember, newMember, client) => {
  if (oldMember.premiumSinceTimestamp || newMember.premiumSinceTimestamp) {
    if (
      oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp &&
      newMember.premiumSinceTimestamp > oldMember.premiumSinceTimestamp
    ) {
      const userId = newMember.user.id;

      //? Adding XP for boost

      let userData = await Level.findOne({ userId: userId });

      if (userData === null || userData === undefined) {
        userData = new Level({
          userId: userId,
          guildId: newMember.guild.id,
          xp: 0,
          level: 0,
          currentXp: 0,
        });

        await userData.save(); //? adding new user to DB if he's not there
      }

      const updatedXp = userData.xp + 200;

      await Level.findOneAndUpdate({ userId: userId }, { xp: updatedXp });
      await updateLevel(userData, userId);
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
          `<@${userId.toString()}> тільки що забустив/ла цей сервер!\nВам нараховано 200 XP. Дякуємо за підтримку💜`
        )
        .setAuthor({
          name: newMember.user.username,
          iconURL: userIcon,
        })
        .setThumbnail(userIcon)
        .setTimestamp();

      client.channels.fetch("1050608203945234442").then((channel) =>
        channel
          .send({
            embeds: [boostEmbed],
          })
          .catch((err) => console.log(err))
      );
    }
  }
};
