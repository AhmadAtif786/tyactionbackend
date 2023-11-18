const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require('multer');
const AWS = require('aws-sdk');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Use IAM role for AWS S3 access
AWS.config.update({ region: 'us-east-1' }); // Set your preferred AWS region
const s3 = new AWS.S3();

// Create a new user
router.post("/users", upload.single('image'), async (req, res) => {
  try {
    const { name, Lname, bio, description, pinnedSocialLinks, resumeLink, email } = req.body;

    let image = null;

    if (req.file) {
      // Upload the file to AWS S3
      const fileData = req.file;
      const params = {
        Bucket: '8yjwix8e8phe6pu1iu793a5y4gfzsuse1a',
        Key: fileData.originalname,
        Body: fileData.buffer,
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error uploading the file to S3" });
        }

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

        user.save() // Mongoose save() doesn't accept a callback in newer versions
          .then((savedUser) => {
            res.status(201).json(savedUser);
          })
          .catch((saveError) => {
            console.error(saveError);
            res.status(500).json({ error: "Error saving the user to the database" });
          });
      });
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

      user.save()
        .then((savedUser) => {
          res.status(201).json(savedUser);
        })
        .catch((saveError) => {
          console.error(saveError);
          res.status(500).json({ error: "Error saving the user to the database" });
        });
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
