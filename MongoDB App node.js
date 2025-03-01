// server.js
let express = require('express');
let mongoose = require('mongoose');
let dotenv = require('dotenv');
let cors = require('cors');

// Load environment variables
dotenv.config();

// Initialize express app
let app = express();
let port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Create a simple schema and model for MongoDB collection
let DataSchema = new mongoose.Schema({
  name: String,
  value: String
});

let Data = mongoose.model('Data', DataSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.get('/api/data', async (req, res) => {
  try {
let data = await Data.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data from MongoDB', error: err });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
