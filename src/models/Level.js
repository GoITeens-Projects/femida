const { Schema, model } = require("mongoose");

const levelSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
  currentXp: {
    type: Number,
    default: 0,
  },
  presentXp:{
    type: Number,
    default: 0,
  },
  pinnedLevels: {
    type: Array,
    default: [],
  },
  warnings: {
    amount: { type: Number, default: 0 },
    history: {
      type: Array,
      default: [],
    },
  },
});

module.exports = model("Level", levelSchema);
