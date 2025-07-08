const { ButtonBuilder } = require("@discordjs/builders");
const { ButtonStyle } = require("discord.js");
const {
  ChannelType,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const {
  roles: { adminRoles },
} = require("../../constants/config");
const Ticket = require("../../models/Ticket");
const { component } = require("../preCloseTicketBtn/preCloseTicketBtn");

const adminPermissions = adminRoles.map((roleId) => ({
  id: roleId,
  allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
}));

const createTicketBtn = new ButtonBuilder()
  .setCustomId("create-ticket-btn")
  .setLabel("Створити тікет📩")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(false);

module.exports = {
  component: createTicketBtn,
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const ticket = new Ticket({
      openerId: interaction.user.id,
    });
    await ticket.save();

    const title = new TextDisplayBuilder().setContent(
      `## Тікет № ${ticket.ticketNumber} оголошую відкритим!`
    );
    const description = new TextDisplayBuilder().setContent(
      `Адміністрація може не одразу відповісти на твій запит, тож будь чемним \n Тікет створив: <@${interaction.user.id}>`
    );
    const container = new ContainerBuilder()
      .setAccentColor([69, 105, 136])
      .addTextDisplayComponents(title, description)
      .addActionRowComponents((actionRow) =>
        actionRow.setComponents(component)
      );

    const channel = await interaction.guild.channels.create({
      name: `ticket-${ticket.ticketNumber}`,
      //   name: ticket.name,
      parent: null,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
        ...adminPermissions,
      ],
    });
    await Ticket.findByIdAndUpdate(ticket._id, { channel: { id: channel.id } });
    channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
    await interaction.editReply({
      content: `Тікет створено! Тобі до <#${channel.id}>`,
    });
    setTimeout(async () => {
      await interaction.deleteReply();
    }, 10000);
  },
};
