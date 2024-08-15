const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");
const getLimit = require("../utils/getNeededXp")
const addPoints = require("../utils/addPoints")

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
          newState.member.roles.cache.has("953717386224226385") ||
          newState.member.roles.cache.has("953795856308510760")
        ) {
          const userIds = members.map((member) => member.user.id);
          userIds.forEach(async (user) => {
            await addPoints(user, 25, false)
          });
        } else {
          const userIds = members.map((member) => member.user.id);
          userIds.forEach(async (user) => {
            if (
              voiceChannel.guild.members.cache
                .get(user)
                .roles.cache.has("953717386224226385") ||
              voiceChannel.guild.members.cache
                .get(user)
                .roles.cache.has("953795856308510760")
            ) {
              await addPoints(newState.id, 25, false)
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
            voiceChannel.guild.members.cache
              .get(user)
              .roles.cache.has("953717386224226385") ||
            voiceChannel.guild.members.cache
              .get(user)
              .roles.cache.has("953795856308510760")
          ) {
            await addPoints(newState.id, 25, false)
          }
        });
      }, 600000);
    }
  }
};
