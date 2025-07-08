const {
  channels: { emergencyChannel },
} = require("../constants/config");

const sendExitMessage = async (client) => {
  const channel = await client.channels.fetch(emergencyChannel);
  await channel.send(
    "<@579623837495328808> <@1137391988417769583> я впала🥀 \nпідійміть мене будь ласка"
  );
};

module.exports = sendExitMessage;
