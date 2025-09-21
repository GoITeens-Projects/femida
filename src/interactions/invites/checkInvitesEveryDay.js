const cron = require("cron");
const InviteSystem = require("./invitesSystem");

module.exports = async () => {
  const invitesCheckJob = new cron.CronJob(
    "00 25 19 * * *",
    InviteSystem.dailyCheckInvites,
    null,
    true,
    "Europe/Kiev",
    InviteSystem
  );
};
