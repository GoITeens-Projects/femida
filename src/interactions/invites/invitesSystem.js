const {
  guildId,
  roles: { adminRoles },
} = require("../../constants/config");
const main = require("../../index");
const Invite = require("../../models/Invite");
const addPoints = require("../../utils/xp/addPoints");
const {
  xps: { invite },
} = require("../../constants/config");
const { Collection } = require("discord.js");
const invites = new Collection();

class InvitesSystem {
  constructor() {
    this.claimInviteXp = this.claimInviteXp.bind(this);
  }
  initializeInvites() {
    main.client.guilds.cache.forEach(async (guild) => {
      const firstInvites = await guild.invites.fetch();
      invites.set(
        guild.id,
        new Collection(firstInvites.map((invite) => [invite.code, invite.uses]))
      );
    });
  }
  async addInvite(invite) {
    invites.get(invite.guild.id).set(invite.code, invite.uses);
    try {
      //? checking if invitor is admin
      const invitorMember = await main.client.guilds.cache
        .get(guildId)
        .members.fetch(invite.inviterId);
      if (
        invitorMember.roles.cache.some((role) => adminRoles.includes(role.id))
      )
        return;

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
      invites.get(invite.guild.id).delete(invite.code);
      await Invite.deleteOne({ inviteCode: invite.code });
    } catch (err) {
      console.log("Error while deleting invite - ", err);
    }
  }
  async getInviteCodeByUser(member) {
    try {
      const newInvites = await member.guild.invites.fetch();
      const oldInvites = invites.get(member.guild.id);
      const updatedInvite = newInvites.find(
        (i) => i.uses > oldInvites.get(i.code)
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
  calculateInviteXp(uses) {
    let totalXp = invite;
    if (Number(uses) > 1) {
      for (let i = 0; i <= uses; i++) {
        totalXp += 100;
      }
    } else {
      return totalXp;
    }
  }
  async claimInviteXp(inviteCode, validUses) {
    try {
      if (validUses === 0) return;
      const inviteData = await Invite.findOne({ code: inviteCode });
      await addPoints(inviteData.inviterId, invite, true);
      await Invite.deleteOne({ code: inviteCode });
    } catch (err) {
      console.log("Error while claiming invite - ", err);
    }
  }
  async dailyCheckInvites() {
    const allSavedInvites = await Invite.find({});
    const guild = main.client.guilds.cache.get(guildId);
    allSavedInvites.forEach(async (invite) => {
      if (!invite.guests) return;
      let leftGuests = [];
      const validUsesAmount = await invite.guests.reduce(
        async (total, newbieObj) => {
          //? checking date valid
          // const diffMs = Date.now() - new Date(newbieObj.usedDate).getTime();
          // const targetDate = new Date(newbieObj.usedDate);
          // targetDate.setUTCMonth(targetDate.getUTCMonth() + 1);
          // const targetDateDiff =
          //   targetDate.getTime() - new Date(newbieObj.usedDate).getTime();
          // if (diffMs < targetDateDiff) return total;
          //? checking if newbie is on server
          try {
            const newbie = await guild?.members.fetch(newbieObj.id);
            if (newbie) {
              return total + 1;
            } else {
              //? newbie has left our server :(
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
        await invite.update({
          guests: invite.guests.filter((g) => !leftGuestsIds.includes(g.id)),
        });
      }
      if (validUsesAmount === 0) return;
      //? checking dates and terms
      // if (!invite.usedDates) return;
      // const diffMs = Date.now - new Date(invite.usedDate).getUTCMilliseconds();
      // const targetDate = new Date(invite.usedDate);
      // targetDate.setUTCMonth(targetDate.getUTCMonth() + 1);
      // const targetDateDiff =
      //   targetDate.getUTCMilliseconds() -
      //   new Date(invite.usedDate).getUTCMilliseconds();
      // if (diffMs < targetDateDiff) return;
      // //? checking if new user is still on server
      // const newbie = await guild?.members.fetch(invite.guestId);
      // if (!newbie) {
      //   //* invite is alright but new user has left the server
      //   await Invite.deleteOne({ code: invite.inviteCode });
      //   return;
      // }
      //? claiming reward and deleting invite from DB
      this.claimInviteXp(invite.code, validUsesAmount);
    });
  }
}
module.exports = new InvitesSystem();
