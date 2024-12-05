const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
  badwords: {
    enabled: { type: Boolean, default: true },
    words: [String],
    exceptions: [String],
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
