const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');

// Set up Multer for file uploads (video thumbnails and resumes)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const s3 = new AWS.S3();

// Configure AWS S3 parameters
const s3BucketName = 'cyclic-shy-blue-mussel-robe-ap-northeast-2';

const upload = multer({ storage });

// Create a new user
router.post("/users", upload.single('image'), async (req, res) => {
  try {
    const { name, Lname, bio, description, pinnedSocialLinks, resumeLink, email } = req.body;

    let image = null;

    if (req.file) {
      // Upload the file to AWS S3
      const fileData = req.file;
      const params = {
        Bucket: s3BucketName,
        Key: fileData.filename,
        Body: fileData.buffer,
      };

      const s3UploadResponse = await s3.upload(params).promise();

      image = s3UploadResponse.Key; // Store the S3 key (filename) in the User model
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
