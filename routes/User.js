const express = require("express");
const router = express.Router();
const User = require("../models/User");
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-provider-ini');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Replace 'us-east-1' and 'accesspoint-8yjwix8e8phe6pu1iu793a5y4gfzsuse1a-s3alias' with your actual AWS region and S3 access point name
const region = 'us-east-1';
const accessPointName = 'accesspoint-8yjwix8e8phe6pu1iu793a5y4gfzsuse1a-s3alias';

// Construct the S3 service endpoint URL
const s3Endpoint = `https://${accessPointName}-s3alias.s3.${region}.amazonaws.com`;

// Create an S3 client with the correct endpoint
const s3 = new S3Client({
  region: region,
  endpoint: s3Endpoint, // Use the constructed endpoint URL
  credentials: fromIni(),
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
        Bucket: accessPointName,
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

        const savedUser = await user.save();
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
