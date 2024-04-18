const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://smartsainiashish1:smartsainiashish1@cluster1.pl7rn3r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

// Check MongoDB connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check for MongoDB connection error
db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Define item schema and model
const itemSchema = new mongoose.Schema({
    email: { type: String, required: true },
    textData: { type: String, required: true },
    createdAt: { type: new Date(), required: true }
});

const Item = mongoose.model('Item', itemSchema);

// Middleware
app.use(bodyParser.json());

// GET all items
app.get('/allNotes', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) res.status(401).json({ message: 'Please include email Id' })
        const items = await Item.find({ email });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a new item
app.post('/note', async (req, res) => {
    try {

        if (!req.body.email) res.status(401).json({ message: 'Please include email Id' })
        if (!req.body.textData) res.status(400).json({ message: 'Text can not be empty' })
        const newItem = new Item({
            email: req.body.email,
            textData: req.body.textData,
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET item by ID
app.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            res.status(404).send('Item not found');
        } else {
            res.json(item);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT (Update) item by ID
app.put('/notes/:id', async (req, res) => {
    try {

        if (!req.body.email) res.status(401).json({ message: 'Please include email Id' })
        if (!req.body.textData) res.status(400).json({ message: 'Text can not be empty' })
        const item = await Item.findByIdAndUpdate(
            req.params.id,
            {
                email: req.body.email,
                textData: req.body.textData,
            },
            { new: true }
        );
        if (!item) {
            res.status(404).send('Item not found');
        } else {
            res.status(204).json({ message: "successfully Deleted !" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE item by ID
app.delete('/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            res.status(404).send('Item not found');
        } else {
            res.status(204).json({ message: "successfully Deleted !" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
