const addPoints = require("../../utils/xp/addPoints");
const {
  xps: { voiceWithAdmin },
  roles: { adminRoles },
} = require("../../constants/config");
const SettingsInterface = require("../../utils/settings");



module.exports = async function checkRoleInVc(oldState, newState, client) {
  if (newState.channelId) {
    if (!oldState.channelId && newState.channelId) {
      const voiceChannels = client.channels.cache.filter(
        (elem) => elem.type === 2
      );
      const genSettings = await SettingsInterface.getSettings();
      const settings = genSettings.xps;
     const voiceWithAdminAmount = settings?.voiceWithAdmin || voiceWithAdmin;

      const arrObj = [];
      voiceChannels.forEach((voiceChannel) => {
        arrObj.push(voiceChannel.members);
      });

      async function fetchMembers() {
        let voiceChannel = {};
        await client.channels
          .fetch(newState.channelId)
          .then((channel) => (voiceChannel = channel))
          .catch((err) => console.log(err));

        const members = voiceChannel.members;
        // console.log(members);
        if (
          adminRoles.filter(
            (role) => newState.member.roles.cache.has(role) === true
          ).length !== 0
        ) {
          const userIds = Object.keys(members).map((key) => members.get(key));
          userIds.forEach(async (user) => {
            await addPoints(user, voiceWithAdminAmount, false);
          });
        } else {
          const userIds = Object.keys(members).map((key) => members.get(key));
          userIds.forEach(async (user) => {
            if (
              adminRoles.filter(
                (role) =>
                  voiceChannel.guild.members.cache
                    .get(user)
                    .roles.cache.has(role) === true
              ).length !== 0
            ) {
              await addPoints(newState.id, voiceWithAdminAmount, false);
            }
          });
        }
      }
      fetchMembers();
      const intervalId = setInterval(async () => {
        let voiceChannel = {};
        await client.channels
          .fetch(newState.channelId ? newState.channelId : oldState.channelId)
          .then((channel) => (voiceChannel = channel))
          .catch((err) => console.log(err));

        const members = voiceChannel.members;
        const userIds = Object.keys(members).map((key) => members.get(key));
        // console.log(userIds);
        userIds.forEach(async (user) => {
          if (
            adminRoles.filter(
              (role) =>
                voiceChannel.guild.members.cache
                  .get(user)
                  .roles.cache.has(role) === true
            ).length !== 0
          ) {
            await addPoints(newState.id, voiceWithAdminAmount, false);
          }
        });
      }, 600000);
      
    }
  }
};
