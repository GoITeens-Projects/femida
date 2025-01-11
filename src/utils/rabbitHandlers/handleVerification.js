const main = require("../../index");
const {
  guildId,
  roles: { studentRole },
} = require("../../constants/config");

module.exports = async (content, channel, msg) => {
  try {
    const dmChannel = await main.client.users.createDM(content.discordId);
    const messages = await dmChannel.messages.fetch({ limit: 100 });
    if (!content.ok) {
      messages
        .filter(
          (message) =>
            !message.author.bot ||
            message.content.toLowerCase().includes("verify ")
        )
        .first()
        .react("🚩");
    }
    if (content.discordId) {
      const guild = main.client.guilds.cache.get(guildId);
      const member = await guild.members.fetch(content.discordId);
      const role = guild.roles.cache.get(studentRole);
      member.user.send("Перевір свої ролі на сервері))");
      member.roles.add(role);
      return;
    }
    dmChannel.send("Перевір свої ролі))");
    channel.ack(msg);
  } catch (err) {
    console.log("Error while handling verification queue", err);
  }
};
