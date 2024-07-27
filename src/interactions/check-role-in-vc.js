const Level = require("../models/Level");
const updateLevel = require("../utils/updateLevel");
const getLimit = require("../utils/getNeededXp")

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
            const people = await Level.findOne({ userId: user });
            const limit = getLimit(people.level)
            if (people.currentXp !== limit) {
              let updateXp = people.currentXp + 30;
              let upAllXp = people.xp + 30;
              if (updateXp > limit) {
                updateXp = limit;
                const up = limit - people.currentXp;
                upAllXp = people.xp + up;
              }
              await Level.findOneAndUpdate(
                { userId: user },
                { currentXp: updateXp, xp: upAllXp}
              );
              await updateLevel(people, user);
            }
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
              const people = await Level.findOne({ userId: newState.id });
              const limit = getLimit(people.level)
              if (people.currentXp !== limit) {
                let updateXp = people.currentXp + 30;
                let upAllXp = people.xp + 30;
                if (updateXp > limit) {
                  updateXp = limit;
                  const up = limit - people.currentXp;
                  upAllXp = people.xp + up;
                }
                await Level.findOneAndUpdate(
                  { userId: newState.id },
                  { currentXp: updateXp,  xp: upAllXp }
                );
                await updateLevel(people, user);
              }
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
            const people = await Level.findOne({ userId: newState.id });
            const limit = getLimit(people.level)
            if (people.currentXp !== limit) {
              let updateXp = people.currentXp + 10;
              let upAllXp = people.xp + 10;
              if (updateXp > limit) {
                updateXp = limit;
                const up = limit - people.currentXp;
                upAllXp = people.xp + up;
              }
              await Level.findOneAndUpdate(
                { userId: newState.id },
                { currentXp: updateXp,  xp: upAllXp }
              );
              await updateLevel(people, user);
            }
          }
        });
      }, 600000);
    }
  }
};
