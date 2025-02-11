//PrimaryContact Schema (models/PrimaryContact.js)


let mongoose = require('mongoose');

let PrimaryContactSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  isPrimary: { type: Boolean, default: true },
  secondaryContactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SecondaryContact' }]
});

module.exports = mongoose.model('PrimaryContact', PrimaryContactSchema);


//SecondaryContact Schema (models/SecondaryContact.js)


let mongoose = require('mongoose');

let SecondaryContactSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  isPrimary: { type: Boolean, default: false }
});

module.exports = mongoose.model('SecondaryContact', SecondaryContactSchema);

//Authentication Middleware (middlewares/authMiddleware.js)

let jwt = require('jsonwebtoken');

let authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};


//Controller (controllers/contactController.js)
//POST /identify

let PrimaryContact = require('../models/PrimaryContact');
let SecondaryContact = require('../models/SecondaryContact');

let identifyContact = async (req, res) => {
  let { email, phoneNumber } = req.body;

  try {
    let primaryContact = await PrimaryContact.findOne({
      $or: [{ email }, { phoneNumber }]
    }).populate('secondaryContactIds');

    if (primaryContact) {
      return res.status(200).json({
        contact: {
          _id: primaryContact._id,
          emails: [primaryContact.email, ...primaryContact.secondaryContactIds.map(c => c.email)].filter(Boolean),
          phoneNumbers: [primaryContact.phoneNumber, ...primaryContact.secondaryContactIds.map(c => c.phoneNumber)].filter(Boolean),
          secondaryContactIds: primaryContact.secondaryContactIds.map(c => c._id)
        }
      });
    }

    let secondaryContact = await SecondaryContact.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (secondaryContact) {
      primaryContact = await PrimaryContact.findOne({
        secondaryContactIds: secondaryContact._id
      }).populate('secondaryContactIds');

      return res.status(200).json({
        contact: {
          _id: primaryContact._id,
          emails: [primaryContact.email, ...primaryContact.secondaryContactIds.map(c => c.email)].filter(Boolean),
          phoneNumbers: [primaryContact.phoneNumber, ...primaryContact.secondaryContactIds.map(c => c.phoneNumber)].filter(Boolean),
          secondaryContactIds: primaryContact.secondaryContactIds.map(c => c._id)
        }
      });
    }

    let newPrimaryContact = await PrimaryContact.create({ email, phoneNumber });
    return res.status(201).json({
      contact: {
        _id: newPrimaryContact._id,
        emails: [email].filter(Boolean),
        phoneNumbers: [phoneNumber].filter(Boolean),
        secondaryContactIds: []
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { identifyContact };


//Routes (routes/contactRoutes.js)

let express = require('express');
let router = express.Router();
let { identifyContact } = require('../controllers/contactController');
let authMiddleware = require('../middlewares/authMiddleware');

// Public Routes
router.post('/identify', identifyContact);

// Protected Routes
router.get('/search', authMiddleware, (req, res) => {
  // Implement search logic
});

router.put('/contacts/:contactId', authMiddleware, (req, res) => {
  // Implement update logic
});

router.delete('/contacts/:contactId', authMiddleware, (req, res) => {
  // Implement delete logic
});

module.exports = router;


//JWT Token Generation (routes/authRoutes.js)

let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');

router.post('/generate/token', (req, res) => {
  let token = jwt.sign(
    { adminId: 123, adminName: 'Alice' },
    process.env.JWT_SECRET,
    { expiresIn: '20m' }
  );
  res.status(200).json({ token });
});

module.exports = router;


//Database Connection (config/db.js)

let mongoose = require('mongoose');

let connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

//Main Application (app.js)

require('dotenv').config();
let express = require('express');
let connectDB = require('./config/db');
let contactRoutes = require('./routes/contactRoutes');
let authRoutes = require('./routes/authRoutes');

let app = express();
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api', contactRoutes);
app.use('/api', authRoutes);


