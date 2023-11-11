// routes/video.js
const express = require("express");
const router = express.Router();
const Video = require("../models/Video");

// Create a new video
router.post("/videos", async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all videos
router.get("/videos", async (req, res) => {
  try {
    const userEmail = req.query.email; // Assuming email is passed as a query parameter
    const videos = await Video.find({ userEmail });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
