const main = require("../../index");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = async function sendDmMsg({ id, level }) {
  try {
    const userObj = await main.client.users.fetch(id);
    const gifNum = Math.floor(Math.random() * (4 - 1) + 1);
    const attachment = new AttachmentBuilder(
      `src/imgs/cheer/catCheer${gifNum}.gif`,
      "catCheer.gif"
    );
    const levelEmbed = {
      embeds: [
        new EmbedBuilder()
          .setColor("#466f8f")
          .setTitle("Вітаю, ти досяг/ла нового ювілейного рівня - " + level)
          .setDescription(
            "А це значить, що зараз - саме час перевірити наявні подарунки. Можливо, ти вже можеш отримати якийсь))"
          )
          .setAuthor({
            name: userObj.username,
            iconURL: userObj.avatar
              ? userObj.displayAvatarURL({ format: "png" })
              : null,
          })
          .setThumbnail(`attachment://catCheer${gifNum}.gif`)
          .setTimestamp(),
      ],
      files: [attachment],
    };
    await userObj.send(levelEmbed);
  } catch (err) {
    console.log("Error while sending dm level message - " + err);
  }
};
