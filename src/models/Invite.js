const mongoose = require("mongoose");

const InviteSchema = new mongoose.Schema({
  inviterId: {
    type: String,
    required: true,
    unique: false,
  },
  newbieId: {
    type: String,
    required: true,
    unique: false,
  },
  isNewbieJoined: {
    type: Boolean,
    required: true,
  },
  
  inviteCode: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAfter: {
    type: Date,
    reuired: true,
    unique: false,
  },
});
module.exports =
  mongoose.model.Invites || mongoose.model("Invites", InviteSchema);
