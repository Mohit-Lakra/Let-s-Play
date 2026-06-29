const mongoose = require('mongoose');

// A Schema defines the structure of the data we will store in the MongoDB collection
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no two users can register with the same email
  },
  passwordHash: {
    type: String,
    required: true, // We store the hashed password, never the plain text password!
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// We create a Model from the schema. This model gives us methods like User.find() or User.create()
const User = mongoose.model('User', userSchema);

module.exports = User;
