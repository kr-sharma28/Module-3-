require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    birth_year: { type: Number, required: true },
    nationality: { type: String },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

module.exports = mongoose.model('Author', authorSchema);


const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    published_year: { type: Number },
    genre: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
});

module.exports = mongoose.model('Book', bookSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    borrowed_books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrow_date: { type: Date, default: Date.now },
    return_date: { type: Date },
});

module.exports = mongoose.model('Transaction', transactionSchema);

const express = require('express');
const router = express.Router();
const Author = require('../models/author');

// Add Author
router.post('/', async (req, res) => {
    const { name, birth_year, nationality } = req.body;
    try {
        const author = new Author({ name, birth_year, nationality });
        await author.save();
        res.status(201).json(author);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

// Add Book
router.post('/', async (req, res) => {
    const { title, published_year, genre, authorId } = req.body;
    try {
        const author = await Author.findById(authorId);
        if (!author) return res.status(404).json({ message: 'Author not found' });

        const book = new Book({ title, published_year, genre, author: authorId });
        await book.save();

        author.books.push(book._id);
        await author.save();

        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Books by Author
router.get('/:authorId', async (req, res) => {
    const { authorId } = req.params;
    try {
        const books = await Book.find({ author: authorId });
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Add User
router.post('/', async (req, res) => {
    const { username, email } = req.body;
    try {
        const user = new User({ username, email });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const User = require('../models/user');
const Book = require('../models/book');

// Borrow a Book
router.post('/borrow', async (req, res) => {
    const { bookId, userId } = req.body;
    try {
        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const transaction = new Transaction({ book: bookId, user: userId });
        await transaction.save();

        user.borrowed_books.push(transaction._id);
        await user.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Return a Book
router.post('/return', async (req, res) => {
    const { transactionId } = req.body;
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { return_date: new Date() },
            { new: true }
        );
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
