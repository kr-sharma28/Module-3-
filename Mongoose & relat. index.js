require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const organizerRoutes = require('./routes/organizerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/organizers', organizerRoutes);
app.use('/events', eventRoutes);
app.use('/attendees', attendeeRoutes);
app.use('/registrations', registrationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact_info: { type: String },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

module.exports = mongoose.model('Organizer', organizerSchema);


const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    location: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }],
});

module.exports = mongoose.model('Event', eventSchema);

const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }],
});

module.exports = mongoose.model('Attendee', attendeeSchema);


const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    attendee: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee', required: true },
    registration_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Registration', registrationSchema);


const express = require('express');
const router = express.Router();
const Organizer = require('../models/organizer');

// Add Organizer
router.post('/', async (req, res) => {
    const { name, contact_info } = req.body;
    try {
        const organizer = new Organizer({ name, contact_info });
        await organizer.save();
        res.status(201).json(organizer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const Organizer = require('../models/organizer');

// Add Event
router.post('/', async (req, res) => {
    const { title, date, location, organizerId } = req.body;
    try {
        const organizer = await Organizer.findById(organizerId);
        if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

        const event = new Event({ title, date, location, organizer: organizerId });
        await event.save();

        organizer.events.push(event._id);
        await organizer.save();

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Event
router.put('/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { title, date, location } = req.body;
    try {
        const updatedEvent = await Event.findByIdAndUpdate(eventId, { title, date, location }, { new: true });
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Attendee = require('../models/attendee');

// Add Attendee
router.post('/', async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const attendee = new Attendee({ name, email, phone });
        await attendee.save();
        res.status(201).json(attendee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Registration = require('../models/registration');
const Event = require('../models/event');
const Attendee = require('../models/attendee');

// Register Attendee for an Event
router.post('/', async (req, res) => {
    const { eventId, attendeeId } = req.body;
    try {
        const existingRegistration = await Registration.findOne({ event: eventId, attendee: attendeeId });
        if (existingRegistration) return res.status(400).json({ message: 'Attendee already registered for this event' });

        const registration = new Registration({ event: eventId, attendee: attendeeId });
        await registration.save();

        const event = await Event.findById(eventId);
        const attendee = await Attendee.findById(attendeeId);

        event.attendees.push(registration._id);
        attendee.registrations.push(registration._id);

        await event.save();
        await attendee.save();

        res.status(201).json(registration);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel Registration
router.delete('/:registrationId', async (req, res) => {
    const { registrationId } = req.params;
    try {
        const registration = await Registration.findByIdAndDelete(registrationId);
        res.json({ message: 'Registration canceled', registration });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
