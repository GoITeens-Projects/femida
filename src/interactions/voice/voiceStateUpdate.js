const addPoints = require("../../utils/xp/addPoints");
const {
  xps: { voice, stage },
} = require("../../constants/config");
const addStats = require("../../utils/stats/addStats");

module.exports = async (oldState, newState, client) => {
  if (newState.channelId) {
    if (!oldState.channelId && newState.channelId) {
      //   const voiceChannels = client.channels.cache.filter(
      //     (elem) => elem.type === 2 || elem.type === 13
      //   );
      let stvoiceChannel = {};
      await client.channels
        .fetch(newState.channelId)
        .then((channel) => (stvoiceChannel = channel))
        .catch((err) => console.log(err));

      const arrObj = stvoiceChannel.members;
      const chanelMembers = arrObj.map((member) => member.user.id);

      async function fetchMembers() {
        let voiceChannel = {};
        await client.channels
          .fetch(newState.channelId)
          .then((channel) => (voiceChannel = channel))
          .catch((err) => console.log(err));

        const members = voiceChannel.members;

        const userIds = members.map((member) => member.user.id);
        userIds.forEach((user) => {
          client.channels.cache.map(async (channel) => {
            if (channel.type === 2) {
              await addPoints(user, voice, false);
            }
            if (channel.type === 13) {
              await addPoints(user, stage, false);
            }
          });
        });
      }

      if (chanelMembers.length === 4) {
        await fetchMembers();
      }

      if (arrObj.length > 4) {
        client.channels.cache.map(async (channel) => {
          if (channel.type === 2) {
            await addPoints(newState.id, voice, false);
          }
          if (channel.type === 13) {
            await addPoints(newState.id, stage, false);
          }
        });
        // await addPoints(newState.id, voice, false);
      }
    }
  }
};
