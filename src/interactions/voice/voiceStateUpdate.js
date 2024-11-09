const addPoints = require("../../utils/xp/addPoints");
const {
  xps: { voice, stage },
} = require("../../constants/config");
const addStats = require("../../interactions/statistics/addStats");
const { nanoid } = require("nanoid");
// const stats = {
//   123: {
//     startTimestamp: 1643723400,
//     endTimestamp: 1643723400,
//     members: [
//       {
//         id: 654,
//         joinTimestamp: 1643723400,
//         leftTimestamp: 1643723400,
//       },
//     ],
//   },
// };
const stats = {};
class VoiceActivity {
  constructor({
    members,
    voiceChannelId,
    startTimestamp,
    endTimestamp,
    isStage,
  }) {
    this.members = members;
    this.voiceChannelId = voiceChannelId;
    this.sessionId = nanoid(5);
    this.startTimestamp = startTimestamp;
    this.endTimestamp = endTimestamp;
    this.type = isStage ? "stageActivities" : "voiceActivities";
  }
}

module.exports = async (oldState, newState, client) => {
  if (oldState.channel && !newState.channel) {
    try {
      const voiceChannel = await client.channels.fetch(oldState.channelId);
      if (voiceChannel.members.size !== 0) {
        stats[voiceChannel.id].members[
          stats[voiceChannel.id].members.findIndex(
            (member) => member.id === oldState.id
          )
        ].leftTimestamp = Date.now();
        return;
      }

      stats[voiceChannel.id].endTimestamp = new Date();
      stats[voiceChannel.id].members[
        stats[voiceChannel.id].members.findIndex(
          (member) => member.id === oldState.id
        )
      ].leftTimestamp = Date.now();
      if (
        !stats[voiceChannel.id].members.filter(
          (member) => member.leftTimestamp === null
        )[0]
      ) {
        const voiceStats = new VoiceActivity({
          members: stats[voiceChannel.id].members,
          voiceChannelId: voiceChannel.id,
          endTimestamp: stats[voiceChannel.id].endTimestamp,
          startTimestamp: stats[voiceChannel.id].startTimestamp,
          isStage: voiceChannel.type === 13,
        });
        delete stats[voiceChannel.id];
        voiceStats.members.forEach((member, index) => {
          voiceStats.members[index].sessionTimeInHours = Number(
            (
              (member.leftTimestamp - member.joinTimestamp) /
              (1000 * 60 * 60)
            ).toFixed(3)
          );
          voiceStats.members[index].sessionTimeInMinutes = Number(
            (
              (member.leftTimestamp - member.joinTimestamp) /
              (1000 * 60)
            ).toFixed(1)
          );
        });
        voiceStats.totalSessionTime =
          voiceStats.endTimestamp.getTime() -
          voiceStats.startTimestamp.getTime();
        if (voiceStats.members.length === 1) return;
        await addStats(voiceStats);
        return;
      }
    } catch (err) {
      console.log(err);
    }
    return;
  }
  if (newState.channelId) {
    if (!oldState.channelId && newState.channelId) {
      //   const voiceChannels = client.channels.cache.filter(
      //     (elem) => elem.type === 2 || elem.type === 13
      //   );
      let stvoiceChannel = {};
      // await client.channels
      //   .fetch(newState.channelId)
      //   .then((channel) => (stvoiceChannel = channel))
      //   .catch((err) => console.log(err));
      try {
        stvoiceChannel = await client.channels.fetch(newState.channelId);
      } catch (err) {
        console.log(err);
      }
      // .then((channel) => (stvoiceChannel = channel))
      // .catch((err) => console.log(err));

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

      if (!stats[stvoiceChannel.id]) {
        stats[stvoiceChannel.id] = {};
        stats[stvoiceChannel.id].members = [];
      }

      if (arrObj.size === 1) {
        stats[stvoiceChannel.id].startTimestamp = new Date();
      }

      stats[stvoiceChannel.id].members.push({
        id: newState.id,
        joinTimestamp: Date.now(),
        leftTimestamp: null,
      });

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

// setInterval(() => {
//   console.log("members", stats["1192079414213742602"].members);
// }, 2000);
