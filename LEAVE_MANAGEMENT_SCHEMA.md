# College Leave Management System - Database Schema

## Overview
This document outlines the database schema for transforming the time slot booking system into a college leave approval system.

## Data Models

### 1. Users (Enhanced)
```javascript
{
  id: string,                    // Unique identifier
  name: string,                  // Full name
  email: string,                 // Email address (unique)
  password: string,              // Hashed password
  role: 'teacher' | 'hod' | 'principal',  // User role
  department: string,            // Department name
  employeeId: string,           // Employee ID (unique)
  joinDate: string,             // Date of joining (ISO string)
  totalLeaves: number,          // Total annual leaves allocated
  createdAt: string             // Account creation date
}
```

### 2. Leave Applications
```javascript
{
  id: string,                   // Unique identifier
  teacherId: string,            // Reference to teacher user
  startDate: string,            // Leave start date (ISO string)
  endDate: string,              // Leave end date (ISO string)
  leaveType: 'casual' | 'sick' | 'emergency' | 'maternity' | 'other',
  reason: string,               // Reason for leave
  status: 'pending' | 'approved' | 'rejected',
  appliedDate: string,          // Date when leave was applied
  reviewedBy: string | null,    // ID of HOD/Principal who reviewed
  reviewedDate: string | null,  // Date when reviewed
  reviewComments: string | null, // Comments from reviewer
  daysCount: number,            // Number of leave days
  attachments: string[],        // File attachments (if any)
  createdAt: string,            // Application creation date
  updatedAt: string             // Last update date
}
```

### 3. Leave Balance
```javascript
{
  id: string,                   // Unique identifier
  teacherId: string,            // Reference to teacher user
  year: number,                 // Calendar year
  totalLeaves: number,          // Total leaves allocated for the year
  casualLeaves: {
    total: number,              // Total casual leaves
    taken: number,              // Casual leaves taken
    remaining: number           // Remaining casual leaves
  },
  sickLeaves: {
    total: number,              // Total sick leaves
    taken: number,              // Sick leaves taken
    remaining: number           // Remaining sick leaves
  },
  emergencyLeaves: {
    total: number,              // Total emergency leaves
    taken: number,              // Emergency leaves taken
    remaining: number           // Remaining emergency leaves
  },
  otherLeaves: {
    total: number,              // Other types of leaves
    taken: number,              // Other leaves taken
    remaining: number           // Remaining other leaves
  },
  lastUpdated: string           // Last update timestamp
}
```

### 4. Leave Types Configuration
```javascript
{
  id: string,                   // Unique identifier
  name: string,                 // Leave type name
  code: string,                 // Short code (e.g., 'CL', 'SL')
  description: string,          // Description
  maxDaysPerApplication: number, // Max days per single application
  requiresApproval: boolean,    // Whether approval is needed
  canCarryForward: boolean,     // Can be carried to next year
  isActive: boolean,            // Whether this type is active
  createdAt: string             // Creation date
}
```

### 5. Department Configuration
```javascript
{
  id: string,                   // Unique identifier
  name: string,                 // Department name
  code: string,                 // Department code
  hodId: string | null,         // Current HOD user ID
  isActive: boolean,            // Whether department is active
  createdAt: string             // Creation date
}
```

## API Endpoints Design

### Authentication Endpoints
- `POST /register` - Register new user (with role)
- `POST /login` - User login
- `GET /me` - Get current user info
- `POST /logout` - User logout

### Leave Application Endpoints
- `GET /leaves` - Get leave applications (filtered by role)
- `POST /leaves/apply` - Apply for leave
- `PUT /leaves/:id/approve` - Approve leave (HOD/Principal only)
- `PUT /leaves/:id/reject` - Reject leave (HOD/Principal only)
- `GET /leaves/:id` - Get specific leave application
- `PUT /leaves/:id` - Update leave application (if pending)
- `DELETE /leaves/:id` - Cancel leave application (if pending)

### Leave Balance Endpoints
- `GET /balance` - Get current user's leave balance
- `GET /balance/:teacherId` - Get specific teacher's balance (HOD/Principal only)
- `PUT /balance/:teacherId` - Update teacher's leave balance (Principal only)

### Dashboard Endpoints
- `GET /dashboard/teacher` - Teacher dashboard data
- `GET /dashboard/admin` - HOD/Principal dashboard data
- `GET /reports/leaves` - Leave reports (HOD/Principal only)
- `GET /reports/department` - Department-wise leave reports

### User Management Endpoints
- `GET /users` - Get all users (HOD/Principal only)
- `PUT /users/:id/role` - Update user role (Principal only)
- `GET /departments` - Get all departments

## Default Leave Allocation

### Standard Leave Types
1. **Casual Leave**: 12 days per year
2. **Sick Leave**: 10 days per year  
3. **Emergency Leave**: 5 days per year
4. **Maternity Leave**: 90 days (when applicable)

### Role-Based Permissions
- **Teachers**: Apply for leaves, view own balance and history
- **HOD**: Approve/reject leaves for their department, view department reports
- **Principal**: Approve/reject all leaves, manage users, view all reports

## Data Validation Rules

### Leave Application Rules
- Start date cannot be in the past
- End date must be after start date
- Cannot apply for more days than available balance
- Reason is mandatory for all leave types
- Medical certificate required for sick leave > 3 days

### User Registration Rules
- Email must be unique
- Employee ID must be unique
- Role must be valid (teacher/hod/principal)
- Department must exist

## Initial Data Setup

### Default Users
1. **Principal**: Full system access
2. **Sample HOD**: Department head access
3. **Sample Teachers**: Basic teacher access

### Default Departments
- Computer Science
- Mathematics  
- Physics
- Chemistry
- English

This schema provides a solid foundation for the leave management system with proper role-based access control and comprehensive leave tracking.
