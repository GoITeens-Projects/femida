const amqp = require("amqplib");

const consumeMessages = async (queueName) => {
  try {
    const connection = await amqp.connect(process.env.RABBIT_URL);
    const channel = await connection.createChannel();
    console.log("₍ᐢᐢ₎");
    await channel.assertQueue(queueName, { durable: true });
    console.log(`Waiting for messages in queue: ${queueName}`);

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const messageContent = JSON.parse(msg.content.toString());
        console.log("Received message:", messageContent.body.badwords.words);
        channel.ack(msg);
        // await handleMessage(messageContent, channel, msg);
      }
    });
  } catch (error) {
    console.error("Error in RabbitMQ consumer:", error);
  }
};
// consumeMessages("settings");

module.exports = consumeMessages;
