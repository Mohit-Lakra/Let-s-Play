const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlayRequest',
    required: true
  },
  participantIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sport: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'no_show'],
    default: 'confirmed'
  },
  // Populated by the Python auto-squad-builder
  teamA: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  teamB: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Match', matchSchema);
