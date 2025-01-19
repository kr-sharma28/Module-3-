<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Uploader</title>
</head>
<body>
  <h1>Upload a File</h1>
  <form action="/upload" method="POST" enctype="multipart/form-data">
    <label for="file">Choose a file:</label>
    <input type="file" name="file" id="file" required>
    <button type="submit">Upload</button>
  </form>
</body>
</html>

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = 3000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Folder in Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'pdf'], // Supported formats
  },
});

const upload = multer({ storage });

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'src')));

// Route: Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Route: Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file && req.file.path) {
    res.status(200).json({
      message: 'file uploaded successfully',
      imageUrl: req.file.path, // Cloudinary file URL
    });
  } else {
    res.status(400).json({
      message: 'file upload failed',
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
