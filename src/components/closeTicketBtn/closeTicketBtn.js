const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle, PermissionFlagsBits } = require("discord.js");
const Ticket = require("../../models/Ticket");

const closeTicketBtn = new ButtonBuilder()
  .setCustomId("close-ticket-btn")
  .setLabel("Закрити")
  .setStyle(ButtonStyle.Danger)
  .setDisabled(false);

const allowedTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  "video/mp4",
  "video/quicktime",
];

class ShortAttachment {
  constructor({ id, url }) {
    this.id = id;
    this.url = url;
  }
}

class MessageCustomEmoji {
  constructor({ id, index }) {
    this.id = id;
    this.index = index;
  }
}

class MessageReactions {
  constructor(emoji, users) {
    this.emoji = emoji;
    this.users = users;
  }
}

class Message {
  constructor(
    { content, author: { id: authorId }, createdTimestamp, isForwarded },
    attachments,
    customEmojis,
    mentions
  ) {
    this.content = content;
    this.isForwarded = isForwarded;
    this.author = {
      id: authorId,
    };
    this.createdAtTimestamp = createdTimestamp;
    this.attachments = attachments;
    this.customEmojis = customEmojis;
    this.mentions = mentions;
  }
}

function extractCustomEmojis(msg) {
  const customEmojiRegex = /<a?:\w+:(\d+)>/g;
  const results = [];
  let match;
  while ((match = customEmojiRegex.exec(msg)) !== null) {
    const fullMatch = match[0];
    const emojiId = match[1];
    const startIndex = match.index;
    results.push({
      emoji: fullMatch,
      url: `https://cdn.discordapp.com/emojis/${emojiId}`,
      index: startIndex,
    });
  }
  return results;
}

function extractMentions(content) {
  const results = [];
  const patterns = {
    user: /<@!?(\d+)>/g,
    role: /<@&(\d+)>/g,
    channel: /<#(\d+)>/g,
  };

  for (const [type, regex] of Object.entries(patterns)) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      results.push({
        type,
        id: match[1],
        mention: match[0],
        index: match.index,
      });
    }
  }

  return results;
}

// function getReactionsArray(msg) {
//   return Promise.all(
//     Array.from(msg.reactions.cache.values()).map(async (reaction) => {
//       const users = Array.from((await reaction.users.fetch()).values()).filter(
//         (user) => !user.bot
//       );

//       if (users.length === 0) return null;

//       return new MessageReactions(
//         reaction.emoji.id
//           ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}`
//           : reaction.emoji.name,
//         users.map(({ id }) => id)
//       );
//     })
//   ).then((results) => results.filter(Boolean)); // Removes nulls
// }

module.exports = {
  component: closeTicketBtn,
  async execute(interaction) {
    if (!interaction.channel.name.startsWith("ticket")) return;
    interaction.reply({ content: "Обробка..." });
    interaction.channel.edit({
      permissionOverwrites: [
        { id: interaction.user.id, deny: [PermissionFlagsBits.SendMessages] },
      ],
    });

    const filteredMessages = (await interaction.channel.messages.fetch())
      .filter((msg) => !msg.author.bot)
      .reduce((acc, msg) => {
        let attachments = [];
        if (msg.attachments.size !== 0) {
          msg.attachments
            .filter((a) => allowedTypes.includes(a.contentType))
            .forEach((a) => {
              attachments.push(new ShortAttachment(a));
            });
        }
        msg.isForwarded = false;
        if (
          msg.content === "" &&
          msg.attachments.size === 0 &&
          msg.messageSnapshots
        ) {
          msg.isForwarded = true;
          const referenceMessage = msg.messageSnapshots.get(
            msg.reference.messageId
          );
          msg.content = referenceMessage.content;
          const attachments = [];
          if (referenceMessage.attachments.size !== 0) {
            referenceMessage.attachments
              .filter((a) => allowedTypes.includes(a.contentType))
              .forEach((a) => {
                attachments.push(new ShortAttachment(a));
              });
            msg.attachments = attachments;
          }
        }
        let reactions = [];
        if (msg.reactions.cache.size !== 0) {
          // reactions = Array.from(msg.reactions.cache.values()).reduce(
          //   async (accPromise, reaction) => {
          //     const acc = await accPromise;
          //     const users = Array.from(
          //       (await reaction.users.fetch()).values()
          //     ).filter((user) => !user.bot);
          //     if (users.length === 0) return acc;
          //     acc.push(
          //       new MessageReactions(
          //         reaction.emoji.id
          //           ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png`
          //           : reaction.emoji.name,
          //         users.map(({ id }) => id)
          //       )
          //     );
          //     return acc;
          //   },
          //   Promise.resolve([])
          // );
        }
        acc.push(
          new Message(
            msg,
            attachments,
            extractCustomEmojis(msg.content),
            extractMentions(msg.content)
          )
        );
        return acc;
      }, []);

    console.dir(filteredMessages, { depth: null });
    const savedTicket = await Ticket.findOne({
      channel: { id: interaction.channel.id },
    });
    // filteredMessages.forEach((msg) => {
    //   console.log(msg);
    //   console.log("MENTINS _", msg.mentions);
    // });
    const body = {
      chat: filteredMessages,
      openerId: savedTicket.openerId,
      ticketNumber: savedTicket.ticketNumber,
      createdAt: savedTicket.createdAt,
    };
    try {
      const resp = await fetch("http://localhost:5000/tickets", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${process.env.FEMIDA_API_TOKEN}`,
        },
      });
      console.log(resp);
      if (Number(resp.status) === 201) {
        //? Deleting
        let count = 5;
        interaction.editReply({
          content: `Цей тікет видалиться через ${count} сек.`,
        });
        const id = setInterval(() => {
          if (count - 1 === 0) {
            interaction.channel.delete();
            return clearInterval(id);
          }
          count--;
          interaction.editReply({
            content: `Цей тікет видалиться через ${count} сек.`,
          });
        }, 1000);
      } else {
        //? Closing for user but writing about error
        interaction.channel.edit({
          name: `closed-${interaction.channel.name.replace("ticket-", "")}`,
          permissionOverwrites: [
            {
              id: interaction.user.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
          ],
        });
        interaction.editReply("Сталася помилка архівації тікету⚠️");
      }
    } catch (e) {
      console.log(e);
      //? Closing for user but writing about error
      interaction.channel.edit({
        name: `closed-${interaction.channel.name.replace("ticket-", "")}`,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });
      interaction.editReply("Сталася помилка архівації тікету⚠️");
    }
  },
};
