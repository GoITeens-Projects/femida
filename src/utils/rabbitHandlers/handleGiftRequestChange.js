const main = require("../../index");

module.exports = async (content, channel, msg) => {
  try {
    const latestChange =
      content.trackingHistory[content.trackingHistory.length - 1];
    let msgForUser = `Привіт! Статус твого запиту на отримання  \` ${content.requestedGift.title} \` змінено на **${latestChange.status.text}** `;
    if (latestChange.extraComment) {
      msgForUser += `\n Додатковий коментар від адміністрації: *${latestChange.extraComment}*`;
    }
    if (content.postOrderId.length > 3) {
      msgForUser += `\n Номер замовлення — \` ${content.postOrderId} \` `;
    }
    (await main.client.users.fetch(content.clientData.discordId)).send({
      content: msgForUser,
    });
    channel.ack(msg);
  } catch (err) {
    console.log("Error while handling gift-requests queue", err);
  }
};
