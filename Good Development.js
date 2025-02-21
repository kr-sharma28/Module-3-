
//Create db.js for MongoDB Connection:

let mongoose = require('mongoose');

let connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
//Connect to DB in app.js:

let express = require('express');
let connectDB = require('./db');
let app = express();

connectDB();
app.use(express.json());

// Routes will be added here later

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//User Model:
//Create a User Model (models/User.js):

let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', UserSchema);
//User Routes:
//Create CRUD Routes in routes/users.js:

let express = require('express');
let User = require('../models/User');
let router = express.Router();

// GET /users
router.get('/', async (req, res) => {
  try {
    let users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /users
router.post('/', async (req, res) => {
  let { name, email, password } = req.body;

  let user = new User({ name, email, password });

  try {
    let newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /users/:id
router.patch('/:id', async (req, res) => {
  try {
    let user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /users/:id
router.delete('/:id', async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
//Import Routes into app.js:

let userRoutes = require('./routes/users');

app.use('/users', userRoutes);

//ESLint and Prettier Setup:
//Configure ESLint: Run npx eslint --init and follow the prompts to set up your linting rules.

Example .eslintrc.json:


{
  "env": {
    "node": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2020
  },
  "rules": {
    "prettier/prettier": "error"
  }
}
//Configure Prettier: Create a .prettierrc file:

{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5"
}
//Add linting and formatting scripts to package.json:
"scripts": {
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write ."
}
