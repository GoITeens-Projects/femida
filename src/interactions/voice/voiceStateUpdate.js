const addPoints = require("../../utils/xp/addPoints");
const {xps: {voice}} = require('../../constants/config');

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
                    await addPoints(user, voice, false)
                });
            }

            if (chanelMembers.length === 4) {
                await fetchMembers();
            }

            if (arrObj.length > 4) {
                await addPoints(newState.id, voice, false)
        }
    }
};
}