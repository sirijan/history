const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  era: String,
  description: String,
  restoration_history: [
    {
      year: Number,
      description: String
    }
  ],
  images: [
    {
      filename: String,
      uploadDate: Date
    }
  ]
});

placeSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Place', placeSchema);