const fs = require("node:fs");

module.exports = async function addStats(obj) {
  class Activity {
    constructor({ date, id, type }) {
      this.date = date;
      this.id = id;
      this.type = type;
    }
    async writeInJson() {
      try {
        const data = JSON.parse(
          fs.readFileSync("./src/stats/stats.json", "utf8")
        );
        data[obj.type].push(this);
        await fs.writeFile(
          "./src/stats/stats.json",
          JSON.stringify(data),
          (err, data) => {
            if (err) throw err;
            console.log(data);
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
  if (obj.type === "voiceActivities" || obj.type === "stageActivities") {
    try {
      const data = JSON.parse(
        fs.readFileSync("./src/stats/stats.json", "utf8")
      );
      data[obj.type].push(obj);
      await fs.writeFile(
        "./src/stats/stats.json",
        JSON.stringify(data),
        (err, data) => {
          if (err) throw err;
          console.log(data);
        }
      );
    } catch (err) {
      console.log(err);
    }
    return;
  }
  const activityObject = await new Activity(obj).writeInJson();
};
