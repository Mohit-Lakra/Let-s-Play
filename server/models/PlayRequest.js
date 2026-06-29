const mongoose = require('mongoose');

const playRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for fast lookup of a user's requests
  },
  sport: {
    type: String,
    required: true
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  timeSlot: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  status: {
    type: String,
    enum: ['open', 'matched', 'cancelled'],
    default: 'open'
  },
  // We will store the ranked list of candidates returned by FastAPI here
  candidateIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// A 2dsphere index just in case we need to search for active requests geographically later
playRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('PlayRequest', playRequestSchema);
