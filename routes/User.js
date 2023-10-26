// routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require('multer');
const path = require('path');
const AWS = require("aws-sdk");
const s3 = new AWS.S3()


// Set up Multer for file uploads (video thumbnails and resumes)
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Create a new user
router.post("/users", async (req, res) => {
  try {
    const { name, Lname, bio, description, pinnedSocialLinks, resumeLink, email } = req.body;
    await s3.putObject({
      Body: JSON.stringify({key:"value"}),
      Bucket: "cyclic-shy-blue-mussel-robe-ap-northeast-2",
      Key: "uploads/"+req.file,
    }).promise()
    let image=null;

    if (req.file) {
      image = req.file.filename; // Store the filename in the User model
    }

    const existingUser = await User.findOne({ email });

    // if (existingUser) {
    //   return res.status(400).json({ error: "Email already exists" });
    // }

    const user = new User({
      name,
      Lname,
      bio,
      description,
      pinnedSocialLinks,
      resumeLink,
      image, // Store the image filename or path in the User model
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
