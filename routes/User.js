const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require('multer');
const AWS = require('aws-sdk');

// Use IAM role for AWS S3 access
AWS.config.update({ region: 'us-east-1' }); // Set your preferred AWS region
const s3 = new AWS.S3();

const storage = multer.memoryStorage();
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
        Bucket: 'cyclic-shy-blue-mussel-robe-ap-northeast-2',
        Key: fileData.originalname,
        Body: fileData.buffer,
      };

      s3.upload(params, async (err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Error uploading the file to S3" });
        }

        image = data.Location; // Store the S3 file URL in the User model

        // Retrieve data from S3
        try {
          const myFile = await s3.getObject({
            Bucket: "cyclic-shy-blue-mussel-robe-ap-northeast-2",
            Key: "some_files/my_file.json",
          }).promise();

          // Do something with myFile, if needed

        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Error retrieving data from S3" });
        }

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

        user.save()
          .then((savedUser) => {
            res.status(201).json({ user: savedUser, myFile });
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
          res.status(201).json({ user: savedUser });
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

// Get user data along with S3 file data
router.get("/users", async (req, res) => {
  const email = req.query.email;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retrieve data from S3
    try {
      const myFile = await s3.getObject({
        Bucket: "cyclic-shy-blue-mussel-robe-ap-northeast-2",
        Key: "some_files/my_file.json",
      }).promise();

      // Do something with myFile, if needed

      // Send the user data along with S3 file data in the response
      res.json({ user, myFile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error retrieving data from S3" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
