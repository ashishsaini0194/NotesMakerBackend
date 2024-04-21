const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');



const app = express();
app.use(cors())
const PORT = 3000;

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://smartsainiashish1:smartsainiashish1@cluster1.pl7rn3r.mongodb.net/NotesMaker', {
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
    email: { type: 'string', required: true },
    textData: { type: 'string', required: true }
}, { timestamps: true });

const Item = mongoose.model('Notes', itemSchema);

// Middleware
app.use(bodyParser.json());

// GET all items
app.get('/allNotes', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(401).json({ message: 'Please include email Id' })
        // console.log({ email })
        const items = await Item.find({ email }, { 'key': "$_id", _id: 0, email: 1, textData: 1, createdAt: 1, updatedAt: 1 });
        return res.status(200).json({ items });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// POST a new item
app.post('/note', async (req, res) => {
    try {
        // console.log(req.body.email, req.body.textData)
        if (!req.body.email) return res.status(401).json({ message: 'Please include email Id' })
        if (!req.body.textData) return res.status(400).json({ message: 'Text can not be empty' })
        const newItem = new Item({
            email: req.body.email,
            textData: req.body.textData,
        });
        // console.log({ newItem })
        const savedItem = await newItem.save();
        return res.status(201).json({ savedItem });
    } catch (error) {
        // console.log(error)
        return res.status(400).json({ error: error.message });
    }
});

// GET item by ID
app.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).send('Item not found');
        } else {
            return res.json({ item });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// PUT (Update) item by ID
app.put('/notes/:id', async (req, res) => {
    try {
        // console.log(req.params.id, req.body.textData)
        if (!req.params.id) return res.status(401).json({ message: 'Please include note Id' })
        if (!req.body.textData) return res.status(400).json({ message: 'Text can not be empty' })
        const item = await Item.findByIdAndUpdate(
            req.params.id,
            {
                textData: req.body.textData,
            },
            { new: true }
        );
        // console.log({ item })
        if (!item) {
            return res.status(404).send('Item not found');
        }
        return res.status(204).json({ message: "successfully Updated !" });

    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// DELETE item by ID
app.delete('/notes/:id', async (req, res) => {
    try {
        console.log(req.params.id)
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        console.log({ deletedItem })
        if (!deletedItem) {
            return res.status(404).send('Item not found');
        } else {
            return res.status(204).json({ message: "successfully Deleted !" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//for vercel
module.exports = app;