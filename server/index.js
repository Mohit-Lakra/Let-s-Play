const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// cors() allows our React frontend (which will run on a different port) to communicate with this backend.
app.use(cors());
// express.json() allows us to read JSON data sent in the request body (e.g., when a user signs up).
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const requestRoutes = require('./routes/requests');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/requests', requestRoutes);

// Database Connection
// We connect to MongoDB using the URI stored in our .env file.
// (We will set up the .env file in the next step)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/letsplay')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Lets Play API is running');
});

// Setup HTTP Server and Socket.io
const http = require('http');
const server = http.createServer(app);
const sockets = require('./services/sockets');
sockets.init(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
