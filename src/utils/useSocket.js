const main = require("../index.js");
const WebSocket = require("ws");

module.exports = function useSocket(obj, msg) {
  const ws = new WebSocket(process.env.FEMIDA_API);
  ws.onopen = (evt) => {
    ws.send(JSON.stringify(obj));
    msg.channel.send("Пречудово. Відтепер у тебе є 15 хвилин на те, щоб перейти по посиланню в електронному листі")
  };
  ws.onmessage = async ({ data }) => {
    const resp = JSON.parse(data);
    if (!resp.ok) {
      msg.react("🚩");
    }
    if (resp.user) {
      const guild = main.client.guilds.cache.get("1192065857363394621");
      const member = await guild.members.fetch(resp.user.discordId);
      const role = guild.roles.cache.get("1262374645521190922");
      console.log(member, "member");
      console.log(role, "role");
      member.user.send("Перевір свої ролі на сервері))");
      return member.roles.add(role);
    }
    await msg.reply(resp.message);
  };
  setTimeout(async () => {
    ws.close();
    await msg.followUp(
      "Час вийшов, посилання для верифікації більше неактивне"
    );
  }, 1000 * 60 * 15);
};
