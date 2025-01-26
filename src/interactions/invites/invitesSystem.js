const {
  guildId,
  roles: { adminRoles },
} = require("../../constants/config");
const main = require("../../index");
const Invite = require("../../models/Invite");

class InvitesSystem {
  async addInvite() {}
  async deleteInvite() {}
  async dailyCheckInvites() {
    const invites = await main.client.guilds.cache.get(guildId).invites.fetch();
    invites.forEach(async (invite) => {
      const inviter = await main.client.guilds.cache
        .get(guildId)
        .members.fetch(invite.inviterId);
      if (inviter.roles.cache.some((role) => adminRoles.includes(role.id)))
        return;
      const savedInvite = await Invite.findOne({ code: invite.code });
      if (savedInvite) {
        if (invite.uses !== savedInvite.uses) {
          await Invite.findOneAndUpdate(
            { code: invite.code },
            { uses: invite.uses }
          );
        }
        if (invite.uses === 0) return;
        
      } else {
        const inviteObj = {
          code: invite.code,
          inviterId: invite.inviterId,
          uses: invite.uses,
          savedTimestamp: new Date(),
          expiresAfter: new Date(invite._expiresTimestamp),
        };
        await Invite.createOne(inviteObj);
      }
    });
  }
}
module.exports = new InvitesSystem();
