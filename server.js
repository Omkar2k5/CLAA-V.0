import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage for time slots and users
let timeSlots = generateTimeSlots();
let users = [];
let currentSessions = []; // Store active sessions

// Generate initial time slots (9 AM to 5 PM)
function generateTimeSlots() {
  const slots = [];
  const startHour = 9;
  const endHour = 17;

  for (let hour = startHour; hour < endHour; hour++) {
    // Add full hour slot
    slots.push({
      id: `slot-${hour}-00`,
      time: `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
      isBooked: false,
      bookedBy: null
    });

    // Add half hour slot
    slots.push({
      id: `slot-${hour}-30`,
      time: `${hour % 12 || 12}:30 ${hour < 12 ? 'AM' : 'PM'}`,
      isBooked: false,
      bookedBy: null
    });
  }

  return slots;
}

// GET /slots - Return list of time slots with booking status
app.get('/slots', (req, res) => {
  res.json({
    success: true,
    data: timeSlots
  });
});

// Helper function to authenticate user
const authenticateUser = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return { authenticated: false, error: 'Authentication token is required' };
  }
  
  // Find session
  const session = currentSessions.find(s => s.token === token);
  
  if (!session) {
    return { authenticated: false, error: 'Invalid or expired session' };
  }
  
  // Find user
  const user = users.find(u => u.id === session.userId);
  
  if (!user) {
    return { authenticated: false, error: 'User not found' };
  }
  
  return { authenticated: true, user };
};

// POST /book - Book a slot (send time and requires authentication)
app.post('/book', (req, res) => {
  // Authenticate user
  const auth = authenticateUser(req);
  
  if (!auth.authenticated) {
    return res.status(401).json({
      success: false,
      message: auth.error
    });
  }
  
  const { slotId } = req.body;
  const user = auth.user;

  // Validate input
  if (!slotId) {
    return res.status(400).json({
      success: false,
      message: 'slotId is required'
    });
  }

  // Find the slot
  const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
  
  if (slotIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Time slot not found'
    });
  }

  // Check if slot is already booked
  if (timeSlots[slotIndex].isBooked) {
    return res.status(400).json({
      success: false,
      message: 'This slot is already booked'
    });
  }

  // Book the slot with user information
  timeSlots[slotIndex].isBooked = true;
  timeSlots[slotIndex].bookedBy = user.name;
  timeSlots[slotIndex].bookedById = user.id; // Store the user ID for permission checks

  res.json({
    success: true,
    message: 'Slot booked successfully',
    data: timeSlots[slotIndex]
  });
});

// POST /cancel - Cancel a booking (requires authentication and ownership)
app.post('/cancel', (req, res) => {
  // Authenticate user
  const auth = authenticateUser(req);
  
  if (!auth.authenticated) {
    return res.status(401).json({
      success: false,
      message: auth.error
    });
  }
  
  const { slotId } = req.body;
  const user = auth.user;

  // Validate input
  if (!slotId) {
    return res.status(400).json({
      success: false,
      message: 'slotId is required'
    });
  }

  // Find the slot
  const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
  
  if (slotIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Time slot not found'
    });
  }

  // Check if slot is not booked
  if (!timeSlots[slotIndex].isBooked) {
    return res.status(400).json({
      success: false,
      message: 'This slot is not booked'
    });
  }
  
  // Check if the user is the one who booked the slot
  if (timeSlots[slotIndex].bookedById !== user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only cancel your own bookings'
    });
  }

  // Cancel the booking
  timeSlots[slotIndex].isBooked = false;
  timeSlots[slotIndex].bookedBy = null;
  timeSlots[slotIndex].bookedById = null;

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: timeSlots[slotIndex]
  });
});

// Authentication endpoints
// Register a new user
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }
  
  // Create new user with a unique ID
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, // In a real app, this would be hashed
    createdAt: new Date().toISOString()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Create a session token
  const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  // Store the session
  currentSessions.push({
    token: sessionToken,
    userId: newUser.id,
    createdAt: new Date().toISOString()
  });
  
  // Return user info (without password) and token
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userWithoutPassword,
      token: sessionToken
    }
  });
});

// Login user
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  // Create a session token
  const sessionToken = `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  
  // Store the session
  currentSessions.push({
    token: sessionToken,
    userId: user.id,
    createdAt: new Date().toISOString()
  });
  
  // Return user info (without password) and token
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token: sessionToken
    }
  });
});

// Get current user info
app.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required'
    });
  }
  
  // Find session
  const session = currentSessions.find(s => s.token === token);
  
  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session'
    });
  }
  
  // Find user
  const user = users.find(u => u.id === session.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Return user info (without password)
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: userWithoutPassword
  });
});

// Logout user
app.post('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required'
    });
  }
  
  // Remove session
  const sessionIndex = currentSessions.findIndex(s => s.token === token);
  
  if (sessionIndex !== -1) {
    currentSessions.splice(sessionIndex, 1);
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`- GET /slots - Get all time slots`);
  console.log(`- POST /book - Book a slot (requires slotId and name)`);
  console.log(`- POST /cancel - Cancel a booking (requires slotId)`);
  console.log(`- POST /register - Register a new user`);
  console.log(`- POST /login - Login a user`);
  console.log(`- GET /me - Get current user info`);
  console.log(`- POST /logout - Logout user`);
});

// Log the initial time slots
console.log('Initial time slots generated:');
console.log(timeSlots.slice(0, 4)); // Show first few slots
console.log(`Total slots: ${timeSlots.length}`);