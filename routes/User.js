const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require('multer');
const AWS = require('aws-sdk');

// Set up Multer for file uploads (video thumbnails and resumes)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: 'ASIAYC2RJDOW6G26F3VW',
  secretAccessKey: 'owJFL1g9w9yXTqAdlkdYTit3l4JpeMDdrxlWkKbF',
  region: 'ap-northeast-2' // Set your preferred AWS region
});

// Create a new user
router.post("/users", upload.single('image'), async (req, res) => {
  try {
    const { name, Lname, bio, description, pinnedSocialLinks, resumeLink, email } = req.body;

    let image = null;

    if (req.file) {
      // Upload the file to AWS S3
      const fileData = req.file;
      const params = {
        Bucket: 'cyclic-shy-blue-mussel-robe-ap-northeast-2',
        Key: fileData.originalname, // Set the S3 key (filename)
        Body: fileData.buffer,
      };

      const s3UploadResponse = await s3.upload(params).promise();

      image = s3UploadResponse.Location; // Store the S3 file URL in the User model
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

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

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
