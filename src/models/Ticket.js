const mongoose = require("mongoose");
const Counter = require("./Counter");

const TicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true },
  openerId: { type: String, required: true, unique: false },
  channel: {
    id: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

TicketSchema.virtual("channel.name").get(function () {
  return "ticket-" + this.ticketNumber;
});

TicketSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  try {
    const count = await Counter.findOneAndUpdate(
      { key: "ticketNumber" },
      { $inc: { lastNumber: 1 } },
      { new: true, upsert: true }
    );
    this.ticketNumber = count.lastNumber;
  } catch (err) {
    next(err);
  }
});

module.exports =
  mongoose.model.Ticket || mongoose.model("Ticket", TicketSchema);
