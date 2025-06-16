const { REST, Routes } = require("discord.js");
const { config } = require("dotenv");
const {
  channels: { ticketChannel },
} = require("./constants/config");

config();

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST().setToken(token);

const 

(async () => {
  try {
    await rest.post(Routes.channelMessages(ticketChannel), {
      body: { content: ticketContainer },
    });
  } catch (error) {
    console.error(error);
  }
})();
