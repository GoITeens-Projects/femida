const addPoints = require("../../utils/xp/addPoints");
const SettingsInterface = require("../../utils/settings");



module.exports = async function updateInvites(person, client) {
  client.guilds.cache.each((guild) => {
    guild.invites.fetch().then((guildInvites) => {
      guildInvites.each((guildInvite) => {
        if (String(guildInvite.inviterId) in mainObj) {
          const newValue =
            global.tempObj[String(guildInvite.inviterId)] + guildInvite.uses;
          global.tempObj[String(guildInvite.inviterId)] = newValue;
        }
      });
    });
  });

  let res = await person.guild.members.fetch();

  async function up() {
    const genSettings = await SettingsInterface.getSettings();
    const settings = genSettings.xps;
    const inviteAmount = settings?.invite || invite; //? XP for invite
    res.forEach(async (member) => {
      
      if (!member.user.bot) {
        if (
          global.tempObj[String(member.user.id)] !==
          global.mainObj[String(member.user.id)]
        ) {
          global.mainObj[String(member.user.id)] =
            global.tempObj[String(member.user.id)];
          const date = new Date();
          const month =
            (date.getFullYear() - member.joinedAt.getFullYear()) * 12 +
            date.getMonth();
          if (
            member.joinedAt.getMonth() < month &&
            global.userList[String(member.user.id)] > 0
          ) {
            await addPoints(member.user.id, inviteAmount, true);
            global.userList[String(member.user.id)]--;
          }
        }
      }
    });
  }
  setTimeout(up, 1000);
};
