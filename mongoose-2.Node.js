require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/movies', movieRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    genre: { type: String, required: true },
    releaseYear: { type: Number, required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);

const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');

// Create Movie
router.post('/', async (req, res) => {
    const { title, director, genre, releaseYear, rating } = req.body;
    try {
        const movie = new Movie({ title, director, genre, releaseYear, rating });
        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Movies with Filters, Sorting, and Pagination
router.get('/', async (req, res) => {
    const { q, title, rating, sortBy, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' }; // Search by partial title match
    if (title) filter.title = title; // Exact match on title
    if (rating) filter.rating = rating; // Exact match on rating

    const sort = {};
    if (sortBy) sort[sortBy] = 1; // Default ascending order

    try {
        const movies = await Movie.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Single Movie by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const movie = await Movie.findById(id);
        if (!movie) return res.status(404).json({ message: 'Movie not found' });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Movie
router.put('/:id', async (req, res) => {
    const

