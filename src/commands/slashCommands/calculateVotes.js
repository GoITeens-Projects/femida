const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const {
  calculateVotes,
  roles: { adminRoles, studentRole },
} = require("../../constants/config");

class UserReactionDto {
  id;
  isFiltered;
  constructor(id, isFiltered) {
    this.id = id;
    this.isFiltered = isFiltered;
  }
}

function getMentionIds(message) {
  return message.mentions?.users.map((user) => user.id);
}

function getEmojis(sortedArr) {
  const placesEmojis = ["🥇", "🥈", "🥉"];
  const newArr = new Set();
  for (const entry of sortedArr) {
    if (newArr >= 3) break;
    newArr.add(entry[1]);
  }
  return {
    topPositions: Array.from(newArr.values()),
    getEmoji(votes) {
      if (votes < this.topPositions[this.topPositions.length - 1]) return null;
      const idx = this.topPositions.findIndex((val) => val === votes);
      return idx === -1 ? null : placesEmojis[idx];
    },
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("calculate-votes")
    .setDescription("Порахувати кількість голосів в даному каналі")
    .setContexts(0),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const hasAllowedRole = member.roles.cache.some((role) =>
      adminRoles.includes(role.id),
    );
    if (!hasAllowedRole) {
      await interaction.editReply({
        content: "Що ти там рахувати збираєшся? Ти навіть не адмін😉",
      });
      return;
    }

    const votePositions = (
      await interaction.channel.messages.fetch({
        limit: 100,
      })
    )
      .filter((msg) => msg.content.includes(calculateVotes.voteTag))
      .reverse();

    if (votePositions.size === 0) {
      await interaction.editReply({
        content: `В цьому каналі я не знайшла позицій голосування😥\nЇх треба помічати ось так: \`${calculateVotes.voteTag}\` `,
      });
      return;
    }

    //? If every message contains user's mention so we can
    //? show a result as a key-value where key is a username and value is a quantity of votes
    //* if not, it'll be the same but a key is the whole message itself
    let isMentionsPresent = false;
    if (votePositions.every((msg) => /<@\d+>/.test(msg))) {
      isMentionsPresent = true;
    }

    const resultMap = await votePositions.reduce(async (accPromise, msg) => {
      const acc = await accPromise;
      if (msg.reactions.cache.size === 0) {
        acc.set(
          isMentionsPresent ? getMentionIds(msg).join(", ") : msg.content,
          0,
        );
        return acc;
      }
      await Promise.all(
        msg.reactions.cache.map(async (reaction) => {
          const fetchedReaction = await reaction.fetch();
          const filteredUsers = (await fetchedReaction.users.fetch()).filter(
            (user) => {
              const member = interaction.guild.members.cache.get(user.id);
              if (!member) return false;
              if (
                member.roles.cache.some((role) => adminRoles.includes(role.id))
              )
                return false;
              if (
                (msg.createdTimestamp - member.joinedTimestamp <
                  calculateVotes.minJoinedTimestamp ||
                  member.user.createdTimestamp <
                    calculateVotes.minUserCreatedTimestamp) &&
                !member.roles.cache.some((role) => role.id === studentRole)
              )
                return false;
              return true;
            },
          );

          acc.set(
            isMentionsPresent
              ? getMentionIds(msg).join(", ")
              : msg.content.replace(calculateVotes.voteTag, "").trim(),
            filteredUsers.size,
          );
        }),
      );

      return acc;
    }, Promise.resolve(new Map()));

    const sortedResult = Array.from(resultMap.entries()).sort(
      (prevEntry, nextEntry) => {
        return nextEntry[1] - prevEntry[1];
      },
    );
    const emojisRes = getEmojis(sortedResult);

    interaction.user.send(
      `Ось підраховані результати голосування (<#${interaction.channel.id}>):\n` +
        sortedResult.reduce((acc, entry) => {
          return (acc += `${isMentionsPresent ? `<@${entry[0]}>` : entry[0]} - ${entry[1]} голосів${
            emojisRes.getEmoji(entry[1]) ?? ""
          } \n`);
        }, ""),
    );
    await interaction.editReply({ content: "Відповіла в особисті😉" });

    const resultLogsMap = await votePositions.reduce(
      async (accPromise, msg) => {
        const acc = await accPromise;
        if (msg.reactions.cache.size === 0) {
          acc.set(
            isMentionsPresent ? getMentionIds(msg).join(", ") : msg.content,
            0,
          );
          return acc;
        }
        await Promise.all(
          msg.reactions.cache.map(async (reaction) => {
            const fetchedReaction = await reaction.fetch();
            const filteredUsers = (await fetchedReaction.users.fetch()).map(
              (user) => {
                const member = interaction.guild.members.cache.get(user.id);
                const isFiltered = false;
                if (!member) isFiltered = true;
                if (
                  member.roles.cache.some((role) =>
                    adminRoles.includes(role.id),
                  )
                )
                  isFiltered = true;
                if (
                  (msg.createdTimestamp - member.joinedTimestamp <
                    calculateVotes.minJoinedTimestamp ||
                    member.user.createdTimestamp <
                      calculateVotes.minUserCreatedTimestamp) &&
                  !member.roles.cache.some((role) => role.id === studentRole)
                ) 
                  isFiltered = true;

                return new UserReactionDto(member.id, isFiltered);
              },
            );

            acc.set(
              isMentionsPresent
                ? getMentionIds(msg).join(", ")
                : msg.content.replace(calculateVotes.voteTag, "").trim(),
              filteredUsers,
            );
          }),
        );

        return acc;
      },
      Promise.resolve(new Map()),
    );
    console.log("map", resultLogsMap.entries());
    resultLogsMap.entries().forEach(([key, value]) => {
      let msgString = `учасник ${key}\n`;
      console.log(typeof value);
      if (!(typeof value === "number")) {
        value.forEach((user) => {
          msgString += `<@${user.id}> - ${user.isFiltered ? "не зараховано" : "зараховано"}`;
        });
      } else {
        msgString += "0 голосів";
      }
      interaction.user.send(msgString);
    });
  },
};
