const {
  guildId,
  roles: { adminRoles },
} = require("../../constants/config");
const main = require("../../index");
const Invite = require("../../models/Invite");
const addPoints = require("../../utils/xp/addPoints");
const {
  xps: { invite: inviteXp },
} = require("../../constants/config");
const { Collection } = require("discord.js");
const invites = new Collection();
const SettingsInterface = require("../../utils/settings");

class InvitesSystem {
  async #forceDeleteInvite(code, guildId) {
    invites.get(guildId).delete(code);
    await Invite.deleteOne({ inviteCode: code });
    console.log("forcedelete", code, guildId);
  }
  constructor() {
    this.claimInviteXp = this.claimInviteXp.bind(this);
  }
  async initializeInvites() {
    main.client.guilds.cache.forEach(async (guild) => {
      const fetchedInvites = await guild.invites.fetch();
      const firstInvites = [];
      for (const invite of fetchedInvites.values()) {
        try {
          const inviterMember = await main.client.guilds.cache
            .get(guildId)
            .members.fetch(invite.inviterId);
          console.log(
            invite.code,
            inviterMember.user.username,
            inviterMember.roles.cache.some((role) =>
              adminRoles.includes(role.id)
            )
          );
          if (
            inviterMember.roles.cache.some((role) =>
              adminRoles.includes(role.id)
            )
          )
            continue;
          firstInvites.push(invite);
        } catch (err) {
          console.log("caatch", invite.code);
          continue;
        }
      }
      invites.set(
        guild.id,
        new Collection(firstInvites.map((invite) => [invite.code, invite.uses]))
      );
      setTimeout(() => {
        console.log(invites.get(guild.id));
      }, 10000);
    });
  }
  async addInvite(invite) {
    try {
      //? checking if invitor is admin
      const invitorMember = await main.client.guilds.cache
        .get(guildId)
        .members.fetch(invite.inviterId);
      if (
        invitorMember.roles.cache.some((role) => adminRoles.includes(role.id))
      )
        return;
      invites.get(invite.guild.id).set(invite.code, invite.uses);
      console.log(invites.get(invite.guild.id));
      //? deleting automatically after 45 days
      const endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 45);
      console.log("end", endDate);
      const newInvite = new Invite({
        inviterId: invite.inviterId,
        guests: null,
        uses: invite.uses,
        inviteCode: invite.code,
        savedDate: new Date(),
        expiresAfter: endDate,
      });
      await newInvite.save();
    } catch (err) {
      console.log("Invites error - ", err);
    }
  }
  async deleteInvite(invite) {
    try {
      await this.#forceDeleteInvite(invite.code, invite.guild.id);
      console.log(invites.get(invite.guild.id));
    } catch (err) {
      console.log("Error while deleting invite - ", err);
    }
  }
  async getInviteCodeByUser(member) {
    try {
      const newInvites = await member.guild.invites.fetch();
      const oldInvites = invites.get(member.guild.id);
      const updatedInvite = newInvites.find(
        (i) => i.uses - oldInvites.get(i.code) === 1
      );
      if (!updatedInvite) return;
      const inviter = member.guild.members.cache.get(updatedInvite.inviter.id);
      if (inviter.roles.cache.some((role) => adminRoles.includes(role.id)))
        return;
      const prevInvite = await Invite.findOne({
        inviteCode: updatedInvite.code,
      });
      await Invite.findOneAndUpdate(
        { inviteCode: updatedInvite.code },
        {
          guests:
            prevInvite.guests === null
              ? [{ id: member.id, usedDate: new Date() }]
              : [...prevInvite.guests, { id: member.id, usedDate: new Date() }],
          uses: updatedInvite.uses,
        }
      );
    } catch (err) {
      console.log("Error in invites - ", err);
    }
  }
  async calculateInviteXp(uses) {
    const settings = (await SettingsInterface.getSettings())?.xps;
    let totalXp = settings?.invite || inviteXp;
    if (uses > 1) {
      for (let i = 1; i < uses; i++) {
        totalXp += 100;
      }
    }
    return totalXp;
  }
  async claimInviteXp(inviteCode, validUses, guildId) {
    try {
      if (validUses === 0) return;
      console.log("claimxp", inviteCode);

      // const settings = genSettings.xps;
      const inviteAmount = await this.calculateInviteXp(validUses); //? XP for invite
      // if (validUses > 1) {
      //   for (let i = 0; i < validUses - 1; i++) {
      //     inviteAmount += 25;
      //   }
      // }
      const inviteData = await Invite.findOne({ inviteCode });
      await addPoints(inviteData.inviterId, inviteAmount, true);
      // await Invite.deleteOne({ code: inviteCode });
      await this.#forceDeleteInvite(inviteCode, guildId);
    } catch (err) {
      console.log("Error while claiming invite - ", err);
    }
  }
  async dailyCheckInvites() {
    const allSavedInvites = await Invite.find({});
    const guild = main.client.guilds.cache.get(guildId);
    allSavedInvites.forEach(async (invite) => {
      console.log(invite.inviteCode);
      if (!invite.guests) return;
      console.log("guests passed");
      const firstGuestJoinDate = invite.guests.sort(
        (prevGuest, nextGuest) =>
          new Date(prevGuest.usedDate).getTime() -
          new Date(nextGuest.usedDate).getTime()
      )[0].usedDate;
      console.log("ffff", firstGuestJoinDate);
      console.log(Date.now() - new Date(firstGuestJoinDate).getTime());
      if (
        Date.now() - new Date(firstGuestJoinDate).getTime() <
        1000 * 60 * 60 * 24 * 20
      )
        return;
      let leftGuests = [];
      const validUsesAmount = await invite.guests.reduce(
        async (total, newbieObj) => {
          //? checking if newbie is in the guild
          try {
            const newbie = await guild?.members.fetch(newbieObj.id);
            if (newbie) {
              return total + 1;
            } else {
              //? newbie has left our guild :(
              if (invite.guests.length === 1) {
                await Invite.deleteOne({ inviteCode: invite.code });
              } else {
                leftGuests.push(newbieObj);
              }
              return total;
            }
          } catch (err) {
            if (invite.guests.length === 1) {
              await Invite.deleteOne({ inviteCode: invite.code });
            } else {
              leftGuests.push(newbieObj);
            }
            return total;
          }
        },
        0
      );
      console.log("valid uses - ", validUsesAmount);
      if (leftGuests.length !== 0) {
        const leftGuestsIds = leftGuests.map((leftGuest) => leftGuest.id);
        await Invite.findOneAndUpdate(
          { inviteCode: invite.code },
          {
            guests: invite.guests.filter((g) => !leftGuestsIds.includes(g.id)),
          }
        );
      }
      if (validUsesAmount === 0) return;
      try {
        //? claiming reward
        await this.claimInviteXp(invite.inviteCode, validUsesAmount, guild.id);
      } catch (err) {
        console.log(err);
      }
    });
  }
}
module.exports = new InvitesSystem();