const cron = require("cron");
const InviteSystem = require("./invitesSystem");

module.exports = async () => {
  const invitesCheckJob = new cron.CronJob(
    "00 59 19 * * *",
    InviteSystem.dailyCheckInvites,
    null,
    true,
    "Europe/Kiev",
    InviteSystem
  );
};
