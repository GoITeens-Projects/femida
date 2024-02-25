const creatingRatingEmbed = require("../utils/creatingRatingEmbed")
const cron = require("cron");

module.exports = async (client) => {
  const sendRatingFn = async () => {
    const ratingEmbed = await creatingRatingEmbed(client);

    client.channels
      .fetch("1192080421677191288")
      .then((channel) =>
        channel.send({ embeds: [ratingEmbed], fetchReply: true })
      );
  };
  const sendRatingJob = new cron.CronJob("20 20 * * * *", sendRatingFn);
  sendRatingJob.start();
};