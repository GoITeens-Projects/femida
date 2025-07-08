const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle, PermissionFlagsBits } = require("discord.js");
const fetchAllMessages = require("../../utils/fetchAllMessages");
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
  constructor(emoji, url, index) {
    this.emoji = emoji;
    this.url = url;
    this.index = index;
  }
}

class MessageMention {
  constructor(type, id, mention, index) {
    this.type = type;
    this.id = id;
    this.mention = mention;
    this.index = index;
  }
}

class MessageReaction {
  constructor(emoji, users) {
    this.emoji = emoji;
    this.users = users;
  }
}

// class Message {
//   constructor(
//     { content, author: { id: authorId }, createdTimestamp, isForwarded },
//     attachments,
//     customEmojis,
//     mentions,
//     reactions
//   ) {
//     this.content = content;
//     this.isForwarded = isForwarded;
//     this.author = {
//       id: authorId,
//     };
//     this.createdAtTimestamp = createdTimestamp;
//     this.attachments = attachments;
//     this.customEmojis = customEmojis;
//     this.mentions = mentions;
//     this.reactions = reactions;
//   }
// }

class Message {
  checkAndRewriteForwardedMsg(msg) {
    if (
      msg.content === "" &&
      msg.attachments.size === 0 &&
      msg.messageSnapshots
    ) {
      //? checking if message is forwaded
      this.isForwarded = true;
      const referenceMessage = msg.messageSnapshots.get(
        msg.reference.messageId
      );
      this.content = referenceMessage.content;
      const refAttachments = [];
      if (referenceMessage.attachments.size !== 0) {
        //? adding attachments from forwarded message
        referenceMessage.attachments
          .filter((a) => allowedTypes.includes(a.contentType))
          .forEach((a) => {
            refAttachments.push(new ShortAttachment(a));
          });
        this.attachments = refAttachments;
      }
    }
  }
  extractAttachments(msg) {
    const attachments = [];
    if (msg.attachments.size !== 0) {
      msg.attachments
        .filter((a) => allowedTypes.includes(a.contentType))
        .forEach((a) => {
          attachments.push(new ShortAttachment(a));
        });
    }
    return attachments;
  }
  extractReactions(msg) {
    let reactions = [];
    if (msg.reactions.cache.size !== 0) {
      //? adding reactions to message
      reactions = Array.from(msg.reactions.cache.values()).reduce(
        async (accPromise, reaction) => {
          const acc = await accPromise;
          const users = Array.from(
            (await reaction.users.fetch()).values()
          ).filter((user) => !user.bot);
          if (users.length === 0) return acc;
          acc.push(
            new MessageReaction(
              reaction.emoji.id
                ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png`
                : reaction.emoji.name,
              users.map(({ id }) => id)
            )
          );
          return acc;
        },
        Promise.resolve([])
      );
    }
    return reactions;
  }
  constructor(msg) {
    this.content = msg.content;
    this.author = { id: msg.author.id };
    this.isForwarded = false;
    this.createdAtTimestamp = msg.createdTimestamp;
    this.attachments = this.extractAttachments(msg);
    this.customEmojis = extractCustomEmojis(this.content);
    this.mentions = extractMentions(this.content);
    this.reactions = this.extractReactions(msg);
    this.checkAndRewriteForwardedMsg(msg);
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
    results.push(
      new MessageCustomEmoji(
        fullMatch,
        `https://cdn.discordapp.com/emojis/${emojiId}`,
        startIndex
      )
    );
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
      results.push(new MessageMention(type, match[1], match[0], match.index));
    }
  }
  return results;
}

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

    let filteredMessages = (await fetchAllMessages(interaction.channel))
      .filter((msg) => !msg.author.bot)
      .reduce((acc, msg) => {
        // let attachments = [];
        // if (msg.attachments.size !== 0) {
        //   msg.attachments
        //     .filter((a) => allowedTypes.includes(a.contentType))
        //     .forEach((a) => {
        //       attachments.push(new ShortAttachment(a));
        //     });
        // }
        // msg.isForwarded = false;
        // if (
        //   msg.content === "" &&
        //   msg.attachments.size === 0 &&
        //   msg.messageSnapshots
        // ) {
        //   //? checking if message is forwaded
        //   msg.isForwarded = true;
        //   const referenceMessage = msg.messageSnapshots.get(
        //     msg.reference.messageId
        //   );
        //   msg.content = referenceMessage.content;
        //   const refAttachments = [];
        //   if (referenceMessage.attachments.size !== 0) {
        //     //? adding attachments from forwarded message
        //     referenceMessage.attachments
        //       .filter((a) => allowedTypes.includes(a.contentType))
        //       .forEach((a) => {
        //         refAttachments.push(new ShortAttachment(a));
        //       });
        //     attachments = refAttachments;
        //   }
        // }
        // let reactions = [];
        // if (msg.reactions.cache.size !== 0) {
        //   //? adding reactions to message
        //   reactions = Array.from(msg.reactions.cache.values()).reduce(
        //     async (accPromise, reaction) => {
        //       const acc = await accPromise;
        //       const users = Array.from(
        //         (await reaction.users.fetch()).values()
        //       ).filter((user) => !user.bot);
        //       if (users.length === 0) return acc;
        //       acc.push(
        //         new MessageReaction(
        //           reaction.emoji.id
        //             ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png`
        //             : reaction.emoji.name,
        //           users.map(({ id }) => id)
        //         )
        //       );
        //       return acc;
        //     },
        //     Promise.resolve([])
        //   );
        // }
        // acc.push(
        //   new Message(
        //     msg,
        //     attachments,
        //     extractCustomEmojis(msg.content),
        //     extractMentions(msg.content),
        //     reactions
        //   )
        // );
        //! ahtung

        acc.push(new Message(msg));
        return acc;
      }, []);

    //? resolving reactions
    filteredMessages = await Promise.all(
      filteredMessages.map(async (msg) => {
        if (msg.reactions.length === 0) return msg;
        msg.reactions = await Promise.resolve(msg.reactions);
        return msg;
      })
    );

    console.dir(filteredMessages, { depth: null });
    const savedTicket = await Ticket.findOne({
      channel: { id: interaction.channel.id },
    });
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
        const id = setInterval(async () => {
          if (count - 1 === 0) {
            await interaction.channel.delete();
            await Ticket.findByIdAndDelete(savedTicket._id);
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
