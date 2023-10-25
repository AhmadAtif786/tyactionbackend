// models/Video.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  name: String,
  thumbnail: String,
  link: String,
  description: String,
});

module.exports = mongoose.model("Video", videoSchema);
