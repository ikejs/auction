const mongoose  = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true},
  phone: String
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);