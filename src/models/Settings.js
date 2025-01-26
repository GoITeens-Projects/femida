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
      notifyUser: {
        enabled: { type: Boolean, default: true },
        messageFn: { type: String, default: "" },
        deleteTimeoutMs: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  spam: {
    enabled: { type: Boolean, default: true },
    messagesLimit: { type: Number, default: 3 },
    resetCounter: { type: Boolean, default: true },
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
      notifyUser: {
        enabled: { type: Boolean, default: true },
        messageFn: { type: String, default: "" },
        deleteTimeoutMs: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  emojisSpam: {
    enabled: { type: Boolean, default: true },
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
      notifyUser: {
        enabled: { type: Boolean, default: true },
        messageFn: { type: String, default: "" },
        deleteTimeoutMs: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  scamLinks: {
    enabled: { type: Boolean, default: true },
    targetLinks: [String],
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
      notifyUser: {
        enabled: { type: Boolean, default: true },
        messageFn: { type: String, default: "" },
        deleteTimeoutMs: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  invitations: {
    enabled: { type: Boolean, default: true },
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
      notifyUser: {
        enabled: { type: Boolean, default: true },
        messageFn: { type: String, default: "" },
        deleteTimeoutMs: {
          type: Number,
          default: 0,
        },
      },
    },
  },
});
module.exports =
  mongoose.model.Settings || mongoose.model("Settings", SettingSchema);
