const express = require("express");
const router = express.Router();
const User = require("../models/User");
const upload = require("../utils/multer-config");
const s3Controller = require("../controllers/s3Controller");

// Create a new user
router.post("/users", upload.single('image'), s3Controller.uploadToS3, async (req, res) => {
  try {
    const { name, Lname, bio, description, pinnedSocialLinks, resumeLink, email, image } = req.body;

    // Create a new user and save it to your database
    const user = new User({
      name,
      Lname,
      bio,
      description,
      pinnedSocialLinks,
      resumeLink,
      image,
      email,
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Retrieve a user by email
router.get("/users", async (req, res) => {
  const email = req.query.email;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
