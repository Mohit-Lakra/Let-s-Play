require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const PlayerProfile = require('../models/PlayerProfile');
const PlayRequest = require('../models/PlayRequest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/letsplay';

// Helper to generate a random coordinate near New Delhi (approx 28.6139, 77.2090)
// Longitude goes first in GeoJSON: [longitude, latitude]
function getRandomLocation() {
  const baseLng = 77.2090;
  const baseLat = 28.6139;
  
  // Random offset between -0.1 and 0.1 degrees (approx 11km)
  const lngOffset = (Math.random() - 0.5) * 0.2;
  const latOffset = (Math.random() - 0.5) * 0.2;
  
  return [baseLng + lngOffset, baseLat + latOffset];
}

const mockNames = [
  "Aarav Sharma", "Vihaan Singh", "Aditya Patel", "Arjun Gupta", "Sai Kumar",
  "Ayaan Reddy", "Krishna Rao", "Ishaan Desai", "Shaurya Joshi", "Atharv Mehta",
  "Diya Kapoor", "Ananya Verma", "Myra Nair", "Kavya Menon", "Saanvi Iyer",
  "Pari Malhotra", "Aadhya Das", "Navya Pillai", "Riya Chauhan", "Aarohi Bhat"
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Clear existing data (DANGER: only do this in development/seeding)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await PlayerProfile.deleteMany({});
    await PlayRequest.deleteMany({});

    console.log('Seeding 1000 mock players...');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    for (let i = 0; i < 1000; i++) {
      // Pick a random name from the array and append a number to make it unique
      const baseName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const name = `${baseName} ${i + 1}`;
      const email = `player${i+1}@example.com`;
      
      const user = new User({ name, email, passwordHash });
      await user.save();

      const profile = new PlayerProfile({
        userId: user._id,
        sports: Math.random() > 0.5 ? ['football', 'cricket'] : ['badminton', 'tennis'],
        preferredLocation: {
          type: 'Point',
          coordinates: getRandomLocation()
        },
        availability: [
          { day: 'sat', startTime: '17:00', endTime: '19:00' },
          { day: 'sun', startTime: '07:00', endTime: '09:00' }
        ],
        ratings: {
          skill: Math.floor(Math.random() * 40) + 50, // 50 to 90
          reliability: Math.floor(Math.random() * 40) + 50,
          behavior: Math.floor(Math.random() * 40) + 50,
          overall: Math.floor(Math.random() * 40) + 50,
          matchesPlayed: Math.floor(Math.random() * 20)
        }
      });
      await profile.save();

      // Create a dummy play request for half of them so the feed has content
      if (Math.random() > 0.5) {
        const sport = profile.sports[0];
        const request = new PlayRequest({
          requesterId: user._id,
          sport: sport,
          location: profile.preferredLocation, // Use their location
          timeSlot: {
            start: new Date(Date.now() + Math.random() * 86400000 * 3), // Within next 3 days
            end: new Date(Date.now() + Math.random() * 86400000 * 3 + 7200000) // 2 hours later
          },
          skillLevelRequired: Math.floor(Math.random() * 3) + 1, // 1 to 3
          status: 'open'
        });
        await request.save();
      }
    }

    console.log('Successfully seeded database!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
