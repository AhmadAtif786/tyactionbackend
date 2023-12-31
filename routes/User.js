const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require('multer');
const { S3, PutObjectCommand } = require('@aws-sdk/client-s3');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use IAM role for AWS S3 access
const s3 = new S3({ region: 'us-east-1' }); // Set your preferred AWS region

// Create a new user
router.post("/users", upload.single('image'), async (req, res) => {
  try {
    const { name, Lname, bio, description, pinnedSocialLinks, resumeLink, email } = req.body;

    let image = null;

    if (req.file) {
      // Upload the file to AWS S3
      const fileData = req.file;
      const params = {
        Bucket: 'accesspoint-8yjwix8e8phe6pu1iu793a5y4gfzsuse1a-s3alias',
        Key: fileData.originalname,
        Body: fileData.buffer,
      };

      try {
        const data = await s3.send(new PutObjectCommand(params));
        image = data.Location; // Store the S3 file URL in the User model

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

        const savedUser = await user.save(); // Mongoose save() doesn't accept a callback in newer versions
        res.status(201).json(savedUser);
      } catch (uploadError) {
        console.error(uploadError);
        res.status(500).json({ error: "Error uploading the file to S3" });
      }
    } else {
      // If no file was uploaded, create the user without an image
      const user = new User({
        name,
        Lname,
        bio,
        description,
        pinnedSocialLinks,
        resumeLink,
        email,
      });

      const savedUser = await user.save();
      res.status(201).json(savedUser);
    }
  } catch (error) {
    console.error(error);
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
