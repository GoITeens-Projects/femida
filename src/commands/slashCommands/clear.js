const { SlashCommandBuilder } = require("discord.js");
const MESSAGES_API_LIMIT = 100;
const PENALTY_POINTS_LIMIT = 1;
const maxDays = 14 * 24 * 60 * 60 * 1000;

async function fetchAllMessages(channel, amount, targetUserId) {
  let messages = [];
  let messagesLeft = amount;
  let penaltyPoints = 0;
  let lastId;
  while (messagesLeft > 0 || penaltyPoints < PENALTY_POINTS_LIMIT) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const fetched = (await channel.messages.fetch(options))
      .filter((msg) => msg.author.id === targetUserId)
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
      .first(messagesLeft);
    if (fetched.size === 0) {
      penaltyPoints++;
      continue;
    }
    console.log("CYCKE");
    messagesLeft -= fetched.length;
    messages = messages.concat(Array.from(fetched.values()));
    lastId = fetched[fetched.length - 1]?.id;
    if (messagesLeft <= 0) break;
  }
  return messages;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Трохи прибратись в чаті")
    .setContexts(0)
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Кількість повідомлень, яку треба видалити")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Користувач, повідомлення якого треба видалити")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({});
    const amount = interaction.options.get("amount")?.value;
    const userId = interaction.options.get("user")?.value;
    const reply = async (content) => {
      await interaction
        .editReply({
          content,
          ephemeral: true,
        })
        .then(() => {
          setTimeout(async () => {
            await interaction.deleteReply();
          }, 10000);
        });
    };
    const deleteMessages = async (msgs) => {
      for (const msg of msgs) {
        try {
          await msg.delete();
        } catch (err) {
          console.log("Cannot clear message - ", err);
        }
        await new Promise((res) =>
          setTimeout(res, Math.ceil(Math.random() * (1000 - 75) + 75))
        );
      }
    };
    let messagesToDelete = amount;
    if (userId) {
      const recentMsgs = (
        await interaction.channel.messages.fetch({
          limit: amount,
        })
      )
        .filter((msg) => Date.now() - msg.createdTimestamp < maxDays)
        .filter((msg) => msg.author.id === userId);
      const deletedMessages = await interaction.channel.bulkDelete(recentMsgs);
      //   console.log("del", deletedMessages);
      // deletedMessages.forEach((m) => console.log(m.content));

      if (deletedMessages.size < amount) {
        messagesToDelete -= amount - deletedMessages.size;
        const msgs = await fetchAllMessages(
          interaction.channel,
          messagesToDelete,
          userId
        );
        console.log("msgs", msgs);
        await deleteMessages(msgs);
      }
      await reply(`${amount} повідомлення було видалено від <@${userId}>`);
    } else {
      //? сперва нужно пробовать балк делит
      //? после проверять amount === deletedMsgs.size
      //? Если да, то всё, дело сделано
      //? Если нет, то идем глубже

      const recentMsgs = (
        await interaction.channel.messages.fetch({
          limit: amount,
        })
      ).filter((msg) => Date.now() - msg.createdTimestamp < maxDays);
      const deletedMessages = await interaction.channel.bulkDelete(recentMsgs);
      if (deletedMessages.size < amount) {
        messagesToDelete -= amount - deletedMessages.size;

        //? значит есть сообщения старше 14 дней
        //? юзаем тяжелую артиллерию
        const msgs = await fetchAllMessages(
          interaction.channel,
          messagesToDelete
        );
        await deleteMessages(msgs);
      }
      await reply(`${deletedMessages.size} повідомлення було видалено`);
    }
  },
};
