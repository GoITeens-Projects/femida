const fs = require("node:fs");
const {
  cooldowns: { statisticsMinutesCooldown },
  guildId,
} = require("../../constants/config");
const Level = require("../../models/Level");

class UserDto {
  constructor({ userId, guildId, xp, level, currentXp }) {
    this.userId = userId;
    this.guildId = guildId;
    this.xp = xp;
    this.level = level;
    this.currentXp = currentXp;
  }
}

module.exports = function sendStats(client) {
  async function getGuild() {
    return await client.guilds.fetch(guildId);
  }

  async function sendStatsFn() {
    try {
      const guild = await getGuild();
      const data = JSON.parse(
        fs.readFileSync("./src/stats/stats.json", "utf8")
      );
      const economy = await Level.find({ xp: { $gt: 50 } }).sort({ xp: 1 });
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
          (member) => member.presence === null && !member.user.bot
        ).size,
      };
      data.economy = economy.map((user) => new UserDto(user));
      console.log(data);
      // const resp = await fetch(`https://${process.env.FEMIDA_API}/stats`, {
      //   method: "POST",
      //   body: JSON.stringify({ statistics: data }),
      //   headers: {
      //     "Content-Type": "application/json; charset=UTF-8",
      //     Authorization: `Bearer ${process.env.FEMIDA_API_TOKEN}`,
      //   },
      // });
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
