const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true},
  phone: Number
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);