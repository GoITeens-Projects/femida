const { clear } = require("../constants/newMap.js");
const main = require("../index.js");
const WebSocket = require("ws");

module.exports = function useSocket(obj, msg) {
  const ws = new WebSocket("wss://" + process.env.FEMIDA_API + "/verify");
  const timerId = setTimeout(async () => {
    ws.close();
    await msg.reply("Час вийшов, посилання для верифікації більше неактивне");
  }, 1000 * 60 * 15);
  ws.onopen = (evt) => {
    ws.send(JSON.stringify(obj));
    // msg.channel.send(
    //   "Пречудово. Відтепер у тебе є 15 хвилин на те, щоб перейти по посиланню в електронному листі"
    // );
  };
  ws.onmessage = async ({ data }) => {
    const resp = JSON.parse(data);
    if (!resp.ok) {
      msg.react("🚩");
    }
    if (resp.user) {
      if (resp.user.discordId !== obj.id) return;
      const guild = main.client.guilds.cache.get("1192065857363394621");
      const member = await guild.members.fetch(resp.user.discordId);
      const role = guild.roles.cache.get("1262374645521190922");
      // console.log(member, "member");
      // console.log(role, "role");
      member.user.send("Перевір свої ролі на сервері))");
      member.roles.add(role);
      clearTimeout(timerId);
      return ws.close();
    }
    await msg.reply(resp.message);
  };
};
