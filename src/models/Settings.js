const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema({
  xps: {
    message: { type: Number, default: 4 },
    boost: { type: Number, default: 500 },
    voice: { type: Number, default: 20 },
    voiceWithAdmin: { type: Number, default: 25 },
    stage: {
      type: Number,
      default: 6,
    },
    invite: { type: Number, default: 300 },
    studentMultiplier: { type: Number, default: 1.25 },
    graduateMultiplier: { type: Number, default: 1.5 },
    baseXpLimit: { type: Number, default: 150 },
  },
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
    targetChannels: [String],
    targetRoles: [String],
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
    targetChannels: [String],
    targetRoles: [String],
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
    targetChannels: [String],
    targetRoles: [String],
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
    targetChannels: [String],
    targetRoles: [String],
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
    targetChannels: [String],
    targetRoles: [String],
  },
  funCommands: {
    winkLvl: { type: Number, default: 15 },
    cryLvl: { type: Number, default: 15 },
    patLvl: { type: Number, default: 15 },
    nopeLvl: { type: Number, default: 10 },
    waveLvl: { type: Number, default: 10 },
    highfiveLvl: { type: Number, default: 5 },
    hugLvl: { type: Number, default: 0 },
    pokeLvl: { type: Number, default: 0 },
    slapLvl: { type: Number, default: 0 },
  },
  warns: {
    onMute: {
      type: String,
      default: "remove-all-warns",
      enum: ["remove-all-warns", "remove-all-exept-one", "save-all"],
    },
    //? remove-all-warns
    //? remove-all-exept-one
    //? save-all
    actions: [
      {
        mute: {
          enabled: { type: Boolean, default: false },
          muteTimeMs: { type: Number },
        },
        kick: { type: Boolean, default: false },
        ban: { type: Boolean, default: false },
        warnsAmount: { type: Number },
      },
    ],
  },
  events: [
    {
      title: { type: String, default: "" },
      activities: {
        messages: { type: Boolean, default: true },
        voice: { type: Boolean, default: true },
        stage: { type: Boolean, default: true },
        boosts: { type: Boolean, default: true },
      },
      k: { type: Number, default: 1 },
      kLimit: { type: Number, default: 1 },
      startDate: { type: Date, required: true, unique: false },
      endDate: { type: Date, required: true, unique: false },
      targetChannels: [String],
      targetRoles: [String],
    },
  ],
});
module.exports =
  mongoose.model.Settings || mongoose.model("Settings", SettingSchema);
