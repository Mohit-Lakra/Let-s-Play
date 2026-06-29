const express = require('express');
const PlayerProfile = require('../models/PlayerProfile');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/profile
// Create or update the player's profile
// We use the `authenticate` middleware here. If there is no valid token, the request stops at the middleware.
router.post('/', authenticate, async (req, res) => {
  try {
    const { sports, preferredLocation, availability } = req.body;
    // req.user is set by the authenticate middleware
    const userId = req.user.userId;

    // Check if the user already has a profile
    let profile = await PlayerProfile.findOne({ userId });

    if (profile) {
      // Update existing profile
      profile.sports = sports || profile.sports;
      if (preferredLocation) {
        profile.preferredLocation = {
          type: 'Point',
          coordinates: preferredLocation // [longitude, latitude]
        };
      }
      profile.availability = availability || profile.availability;
      
      await profile.save();
      return res.status(200).json({ message: 'Profile updated', profile });
    } else {
      // Create new profile
      profile = new PlayerProfile({
        userId,
        sports,
        preferredLocation: {
          type: 'Point',
          coordinates: preferredLocation
        },
        availability
      });

      await profile.save();
      return res.status(201).json({ message: 'Profile created', profile });
    }

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profile/nearby
// Fetch players near the user
router.get('/nearby', authenticate, async (req, res) => {
  try {
    const { lng, lat, distance = 50000, sport } = req.query; // default 50km
    
    if (!lng || !lat) {
      return res.status(400).json({ error: 'Longitude and latitude required' });
    }

    const query = {
      preferredLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance)
        }
      }
    };

    if (sport && sport !== 'all') {
      query.sports = sport;
    }

    const players = await PlayerProfile.find(query).populate('userId', 'name email').limit(50); // limit to 50 players

    res.status(200).json(players);
  } catch (error) {
    console.error('Error fetching nearby players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
