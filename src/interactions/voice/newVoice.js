const addPoints = require("../../utils/xp/addPoints");
const addStats = require("../../interactions/statistics/addStats");
const { nanoid } = require("nanoid");
const {
  xps: { voice, stage, voiceWithAdmin },
  roles: { adminRoles },
} = require("../../constants/config");

const stats = {};
const intervals = {};

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

async function handlePointsDistribution(voiceChannel, client) {
  const members = [...voiceChannel.members.values()];

  const hasAdmin = members.some((member) =>
    adminRoles.some((role) => member.roles.cache.has(role))
  );

  if (members.length >= 3 || hasAdmin) {
    if (hasAdmin) {
      for (const member of members) {
        const userStats = stats[voiceChannel.id]?.members?.find(
          (stat) => stat.id === member.user.id
        );
        if (!userStats || !userStats.adminPointsAdded) {
          await addPoints(member.user.id, voiceWithAdmin, false);
          if (userStats) userStats.adminPointsAdded = true;
        }
      }

      if (!intervals[voiceChannel.id]) {
        intervals[voiceChannel.id] = setInterval(async () => {
          for (const member of members) {
            await addPoints(member.user.id, voiceWithAdmin, false);
          }
        }, 10 * 60 * 1000);
      }
    } else {
      for (const member of members) {
        const userStats = stats[voiceChannel.id]?.members?.find(
          (stat) => stat.id === member.user.id
        );
        if (!userStats || !userStats.voicePointsAdded) {
          await addPoints(member.user.id, voice, false);
          if (userStats) userStats.voicePointsAdded = true;
        }
      }
    }
  } else {
    console.log("Недостатньо учасників і немає адміна. Бали не додаються.");
  }
}

module.exports = async (oldState, newState, client) => {
  const oldChannel = oldState.channelId
    ? await client.channels.fetch(oldState.channelId)
    : null;
  const newChannel = newState.channelId
    ? await client.channels.fetch(newState.channelId)
    : null;

  if (oldChannel && !newChannel) {
    const voiceChannel = oldChannel;
    const stat = stats[voiceChannel.id];

    if (stat) {
      const memberIndex = stat.members.findIndex(
        (member) => member.id === oldState.id
      );
      if (memberIndex !== -1) {
        stat.members[memberIndex].leftTimestamp = Date.now();
      }

      if (voiceChannel.members.size === 0) {
        clearInterval(intervals[voiceChannel.id]);
        delete intervals[voiceChannel.id];

        const voiceStats = new VoiceActivity({
          members: stat.members,
          voiceChannelId: voiceChannel.id,
          startTimestamp: stat.startTimestamp,
          endTimestamp: Date.now(),
          isStage: voiceChannel.type === 13,
        });

        voiceStats.members.forEach((member) => {
          member.sessionTimeInHours = Number(
            (
              (member.leftTimestamp - member.joinTimestamp) /
              (1000 * 60 * 60)
            ).toFixed(3)
          );
          member.sessionTimeInMinutes = Number(
            (
              (member.leftTimestamp - member.joinTimestamp) /
              (1000 * 60)
            ).toFixed(1)
          );
        });

        voiceStats.totalSessionTime =
          voiceStats.endTimestamp - voiceStats.startTimestamp;
        if (voiceStats.members.length !== 1) await addStats(voiceStats);
        delete stats[voiceChannel.id];
      }
    }
    return;
  }

  if (newChannel) {
    if (!stats[newChannel.id]) {
      stats[newChannel.id] = { members: [], startTimestamp: Date.now() };
    }

    const existingMember = stats[newChannel.id].members.find(
      (member) => member.id === newState.id
    );

    if (!existingMember) {
      stats[newChannel.id].members.push({
        id: newState.id,
        joinTimestamp: Date.now(),
        leftTimestamp: null,
        adminPointsAdded: false,
        voicePointsAdded: false,
      });
    }

    if (newChannel.type === 13) {
      await addPoints(newState.id, stage, false);
    } else {
      await handlePointsDistribution(newChannel, client);
    }
  }
};
