const main = require("../index.js");
const {
  guildId,
  roles: { studentRole },
} = require("../constants/config.js");
const WebSocket = require("ws");

module.exports = function useSocket(obj, msg, waitMsg) {
  const ws = new WebSocket("ws://" + process.env.FEMIDA_API + "/verify");
  const timerId = setTimeout(
    async () => {
      ws.close();
      await msg.reply("Час вийшов, посилання для верифікації більше неактивне");
    },
    1000 * 60 * 15
  );
  ws.onopen = () => {
    ws.send(JSON.stringify(obj));
  };
  ws.onmessage = async ({ data }) => {
    const resp = JSON.parse(data);
    if (!resp.ok) {
      msg.react("🚩");
      clearTimeout(timerId);
    }
    if (resp.user) {
      if (resp.user.discordId !== obj.id) return;
      const guild = main.client.guilds.cache.get(guildId);
      const member = await guild.members.fetch(resp.user.discordId);
      const role = guild.roles.cache.get(studentRole);
      clearTimeout(timerId);
      member.user.send("Перевір свої ролі на сервері))");
      member.roles.add(role);
      return ws.close();
    }
    await waitMsg.edit(resp.message);
  };
};
