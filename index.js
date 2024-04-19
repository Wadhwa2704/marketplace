const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

let items = [];
let itemId = 0;

const isOwner = (req, res, next) => {
    if (req.query.userType !== 'owner') {
        return res.status(403).json({ message: "Access denied. Owners only." });
    }
    next();
};

app.get('/items', (req, res) => {
    if (req.query.userType === 'owner') {
        // Owners see detailed ratings
        res.json(items.map(item => ({
            ...item,
            ratings: item.ratings,
            averageRating: item.ratings.length ? (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1) : "Not rated"
        })));
    } else {
        // Employees see only average ratings
        res.json(items.map(item => ({
            ...item,
            averageRating: item.ratings.length ? (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1) : "Not rated"
        })));
    }
});

app.post('/items', isOwner, (req, res) => {
    const { name, price, picture, location, description } = req.body;
    const newItem = { id: ++itemId, name, price, picture, location, description, ratings: [] };
    items.push(newItem);
    res.status(201).json(newItem);
});

app.put('/items/:id', isOwner, (req, res) => {
    const id = parseInt(req.params.id);
    const item = items.find(item => item.id === id);
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }
    const { name, price, picture, location, description } = req.body;
    item.name = name;
    item.price = price;
    item.picture = picture;
    item.location = location;
    item.description = description;
    res.json(item);
});

app.delete('/items/:id', isOwner, (req, res) => {
    const id = parseInt(req.params.id);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Item not found" });
    }
    items.splice(index, 1);
    res.status(204).send();
});

app.post('/items/:id/rate', (req, res) => {
    const id = parseInt(req.params.id);
    const { rating } = req.body;  // rating should be a number
    const item = items.find(item => item.id === id);
    if (!item) {
        return res.status(404).json({ message: "Item not found" });
    }
    item.ratings.push(rating);
    res.json({ message: "Rating added", averageRating: (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1) });
});
app.get('/items', (req, res) => {
    if (req.query.userType === 'owner') {
        // Owners see detailed ratings
        res.json(items.map(item => ({
            ...item,
            ratings: item.ratings, // Ensure this line correctly outputs the ratings array
            averageRating: item.ratings.length ? (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1) : "Not rated"
        })));
    } else {
        // Employees see only average ratings
        res.json(items.map(item => ({
            ...item,
            averageRating: item.ratings.length ? (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1) : "Not rated"
        })));
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});