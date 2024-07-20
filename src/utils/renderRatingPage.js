const Level = require("../models/Level");
const { EmbedBuilder } = require("discord.js");
const getUsersByIds = require("./getUsersByIds");

module.exports = async function renderRatingPage(page, perPage, client) {
  try {
    const newContent = await Level.find({})
      .sort({ xp: -1 })
      .skip(perPage * page)
      .limit(perPage);

    const usersIds = newContent.map((user) => user.userId);
    const usersObjs = await getUsersByIds(usersIds, client);
    const usersArrEmbed = newContent.reduce((acc, user) => {
      let userName = usersObjs.find((userObj) => userObj.id === user.userId);
      !!userName ? (userName = userName.displayName) : null;
      if (user.xp >= 5 && userName) {
        acc.push({
          name: userName,
          __level: user.level,
          __xp: user.xp,
          inline: true,
        });
      }
      return acc;
    }, []);
    if (usersArrEmbed.length === 0) {
      console.log("too small xp in this server");
    }
    const fieldsArr = usersArrEmbed.reduce((acc, { name, __xp, __level }) => {
      acc.push({
        name: `#${acc.length + 1 + perPage * page} ` + name.trim(),
        value: `Рівень: \`${__level}\`  XP: \`${__xp}\``,
      });
      return acc;
    }, []);
    //   console.log(await Level.find({}));
    const embed = new EmbedBuilder()
      .setTitle("Рейтинг учасників серверу")
      .setColor("#FFD23F")
      .addFields(...fieldsArr)
      .setThumbnail(
        client.guilds.cache
          .get(await newContent[0].guildId)
          .iconURL({ dynamic: true })
      );
    return {
      embed,
    };
  } catch (err) {
    console.log(err);
  }
};
