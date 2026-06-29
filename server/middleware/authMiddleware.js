const jwt = require('jsonwebtoken');

// Middleware function to protect routes
// It intercepts the request, checks for a valid token, and then lets the request proceed or blocks it.
const authenticate = (req, res, next) => {
  // Tokens are usually sent in the Authorization header like this: "Bearer <token_string>"
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Extract the token part
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Add the decoded payload (which contains the userId) to the request object
    // This allows the actual route handler to know WHO is making the request
    req.user = decoded;
    
    // Pass control to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authenticate;
