// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  Lname: String,
  bio: String,
  description: String,
  pinnedSocialLinks: [String],
  resumeLink: String,
  image: String,
  email: String,
});

module.exports = mongoose.model("User", userSchema);
