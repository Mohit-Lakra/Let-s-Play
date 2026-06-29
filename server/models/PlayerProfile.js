const mongoose = require('mongoose');

const playerProfileSchema = new mongoose.Schema({
  // userId acts as a reference to the User collection (relational link)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  sports: [{
    type: String, // e.g. ["football", "badminton"]
  }],
  preferredLocation: {
    // GeoJSON format for storing map coordinates
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    // coordinates are stored as [longitude, latitude]
    coordinates: {
      type: [Number],
      required: true,
    }
  },
  availability: [{
    day: {
      type: String,
      enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      required: true
    },
    startTime: {
      type: String, // format "HH:MM" e.g., "18:00"
      required: true
    },
    endTime: {
      type: String, // e.g., "20:00"
      required: true
    }
  }],
  ratings: {
    skill: { type: Number, default: 70, min: 0, max: 100 },
    reliability: { type: Number, default: 70, min: 0, max: 100 },
    behavior: { type: Number, default: 70, min: 0, max: 100 },
    overall: { type: Number, default: 70, min: 0, max: 100 },
    matchesPlayed: { type: Number, default: 0 }
  }
});

// We create a "2dsphere" index on the preferredLocation field.
// This allows MongoDB to do hyper-fast geospatial queries (like "find players within 15km of me").
playerProfileSchema.index({ preferredLocation: '2dsphere' });

const PlayerProfile = mongoose.model('PlayerProfile', playerProfileSchema);

module.exports = PlayerProfile;
