const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  key: { type: String, default: "ticketNumber" },
  lastNumber: { type: Number, default: 0 },
});

module.exports =
  mongoose.model("Counter", CounterSchema) || mongoose.model.Counter;
