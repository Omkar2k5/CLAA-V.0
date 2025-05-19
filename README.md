# Schedulo Lite - Smart Session Booking System

A modern, responsive web application for managing time slot bookings with real-time updates and authentication.

## Developer Information
- **Name**: Omkar Gondkar
- **Contact**: +91 8855916700
- **Email**: gondkaromkar53@gmail.com
- **LinkedIn**: [Omkar Gondkar](https://linkedin.com/in/og25)

## Features
- 🕒 Time slot management
- 🔐 User authentication
- 🌓 Dark/Light mode
- 📱 Responsive design
- ⚡ Real-time updates
- 🎨 Modern UI with animations

## Demo Video
<video width="100%" controls>
  <source src="https://omkar2k5.github.io/Navikshaa-DevBatlleGround/demovideo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

> **Note**: If the video doesn't play directly in the README, you can [watch it here](https://omkar2k5.github.io/Navikshaa-DevBatlleGround/demovideo.mp4)

## Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Auth**: JWT-based authentication

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/schedulo-lite.git
cd schedulo-lite
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables
```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your configuration
# Required variables:
# - NEXT_PUBLIC_API_URL: Your API URL (default: http://localhost:3001)
# - PORT: Backend server port (default: 3001)
# - JWT_SECRET: Your secret key for JWT
```

4. Start the backend server
```bash
node server.js
```

5. In a new terminal, start the frontend
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user info
- `POST /logout` - User logout

### Booking
- `GET /slots` - Get all time slots
- `POST /book` - Book a slot
- `POST /cancel` - Cancel a booking

## Project Structure
```
├── app/                    # Next.js app directory
├── components/            # React components
├── contexts/             # React contexts
├── server.js             # Backend server
├── env.example           # Example environment variables
└── package.json          # Project dependencies
```

## Security Measures
1. **Authentication & Authorization**
   - JWT-based authentication
   - Secure password hashing
   - Protected API endpoints
   - Role-based access control

2. **Data Protection**
   - Input validation and sanitization
   - CORS configuration
   - Rate limiting
   - XSS protection

3. **API Security**
   - Request validation
   - Error handling
   - Secure headers
   - API key management

4. **Session Management**
   - Secure token storage
   - Token expiration
   - Session invalidation
   - Refresh token rotation

## Future Development
1. **Enhanced Features**
   - Calendar integration
   - Email notifications
   - SMS notifications
   - Recurring bookings
   - Waitlist functionality

2. **Technical Improvements**
   - Database integration (MongoDB/PostgreSQL)
   - Redis caching
   - WebSocket for real-time updates
   - Docker containerization
   - CI/CD pipeline

3. **User Experience**
   - Mobile app development
   - Progressive Web App (PWA)
   - Multi-language support
   - Accessibility improvements
   - Advanced search and filtering

4. **Business Features**
   - Admin dashboard
   - Analytics and reporting
   - Payment integration
   - Custom branding
   - API documentation

5. **Security Enhancements**
   - Two-factor authentication
   - OAuth integration
   - Audit logging
   - Automated security scanning
   - Backup and recovery system

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 