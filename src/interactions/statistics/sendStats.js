const fs = require("node:fs");
const {
  cooldowns: { statisticsMinutesCooldown },
} = require("../../constants/config");

module.exports = function sendStats(client) {
  async function getGuild() {
    return await client.guilds.fetch("1192065857363394621");
  }

  async function sendStatsFn() {
    try {
      const guild = await getGuild();
      const data = JSON.parse(
        fs.readFileSync("./src/stats/stats.json", "utf8")
      );
      data.totalMembers =
        guild.memberCount -
        guild.members.cache.filter((member) => member.user.bot === true).size;
      data.membersStatuses = {
        online: guild.members.cache.filter(
          (member) =>
            member.presence !== null &&
            member.presence?.status === "online" &&
            !member.user.bot
        ).size,
        inactive: guild.members.cache.filter(
          (member) =>
            member.presence !== null &&
            member.presence?.status === "idle" &&
            !member.user.bot
        ).size,
        dnd: guild.members.cache.filter(
          (member) =>
            member.presence !== null &&
            member.presence?.status === "dnd" &&
            !member.user.bot
        ).size,
        offline: guild.members.cache.filter(
          (member) =>
            member.presence === null &&
            !member.user.bot
        ).size,
      };
      console.log(data);
      const resp = await fetch(`https://${process.env.FEMIDA_API}/stats`, {
        method: "POST",
        body: JSON.stringify({ statistics: data }),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${process.env.FEMIDA_API_TOKEN}`,
        },
      });
      console.log(resp);
      const status = resp.ok;
      if (!status) {
        console.log("Something went wrong and the stats weren't send :<");
        return;
      }
      const statsTemplate = JSON.stringify({
        messages: [],
        newbies: [],
        membersLeft: [],
        voiceActivities: [],
        stageActivities: [],
      });
      await fs.writeFile("./src/stats/stats.json", statsTemplate, (err) => {
        if (err) throw err;
      });
    } catch (err) {
      console.log(`Error occured while sending stats: ${err}`);
    }
  }
  setInterval(sendStatsFn, statisticsMinutesCooldown * 60 * 1000);
};
