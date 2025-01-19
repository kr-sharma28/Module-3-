const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Create a write stream for the access.log file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'src', 'access.log'),
  { flags: 'a' } // Append logs to the file
);

// Define the custom Morgan format
const logFormat =
  ':method :status :res[content-length] - :response-time ms :date[iso] :http-version :url';

// Integrate Morgan middleware with the custom format and write to access.log
app.use(morgan(logFormat, { stream: accessLogStream }));

// Routes
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Express Server!');
});

app.get('/get-users', (req, res) => {
  res.status(200).json({ users: ['User1', 'User2', 'User3'] });
});

app.post('/add-user', (req, res) => {
  res.status(201).send('User added successfully!');
});

app.put('/user/:id', (req, res) => {
  const { id } = req.params;
  res.status(201).send(`User with ID ${id} updated successfully!`);
});

app.delete('/user/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).send(`User with ID ${id} deleted successfully!`);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
