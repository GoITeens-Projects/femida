const {
  SlashCommandBuilder,
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
const Counter = require("../../models/Counter");

const adminPermissions = adminRoles.map((roleId) => ({
  id: roleId,
  allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
}));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create-ticket")
    .setDescription("Створити тікет (запит до адміністрації)")
    .setContexts(0),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const hour = Number(
      new Date().toLocaleString("uk-UA", {
        timeZone: "Europe/Kyiv",
        hour: "2-digit",
        hourCycle: "h23",
      })
    );
    if (hour >= 21 || hour <= 7) {
      let text = "";
      switch (true) {
        case hour >= 21 || hour < 4:
          text =
            "Вибач, вже дуже піздно. Певно, адміни сплять, тому я не відкрию тікет(( \nПиши завтра, обов'язково розглянемо твоє питаннячко";
          break;
        case hour <= 7 && hour >= 4:
          text =
            "Вибач, ще дуже рання година. Певно, адміни ще не прокинулись, тому я не відкрию тікет, щоб не псувати їм ранок☕";
          break;
      }
      await interaction.editReply({ content: text });
      return;
    }
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
      .addTextDisplayComponents(title, description);

    const channel = await interaction.guild.channels.create({
      name: `ticket-${ticket.ticketNumber}`,
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
    // await Ticket.findByIdAndUpdate(ticket._id, { channel: { id: channel.id } });
    channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
    await interaction.editReply({
      content: `Тікет створено! Тобі до <#${channel.id}>`,
    });
  },
};
