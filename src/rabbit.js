const amqp = require("amqplib");
const handleSettings = require("./utils/rabbitHandlers/handleSettings");

class Rabbit {
  constructor() {
    this.connection = {};
    this.channel = {};
  }
  async connect() {
    try {
      const connection = await amqp.connect(process.env.RABBIT_URL);
      const channel = await connection.createChannel();
      console.log("₍ᐢᐢ₎");
      this.connect = connection;
      this.channel = channel;
      this.consumeMessages();
    } catch (err) {
      console.log(err);
    }
  }
  async consumeMessages(queueName = "settings") {
    await this.channel.assertQueue(queueName, { durable: true });
    this.channel.consume(queueName, async (msg) => {
      try {
        if (msg !== null) {
          const messageContent = JSON.parse(msg.content.toString());
          await handleSettings(messageContent.body, this.channel, msg);
        }
      } catch (err) {
        console.log("Error while receiving Rabbit message: ", err);
      }
    });
  }
}

module.exports = new Rabbit();
