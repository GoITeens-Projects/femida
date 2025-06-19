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
  "video/mp4",
  "video/quicktime",
];

class ShortAttachment {
  constructor({ id, url }) {
    this.id = id;
    this.url = url;
  }
}

class Message {
  constructor(
    { content, author: { id: authorId }, createdTimestamp },
    attachments
  ) {
    this.content = content;
    this.author = {
      id: authorId,
    };
    this.createdAtTimestamp = createdTimestamp;
    this.attachments = attachments;
  }
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

        acc.push(new Message(msg, attachments));
        return acc;
      }, []);
    const savedTicket = await Ticket.findOne({
      channel: { id: interaction.channel.id },
    });
    const body = {
      chat: filteredMessages,
      openerId: savedTicket.openerId,
      ticketNumber: savedTicket.ticketNumber,
      createdAt: savedTicket.createdAt,
    };
    const resp = await fetch("http://localhost:5000/tickets", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: `Bearer ${process.env.FEMIDA_API_TOKEN}`,
      },
    });
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
          { id: interaction.user.id, deny: [PermissionFlagsBits.ViewChannel] },
        ],
      });
      interaction.editReply("Сталася помилка архівації тікету⚠️");
    }
  },
};
