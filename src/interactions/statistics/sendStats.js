const cron = require("cron");
const fs = require("node:fs");

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
      data.online = guild.members.cache.filter(
        (member) =>
          member.presence !== null &&
          member.presence?.status !== "offline" &&
          !member.user.bot
      ).size;
      console.log(data);
      // const resp = await fetch(`https://${process.env.FEMIDA_API}/statistics`, {
      //   method: "POST",
      //   body: data,
      //   headers: {
      //     "Content-Type": "application/json; charset=UTF-8",
      //   },
      // });
      const status = true;
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
      await fs.writeFile(
        "./src/stats/stats.json",
        statsTemplate,
        (err, data) => {
          if (err) throw err;
        }
      );
    } catch (err) {
      console.log(`Error occured while sending stats: ${err}`);
    }
  }
  setInterval(sendStatsFn, 0.25 * 60 * 1000);
};
