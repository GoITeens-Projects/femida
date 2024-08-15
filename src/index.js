const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  Collection,
  AuditLogEvent,
} = require("discord.js");
const { config } = require("dotenv");
const path = require("node:path");
const fs = require("node:fs");

// імпорти функцій
const addNewMember = require("./interactions/addNewMember.js");
const accrualPoints = require("./interactions/messages/messages.js");
const badWords = require("./interactions/messages/badWords.js");
const checkRoleInVc = require("./interactions/voice/checkRoleInVc.js");
const database = require("./database.js");
const fetchInvites = require("./interactions/invites/fetchInvites.js");
const getInteractionCommands = require("./interactions/getInteractionCommands.js");
const limitPoints = require("./interactions/limitPoints.js");
const sendRatingEveryMonth = require("./interactions/sendRatingEveryMonth.js");
const startClearDatabaseInterval = require("./interactions/startClearDatabase.js");
const updateInvites = require("./interactions/invites/updateInvites.js");
const useAntispam = require("./interactions/messages/useAntispam.js");
const voiceStateUpdate = require("./interactions/voice/voiceStateUpdate.js");
const whenBoost = require("./interactions/whenBoost.js");
const whenMessageDelete = require("./interactions/messages/whenMessageDelete.js");
const handleVerification = require("./interactions/verification/handleVerification.js");
const sendVerification = require("./interactions/verification/sendVerification.js");
const addStats = require("./interactions/statistics/addStats.js");
const sendStats = require("./interactions/statistics/sendStats.js");

// імпорт констант
const antiSpam = require("./constants/antiSpam.js");
// ініціалізація клієнту

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

// зчитування папок із слеш функціями

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

config();

client.on("ready", async (op) => {
  database(client);
  fetchInvites(op, client);
});

limitPoints();
sendRatingEveryMonth(client);
sendStats(client);
startClearDatabaseInterval();
antiSpam.messageCount = new Map();

const TOKEN = process.env.TOKEN;

// взаємодія з юзером

client.on("guildMemberAdd", async (person) => {
  updateInvites(person, client);
  sendVerification(
    person,
    client,
    client.guilds.cache.get("1192065857363394621"),
    false
  );
  await addStats({ date: new Date(), id: person.id, type: "newbies" });
});

client.on("guildMemberRemove", async (person) => {
  await addStats({ date: new Date(), id: person.id, type: "membersLeft" });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  addNewMember(interaction);
  getInteractionCommands(interaction, client);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.type === 1) return await handleVerification(message);
  if (message.channel) await addNewMember(false, message);
  if (message.content === "бред") message.react("🍞");
  if (message.attachments.size > 0 && message.content === "") return;
  await accrualPoints(message);
  await addStats({ date: new Date(), id: message.author.id, type: "messages" });
  await useAntispam(message);
  await badWords(message);
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  whenBoost(oldMember, newMember, client);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  await addNewMember(false, false, newState);
  await voiceStateUpdate(oldState, newState, client);
  await checkRoleInVc(oldState, newState, client);
});

client.on("messageDelete", async (msg) => {
  if (msg.channel.type === 1) return;
  whenMessageDelete(msg, AuditLogEvent, client);
});

client.login(TOKEN);

module.exports.client = client;
