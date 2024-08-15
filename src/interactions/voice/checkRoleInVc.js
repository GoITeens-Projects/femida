const addPoints = require("../../utils/xp/addPoints");
const {
  xps: { voiceWithAdmin },
  roles: { adminRoles },
} = require("../../constants/config");

module.exports = async function checkRoleInVc(oldState, newState, client) {
  if (newState.channelId) {
    if (!oldState.channelId && newState.channelId) {
      const voiceChannels = client.channels.cache.filter(
        (elem) => elem.type === 2
      );
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

        if (
          adminRoles.filter(
            (role) => newState.member.roles.cache.has(role) === true
          ).length !== 0
        ) {
          const userIds = members.map((member) => member.user.id);
          userIds.forEach(async (user) => {
            await addPoints(user, voiceWithAdmin, false);
          });
        } else {
          const userIds = members.map((member) => member.user.id);
          userIds.forEach(async (user) => {
            if (
              adminRoles.filter(
                (role) =>
                  voiceChannel.guild.members.cache
                    .get(user)
                    .roles.cache.has(role) === true
              ).length !== 0
            ) {
              await addPoints(newState.id, voiceWithAdmin, false);
            }
          });
        }
      }
      fetchMembers();
      setInterval(async () => {
        let voiceChannel = {};
        await client.channels
          .fetch(newState.channelId)
          .then((channel) => (voiceChannel = channel))
          .catch((err) => console.log(err));

        const members = voiceChannel.members;
        const userIds = members.map((member) => member.user.id);
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
            await addPoints(newState.id, voiceWithAdmin, false);
          }
        });
      }, 600000);
    }
  }
};
