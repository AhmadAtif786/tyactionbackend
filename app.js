const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("/routes/user");
const videoRoutes = require("./routes/video");

const app = express();
const port = 3001;

// Connect to MongoDB - Replace with your actual MongoDB connection string
mongoose.connect("mongodb+srv://ahmad:212Mtpochna@cluster0.45t8rnb.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// const allowedOrigins = ["http://localhost:3000"]; // Replace with your React app's URL or add more origins if needed

app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Middleware for handling JSON data - You only need this once
app.use(express.json());

// Routes
app.use("/api", userRoutes);
app.use("/api", videoRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
