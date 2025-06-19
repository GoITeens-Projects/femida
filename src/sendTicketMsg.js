const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { component } = require("./components/createTicketBtn/createTicketBtn");
const { config } = require("dotenv");
const {
  channels: { ticketChannel },
} = require("./constants/config");

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const token = process.env.TOKEN;
client.login(token);

//?

const title = new TextDisplayBuilder().setContent(
  `## У вас є питання до адміністрації?`
);
const description = new TextDisplayBuilder().setContent(
  `Тоді напишіть нам його натиснувши на кнопочку нижче📩 \nЗ радістю розглянемо ваше питаннячко😊`
);
const container = new ContainerBuilder()
  .setAccentColor([69, 105, 136])
  .addTextDisplayComponents(title, description)
  .addActionRowComponents((actionRow) => actionRow.setComponents(component));

//?
const handleReady = async () => {
  try {
    const channel = await client.channels.fetch(ticketChannel);
    await channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  } catch (error) {
    console.error(error);
  } finally {
    client.destroy();
    process.exit(0);
  }
};
client.once("ready", handleReady);
