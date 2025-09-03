const cron = require("cron");
const InviteSystem = require("./invitesSystem");

module.exports = async () => {
  const invitesCheckJob = new cron.CronJob(
    "00 46 21 * * *",
    InviteSystem.dailyCheckInvites,
    null,
    true,
    "Europe/Kiev",
    InviteSystem
  );
};
