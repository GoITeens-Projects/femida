const Level = require("../models/Level");
const addPoints = require("../utils/addPoints")

module.exports = async(oldState, newState, client) => {

    if (newState.channelId) {
        if (!oldState.channelId && newState.channelId) {
            const voiceChannels = client.channels.cache.filter(
                (elem) => elem.type === 2 || elem.type === 13
            );
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
                userIds.forEach(async(user) => {
                    await addPoints(user, 20, false)
                });
            }

            if (chanelMembers.length === 4) {
                await fetchMembers();
            }

            if (arrObj.length > 4) {
                const member = arrObj.get(newState.id);
                const people = await Level.findOne({ userId: newState.id });
                await addPoints(newState.id, 20, false)
        }
    }
};
}