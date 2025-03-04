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

class InvitesSystem {
  async addInvite() {}
  async deleteInvite(invite) {
    await Invite.deleteOne({ inviteCode: invite.code });
  }
  async saveInvite(invite) {
    console.log(invite);
    const inviteObj = new Invite({
      inviteCode: invite.code,
      inviterId: invite.inviterId,
      uses: invite.uses,
      savedDate: new Date(),
      usedDate: new Date(),
      expiresAfter: new Date(invite._expiresTimestamp),
    });
    await inviteObj.save();
  }
  async claimInviteXp(inviteCode, uses) {
    const updatedInvite = await Invite.findOneAndUpdate(
      { inviteCode },
      { uses },
      { new: true }
    );
    await addPoints(updatedInvite.inviterId, invite, true);
  }
  async dailyCheckInvites() {
    //? getting all discord invites and iteratin em

    const invites = await main.client.guilds.cache.get(guildId).invites.fetch();
    console.log(invites);
    invites.forEach(async (invite) => {
      //? checkin if inviter is admin
      //? if so, just skipping iteration
      const inviter = await main.client.guilds.cache
        .get(guildId)
        .members.fetch(invite.inviterId);
      if (inviter.roles.cache.some((role) => adminRoles.includes(role.id)))
        return;

      //? checkin if invite saved in DB
      //todo: if saved, we have to check has the invite been used
      //todo: if not saved, we have to define was it already claimed or
      //todo: it is absolately new invite

      const savedInvite = await Invite.findOne({ inviteCode: invite.code });
      if (savedInvite) {
        const monthDate = new Date();
        monthDate.setMonth(new Date().getMonth() + 1);
        console.log(new Date(), monthDate);
        if (invite.uses === 0 || invite.uses < savedInvite.uses) return;
        //? checking if the month already passed
        if (
          new Date().getTime() - new Date(savedInvite.savedDate).getTime() >=
          monthDate.getTime()
        ) {
          console.log("MONTH PASSED");
          await this.claimInviteXp(savedInvite.inviteCode, invite.uses);
        }
        //? so here we have to add XP after 1 month
        // await this.claimInviteXp(savedInvite.inviteCode, invite.uses);
      } else {
        //? there aren't such invite in DB
        if (invite.uses > 0) {
          //? saving and giving XP
          await this.saveInvite(invite);
          // await this.claimInviteXp(invite.code, invite.uses);
        } else {
          //? just creating invite document
          await this.saveInvite(invite);
        }
      }
    });
  }
}
module.exports = new InvitesSystem();
