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
const checkScamPhotos = require("./interactions/messages/scamPhotos.js");
const checkRoleInVc = require("./interactions/voice/checkRoleInVc.js");
const database = require("./database.js");
const Rabbit = require("./rabbit.js");
const fetchInvites = require("./interactions/invites/fetchInvites.js");
const InvitesSystem = require("./interactions/invites/invitesSystem.js");
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
const newVoice = require("./interactions/voice/newVoice.js");
const phishing = require("./interactions/messages/phishing.js");
const checkInvitesEveryDay = require("./interactions/invites/checkInvitesEveryDay.js");
const CustomInteractions = require("./customInteractions/deployCustomInteractions.js");
const emogisDetect = require("./interactions/messages/emojisDetect.js");
const sendExitMessage = require("./utils/sendExitMessage.js");
// імпорт констант
const antiSpam = require("./constants/antiSpam.js");
const { guildId } = require("./constants/config.js");
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

const customInteractions = new CustomInteractions();

config();

client.on("ready", async (op) => {
  database(client);
  Rabbit.connect();
  InvitesSystem.initializeInvites();
});

limitPoints();
sendRatingEveryMonth(client);
checkInvitesEveryDay();
sendStats(client);
startClearDatabaseInterval();
antiSpam.messageCount = new Map();

const TOKEN = process.env.TOKEN;

// взаємодія з юзером

client.on(Events.InviteCreate, async (invite) => {
  InvitesSystem.addInvite(invite);
});

client.on(Events.InviteDelete, async (invite) => {
  InvitesSystem.deleteInvite(invite);
});

client.on("guildMemberAdd", async (person) => {
  // updateInvites(person, client);
  await InvitesSystem.getInviteCodeByUser(person);
  sendVerification(person, client, client.guilds.cache.get(guildId), false);
  await addStats({ date: new Date(), id: person.id, type: "newbies" });
});

client.on("guildMemberRemove", async (person) => {
  await addStats({ date: new Date(), id: person.id, type: "membersLeft" });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    //? menu's and modals handlers
    customInteractions.handlCustomInteractions(interaction, client);
    return;
  }
  addNewMember(interaction);
  getInteractionCommands(interaction, client);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.type === 1) return await handleVerification(message);
  if (message.channel) await addNewMember(false, message);
  if (message.content.toLowerCase() === "бред") message.react("🍞");
  if (message.content.toLowerCase() === "коко") message.react("👻");
  if (message.attachments.size >= 3) {
    const isScam = await checkScamPhotos(message.attachments);
    if (isScam) {
      await message.delete();
      return;
    }
  }
  if (message.attachments.size > 0 && message.content === "") return;
  await accrualPoints(message);
  await addStats({ date: new Date(), id: message.author.id, type: "messages" });
  await useAntispam(message);
  await badWords(message);
  await phishing(message);
  await emogisDetect(message);
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  whenBoost(oldMember, newMember, client);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  await addNewMember(false, false, newState);
  await newVoice(oldState, newState, client);
  // await voiceStateUpdate(oldState, newState, client);
  // await checkRoleInVc(oldState, newState, client);
});

// client.on("messageDelete", async (msg) => {
//   if (msg.channel.type === 1) return;
//   // whenMessageDelete(msg, AuditLogEvent, client);
// });

client.login(TOKEN);

process.on("uncaughtException", async (error) => {
  console.error(error);
  await sendExitMessage(client);
  process.exit(1);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.error(reason);
  await sendExitMessage(client);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await sendExitMessage(client);
  process.exit(0);
});

module.exports.client = client;
