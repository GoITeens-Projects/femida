const amqp = require("amqplib");
const handleSettings = require("./utils/rabbitHandlers/handleSettings");
const handleVerification = require("./utils/rabbitHandlers/handleVerification");

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
  async consumeMessages() {
    await this.channel.assertQueue("settings", { durable: true });
    this.channel.consume("settings", async (msg) => {
      try {
        console.log("Rabbit MSG", msg);
        if (msg !== null) {
          const messageContent = JSON.parse(msg.content.toString());
          await handleSettings(messageContent.body, this.channel, msg);
        }
      } catch (err) {
        console.log("Error while receiving Rabbit message: ", err);
      }
    });
    await this.channel.assertQueue("verification", { durable: true });
    this.channel.consume("verification", async (msg) => {
      try {
        console.log("Rabbit MSG", msg);
        if (msg !== null) {
          const messageContent = JSON.parse(msg.content.toString());
          await handleVerification(messageContent.body, this.channel, msg);
        }
      } catch (err) {
        console.log("Error while receiving Rabbit message: ", err);
      }
    });
  }
}

module.exports = new Rabbit();
