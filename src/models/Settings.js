const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
  badwords: {
    enabled: { type: Boolean, default: true },
    words: [String],
    exceptions: [String],
    actions: {
      giveWarn: { type: Boolean, default: true },
      mute: {
        enabled: { type: Boolean, default: true },
        muteTimeMs: {
          type: Number,
          default: 1000 * 60 * 60,
        },
      },
      deleteMsg: { type: Boolean, default: true },
      ignoreAdmins: { type: Boolean, default: true },
      notifyUser: { type: Boolean, default: true },
    },
  },
  spam: {
    enabled: { type: Boolean, default: true },
  },
  scamLinks: {
    enabled: { type: Boolean, default: true },
    exceptions: [String],
  },
  invitations: {
    enabled: { type: Boolean, default: true },
    exceptions: [String],
  },
});
module.exports =
  mongoose.model.Settings || mongoose.model("Settings", SettingSchema);
