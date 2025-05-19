# Schedulo Lite - Smart Session Booking System

## Project Overview
Schedulo Lite is a modern, responsive web application for managing time slot bookings. It provides an intuitive interface for users to view, book, and cancel time slots with real-time updates and authentication.

## Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 (React-based framework)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Animation**: Framer Motion for smooth UI transitions
- **State Management**: React Context API for auth state
- **Form Handling**: React Hook Form
- **UI Components**: Custom components with Radix UI primitives

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT-based session management
- **CORS**: Enabled for cross-origin requests
- **Data Storage**: In-memory storage (can be extended to use a database)

## Project Structure

```
├── app/
│   ├── page.tsx              # Main booking page
│   ├── auth/
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   └── layout.tsx           # Root layout
├── components/
│   ├── time-slot-grid.tsx   # Time slot display component
│   ├── booking-modal.tsx    # Booking confirmation modal
│   ├── cancel-modal.tsx     # Cancellation confirmation modal
│   ├── loading-spinner.tsx  # Loading indicator
│   ├── theme-toggle.tsx     # Dark/light mode toggle
│   └── user-profile.tsx     # User profile component
├── contexts/
│   └── auth-context.tsx     # Authentication context
├── server.js                # Backend server
└── package.json            # Project dependencies
```

## Data Flow

### Authentication Flow
1. User registers/logs in through `/auth/register` or `/auth/login`
2. Backend validates credentials and returns JWT token
3. Token is stored in auth context and used for subsequent requests
4. Protected routes check for valid token

### Booking Flow
1. User views available time slots on the main page
2. Clicks "Book" on an available slot
3. System checks authentication status
4. If authenticated, shows booking modal
5. On confirmation, sends booking request to backend
6. Backend validates and processes booking
7. Frontend updates UI with new slot status

### Cancellation Flow
1. User clicks "Cancel" on their booked slot
2. System verifies slot ownership
3. Shows cancellation confirmation modal
4. On confirmation, sends cancellation request
5. Backend processes cancellation
6. Frontend updates UI

## API Endpoints

### Authentication
- `POST /register` - Register new user
  - Body: `{ name, email, password }`
  - Returns: `{ user, token }`

- `POST /login` - User login
  - Body: `{ email, password }`
  - Returns: `{ user, token }`

- `GET /me` - Get current user info
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ user }`

- `POST /logout` - User logout
  - Headers: `Authorization: Bearer <token>`

### Booking Management
- `GET /slots` - Get all time slots
  - Returns: `{ data: TimeSlot[] }`

- `POST /book` - Book a slot
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ slotId }`
  - Returns: `{ data: TimeSlot }`

- `POST /cancel` - Cancel a booking
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ slotId }`
  - Returns: `{ data: TimeSlot }`

## Data Structures

### TimeSlot
```typescript
interface TimeSlot {
  id: string;          // Unique identifier
  time: string;        // Formatted time (e.g., "9:00 AM")
  isBooked: boolean;   // Booking status
  bookedBy: string;    // Name of person who booked
  bookedById: string;  // ID of user who booked
}
```

### User
```typescript
interface User {
  id: string;          // Unique identifier
  name: string;        // User's name
  email: string;       // User's email
  createdAt: string;   // Account creation timestamp
}
```

### Session
```typescript
interface Session {
  token: string;       // JWT token
  userId: string;      // Associated user ID
  createdAt: string;   // Session creation timestamp
}
```

## Components

### TimeSlotGrid
- Displays available and booked time slots
- Handles booking and cancellation actions
- Responsive grid layout
- Visual indicators for slot status

### BookingModal
- Confirmation dialog for booking
- Form validation
- Error handling
- Success feedback

### CancelModal
- Confirmation dialog for cancellation
- Ownership verification
- Success feedback

### ThemeToggle
- Dark/light mode switching
- Persistent theme preference
- Smooth transition animations

### UserProfile
- Displays user information
- Logout functionality
- Authentication status

## State Management

### Auth Context
- Manages authentication state
- Provides user information
- Handles token storage
- Exposes login/logout functions

### Local State
- Time slots data
- Selected slot
- Modal visibility
- Loading states
- Error handling
- Notifications

## Security Features
- JWT-based authentication
- Protected API endpoints
- Input validation
- CORS configuration
- Secure password handling (in-memory)

## Future Improvements
1. Database integration (MongoDB/PostgreSQL)
2. Email notifications
3. Admin dashboard
4. Recurring bookings
5. Calendar integration
6. User roles and permissions
7. Analytics and reporting
8. Mobile app version

## Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Start backend: `node server.js`
4. Start frontend: `npm run dev`
5. Access application: `http://localhost:3000`

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001
```

## Data Storage

### Current Implementation (Development)
The application currently uses in-memory storage for development purposes:
```javascript
// In-memory storage
let timeSlots = generateTimeSlots();
let users = [];
let currentSessions = [];
```

Limitations of current storage:
- Data is lost on server restart
- No data persistence
- Not suitable for production
- No data backup
- Limited scalability

### Recommended Production Storage

#### 1. Database (Primary Storage)
Recommended: MongoDB or PostgreSQL

MongoDB Schema Example:
```javascript
// Users Collection
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  createdAt: Date
}

// TimeSlots Collection
{
  _id: ObjectId,
  time: String,
  isBooked: Boolean,
  bookedBy: ObjectId (ref: Users),
  bookedAt: Date
}

// Sessions Collection
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  token: String,
  createdAt: Date,
  expiresAt: Date
}
```

PostgreSQL Schema Example:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE time_slots (
  id SERIAL PRIMARY KEY,
  time VARCHAR(50) NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_by INTEGER REFERENCES users(id),
  booked_at TIMESTAMP
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);
```

#### 2. Cache Layer (Optional)
For better performance, implement Redis:
- Store active sessions
- Cache frequently accessed time slots
- Rate limiting
- Real-time updates

#### 3. File Storage (Optional)
For additional data:
- User avatars
- Booking attachments
- System logs

### Data Migration Plan
1. Create database schemas
2. Implement database connection
3. Create data access layer (DAL)
4. Migrate in-memory data to database
5. Update API endpoints to use database
6. Implement data validation
7. Add data backup strategy

### Data Backup Strategy
1. Regular database backups
2. Point-in-time recovery
3. Backup verification
4. Disaster recovery plan 