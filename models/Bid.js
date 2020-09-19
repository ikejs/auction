const mongoose  = require("mongoose");

const bidSchema = new mongoose.Schema({
  bidder: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  amount: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Bid', bidSchema);