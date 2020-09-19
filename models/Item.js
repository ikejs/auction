const mongoose  = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  bids: [{type: mongoose.Schema.Types.ObjectId, ref: "Bid"}],
}, {
  timestamps: true
});

module.exports = mongoose.model("Item", itemSchema);