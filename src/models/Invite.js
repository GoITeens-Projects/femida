const mongoose = require("mongoose");

const InviteSchema = new mongoose.Schema({
  inviterId: {
    type: String,
    required: true,
    unique: false,
  },
  uses: {
    type: Number,
    required: true,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
  },
  savedDate: {
    type: Date,
    required: true,
  },
  usedDate: {
    type: Date,
    required: true,
  },
  expiresAfter: {
    type: Date,
    required: true,
    unique: false,
  },
});
module.exports =
  mongoose.model.Invites || mongoose.model("Invites", InviteSchema);
