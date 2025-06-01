const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Grid = require('gridfs-stream');
const cors = require('cors');
const app = express();
const PORT = 5000;

const Place = require('./placeModel');
const storage = require('./uploadConfig');
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/historical_places';

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;

let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Routes
app.get('/places', async (req, res) => {
  try {
    const { era } = req.query;
    const filter = era ? { era } : {};
    const places = await Place.find(filter);
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch places.' });
  }
});

app.get('/places/near', async (req, res) => {
  try {
    const { lng, lat, dist } = req.query;
    const places = await Place.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(dist) || 5000
        }
      }
    });
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch nearby places.' });
  }
});

// NEW: Search places by name (case-insensitive)
app.get('/places/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Name query parameter is required.' });

    const places = await Place.find({
      name: { $regex: new RegExp(name, 'i') }
    });

    res.json(places);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search places by name.' });
  }
});

app.post('/places', upload.array('images'), async (req, res) => {
  try {
    const { name, era, description, lng, lat, restoration } = req.body;
    const restoration_history = JSON.parse(restoration || '[]');

    const newPlace = new Place({
      name,
      era,
      description,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      restoration_history,
      images: req.files.map(file => ({ filename: file.filename, uploadDate: file.uploadDate }))
    });

    await newPlace.save();
    res.json({ message: 'Place added!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add place.' });
  }
});

app.get('/images/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) return res.status(404).json({ error: 'No file found' });
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
