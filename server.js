import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage for time slots
let timeSlots = generateTimeSlots();

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

// POST /book - Book a slot (send name and time)
app.post('/book', (req, res) => {
  const { slotId, name } = req.body;

  // Validate input
  if (!slotId || !name) {
    return res.status(400).json({
      success: false,
      message: 'Both slotId and name are required'
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

  // Book the slot
  timeSlots[slotIndex].isBooked = true;
  timeSlots[slotIndex].bookedBy = name;

  res.json({
    success: true,
    message: 'Slot booked successfully',
    data: timeSlots[slotIndex]
  });
});

// POST /cancel - Cancel a booking (send time slot)
app.post('/cancel', (req, res) => {
  const { slotId } = req.body;

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

  // Cancel the booking
  timeSlots[slotIndex].isBooked = false;
  timeSlots[slotIndex].bookedBy = null;

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: timeSlots[slotIndex]
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available:`);
  console.log(`- GET /slots - Get all time slots`);
  console.log(`- POST /book - Book a slot (requires slotId and name)`);
  console.log(`- POST /cancel - Cancel a booking (requires slotId)`);
});

// Log the initial time slots
console.log('Initial time slots generated:');
console.log(timeSlots.slice(0, 4)); // Show first few slots
console.log(`Total slots: ${timeSlots.length}`);