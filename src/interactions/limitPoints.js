const Level = require("../models/Level");
const cron = require("cron");

module.exports = async () => {
  async function update(currentUser) {
    await Level.findOneAndUpdate(
      { userId: currentUser.userId },
      { currentXp: 0 }
    );
  }

  async function users() {
    const currentUsers = await Level.find({});
    currentUsers.map(async (currentUser) => {
      await update(currentUser);
    });
  }

  const hours = new cron.CronJob("00 00 00 * * *", users);
  hours.start();
};
