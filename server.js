import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage for leave management system
let users = [];
let currentSessions = []; // Store active sessions
let leaveApplications = [];
let leaveBalances = [];
let departments = [];
let leaveTypes = [];

// Initialize default data
initializeDefaultData();

// Initialize default departments, leave types, and sample data
function initializeDefaultData() {
  // Default departments
  departments = [
    { id: 'dept-1', name: 'Computer Science', code: 'CS', hodId: null, isActive: true, createdAt: new Date().toISOString() },
    { id: 'dept-2', name: 'Mathematics', code: 'MATH', hodId: null, isActive: true, createdAt: new Date().toISOString() },
    { id: 'dept-3', name: 'Physics', code: 'PHY', hodId: null, isActive: true, createdAt: new Date().toISOString() },
    { id: 'dept-4', name: 'Chemistry', code: 'CHEM', hodId: null, isActive: true, createdAt: new Date().toISOString() },
    { id: 'dept-5', name: 'English', code: 'ENG', hodId: null, isActive: true, createdAt: new Date().toISOString() }
  ];

  // Default leave types
  leaveTypes = [
    { id: 'lt-1', name: 'Casual Leave', code: 'CL', description: 'General casual leave', maxDaysPerApplication: 5, requiresApproval: true, canCarryForward: false, isActive: true, createdAt: new Date().toISOString() },
    { id: 'lt-2', name: 'Sick Leave', code: 'SL', description: 'Medical leave', maxDaysPerApplication: 10, requiresApproval: true, canCarryForward: false, isActive: true, createdAt: new Date().toISOString() },
    { id: 'lt-3', name: 'Emergency Leave', code: 'EL', description: 'Emergency situations', maxDaysPerApplication: 3, requiresApproval: true, canCarryForward: false, isActive: true, createdAt: new Date().toISOString() },
    { id: 'lt-4', name: 'Maternity Leave', code: 'ML', description: 'Maternity leave', maxDaysPerApplication: 90, requiresApproval: true, canCarryForward: false, isActive: true, createdAt: new Date().toISOString() }
  ];

  // Create default users
  createDefaultUsers();
}

// Create default users with different roles
function createDefaultUsers() {
  const defaultUsers = [
    {
      name: 'Dr. Principal',
      email: 'principal@college.edu',
      password: 'principal123',
      role: 'principal',
      department: 'Administration',
      employeeId: 'EMP001',
      totalLeaves: 30
    },
    {
      name: 'Prof. John HOD',
      email: 'hod.cs@college.edu',
      password: 'hod123',
      role: 'hod',
      department: 'Computer Science',
      employeeId: 'EMP002',
      totalLeaves: 25
    },
    {
      name: 'Dr. Sarah Teacher',
      email: 'sarah.teacher@college.edu',
      password: 'teacher123',
      role: 'teacher',
      department: 'Computer Science',
      employeeId: 'EMP003',
      totalLeaves: 20
    }
  ];

  defaultUsers.forEach(userData => {
    const user = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      ...userData,
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    users.push(user);

    // Create leave balance for each user
    createLeaveBalance(user.id, user.totalLeaves);
  });

  // Set HOD for Computer Science department
  const csHod = users.find(u => u.role === 'hod' && u.department === 'Computer Science');
  if (csHod) {
    const csDept = departments.find(d => d.name === 'Computer Science');
    if (csDept) {
      csDept.hodId = csHod.id;
    }
  }
}

// Create leave balance for a user
function createLeaveBalance(teacherId, totalLeaves) {
  const currentYear = new Date().getFullYear();
  const balance = {
    id: `balance-${teacherId}-${currentYear}`,
    teacherId,
    year: currentYear,
    totalLeaves,
    casualLeaves: { total: 12, taken: 0, remaining: 12 },
    sickLeaves: { total: 10, taken: 0, remaining: 10 },
    emergencyLeaves: { total: 5, taken: 0, remaining: 5 },
    otherLeaves: { total: Math.max(0, totalLeaves - 27), taken: 0, remaining: Math.max(0, totalLeaves - 27) },
    lastUpdated: new Date().toISOString()
  };
  leaveBalances.push(balance);
  return balance;
}

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

// Helper function to check if user has admin privileges
const isAdmin = (user) => {
  return user.role === 'hod' || user.role === 'principal';
};

// Helper function to calculate days between dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
  return diffDays;
};

// GET /leaves - Get leave applications (filtered by role and permissions)
app.get('/leaves', (req, res) => {
  const auth = authenticateUser(req);

  if (!auth.authenticated) {
    return res.status(401).json({
      success: false,
      message: auth.error
    });
  }

  const { user } = auth;
  let filteredLeaves = [];

  if (user.role === 'teacher') {
    // Teachers can only see their own leaves
    filteredLeaves = leaveApplications.filter(leave => leave.teacherId === user.id);
  } else if (user.role === 'hod') {
    // HODs can see leaves from their department
    const departmentTeachers = users.filter(u => u.department === user.department);
    const teacherIds = departmentTeachers.map(t => t.id);
    filteredLeaves = leaveApplications.filter(leave => teacherIds.includes(leave.teacherId));
  } else if (user.role === 'principal') {
    // Principals can see all leaves
    filteredLeaves = leaveApplications;
  }

  // Add teacher information to each leave
  const leavesWithTeacherInfo = filteredLeaves.map(leave => {
    const teacher = users.find(u => u.id === leave.teacherId);
    return {
      ...leave,
      teacherName: teacher ? teacher.name : 'Unknown',
      teacherDepartment: teacher ? teacher.department : 'Unknown'
    };
  });

  res.json({
    success: true,
    data: leavesWithTeacherInfo
  });
});

// POST /leaves/apply - Apply for leave
app.post('/leaves/apply', (req, res) => {
  const auth = authenticateUser(req);

  if (!auth.authenticated) {
    return res.status(401).json({
      success: false,
      message: auth.error
    });
  }

  const { user } = auth;
  const { startDate, endDate, leaveType, reason, attachments = [] } = req.body;

  // Validate input
  if (!startDate || !endDate || !leaveType || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Start date, end date, leave type, and reason are required'
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be in the past'
    });
  }

  if (end < start) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  // Calculate number of days
  const daysCount = calculateDays(startDate, endDate);

  // Check leave balance
  const currentYear = new Date().getFullYear();
  const userBalance = leaveBalances.find(b => b.teacherId === user.id && b.year === currentYear);

  if (!userBalance) {
    return res.status(400).json({
      success: false,
      message: 'Leave balance not found'
    });
  }

  // Check if user has enough leave balance
  let hasEnoughBalance = false;
  switch (leaveType) {
    case 'casual':
      hasEnoughBalance = userBalance.casualLeaves.remaining >= daysCount;
      break;
    case 'sick':
      hasEnoughBalance = userBalance.sickLeaves.remaining >= daysCount;
      break;
    case 'emergency':
      hasEnoughBalance = userBalance.emergencyLeaves.remaining >= daysCount;
      break;
    default:
      hasEnoughBalance = userBalance.otherLeaves.remaining >= daysCount;
  }

  if (!hasEnoughBalance) {
    return res.status(400).json({
      success: false,
      message: `Insufficient ${leaveType} leave balance`
    });
  }

  // Create leave application
  const leaveApplication = {
    id: `leave-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    teacherId: user.id,
    startDate,
    endDate,
    leaveType,
    reason,
    status: 'pending',
    appliedDate: new Date().toISOString(),
    reviewedBy: null,
    reviewedDate: null,
    reviewComments: null,
    daysCount,
    attachments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  leaveApplications.push(leaveApplication);

  res.json({
    success: true,
    message: 'Leave application submitted successfully',
    data: leaveApplication
  });
});

// PUT /leaves/:id/approve - Approve leave application (HOD/Principal only)
app.put('/leaves/:id/approve', (req, res) => {
  const auth = authenticateUser(req);

  if (!auth.authenticated) {
    return res.status(401).json({
      success: false,
      message: auth.error
    });
  }

  const { user } = auth;
  const { id } = req.params;
  const { comments = '' } = req.body;

  // Check if user has admin privileges
  if (!isAdmin(user)) {
    return res.status(403).json({
      success: false,
      message: 'Only HOD or Principal can approve leaves'
    });
  }

  // Find the leave application
  const leaveIndex = leaveApplications.findIndex(leave => leave.id === id);

  if (leaveIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Leave application not found'
    });
  }

  const leave = leaveApplications[leaveIndex];

  // Check if leave is still pending
  if (leave.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Leave application has already been processed'
    });
  }

  // For HOD, check if the teacher is from their department
  if (user.role === 'hod') {
    const teacher = users.find(u => u.id === leave.teacherId);
    if (!teacher || teacher.department !== user.department) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve leaves for your department'
      });
    }
  }

  // Update leave application
  leaveApplications[leaveIndex] = {
    ...leave,
    status: 'approved',
    reviewedBy: user.id,
    reviewedDate: new Date().toISOString(),
    reviewComments: comments,
    updatedAt: new Date().toISOString()
  };

  // Update leave balance
  const currentYear = new Date().getFullYear();
  const balanceIndex = leaveBalances.findIndex(b => b.teacherId === leave.teacherId && b.year === currentYear);

  if (balanceIndex !== -1) {
    const balance = leaveBalances[balanceIndex];
    switch (leave.leaveType) {
      case 'casual':
        balance.casualLeaves.taken += leave.daysCount;
        balance.casualLeaves.remaining -= leave.daysCount;
        break;
      case 'sick':
        balance.sickLeaves.taken += leave.daysCount;
        balance.sickLeaves.remaining -= leave.daysCount;
        break;
      case 'emergency':
        balance.emergencyLeaves.taken += leave.daysCount;
        balance.emergencyLeaves.remaining -= leave.daysCount;
        break;
      default:
        balance.otherLeaves.taken += leave.daysCount;
        balance.otherLeaves.remaining -= leave.daysCount;
    }
    balance.lastUpdated = new Date().toISOString();
  }

  res.json({
    success: true,
    message: 'Leave application approved successfully',
    data: leaveApplications[leaveIndex]
  });
});

// PUT /leaves/:id/reject - Reject leave application (HOD/Principal only)
app.put('/leaves/:id/reject', (req, res) => {
  const auth = authenticateUser(req);

  if (!auth.authenticated) {
    return res.status(401).json({
      success: false,
      message: auth.error
    });
  }

  const { user } = auth;
  const { id } = req.params;
  const { comments = '' } = req.body;

  // Check if user has admin privileges
  if (!isAdmin(user)) {
    return res.status(403).json({
      success: false,
      message: 'Only HOD or Principal can reject leaves'
    });
  }

  // Find the leave application
  const leaveIndex = leaveApplications.findIndex(leave => leave.id === id);

  if (leaveIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Leave application not found'
    });
  }

  const leave = leaveApplications[leaveIndex];

  // Check if leave is still pending
  if (leave.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Leave application has already been processed'
    });
  }

  // For HOD, check if the teacher is from their department
  if (user.role === 'hod') {
    const teacher = users.find(u => u.id === leave.teacherId);
    if (!teacher || teacher.department !== user.department) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject leaves for your department'
      });
    }
  }

  // Update leave application
  leaveApplications[leaveIndex] = {
    ...leave,
    status: 'rejected',
    reviewedBy: user.id,
    reviewedDate: new Date().toISOString(),
    reviewComments: comments,
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Leave application rejected',
    data: leaveApplications[leaveIndex]
  });
});

// GET /balance - Get current user's leave balance
app.get('/balance', (req, res) => {
  const auth = authenticateUser(req);

  if (!auth.authenticated) {
    return res.status(401).json({
      success: false,
      message: auth.error
    });
  }

  const { user } = auth;
  const currentYear = new Date().getFullYear();
  const balance = leaveBalances.find(b => b.teacherId === user.id && b.year === currentYear);

  if (!balance) {
    return res.status(404).json({
      success: false,
      message: 'Leave balance not found'
    });
  }

  res.json({
    success: true,
    data: balance
  });
});

// GET /departments - Get all departments
app.get('/departments', (req, res) => {
  res.json({
    success: true,
    data: departments
  });
});

// Authentication endpoints
// Register a new user
app.post('/register', (req, res) => {
  const { name, email, password, role = 'teacher', department, employeeId } = req.body;

  // Validate input
  if (!name || !email || !password || !department || !employeeId) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, password, department, and employee ID are required'
    });
  }

  // Validate role
  if (!['teacher', 'hod', 'principal'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be teacher, hod, or principal'
    });
  }

  // Check if email already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }

  // Check if employee ID already exists
  if (users.some(user => user.employeeId === employeeId)) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID already exists'
    });
  }

  // Create new user with a unique ID
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    name,
    email,
    password, // In a real app, this would be hashed
    role,
    department,
    employeeId,
    joinDate: new Date().toISOString(),
    totalLeaves: role === 'principal' ? 30 : role === 'hod' ? 25 : 20,
    createdAt: new Date().toISOString()
  };

  // Add to users array
  users.push(newUser);

  // Create leave balance for the new user
  createLeaveBalance(newUser.id, newUser.totalLeaves);

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
  console.log(`🎓 College Leave Management System is running on port ${PORT}`);
  console.log(`\n📋 API endpoints available:`);
  console.log(`\n🔐 Authentication:`);
  console.log(`- POST /register - Register a new user (with role and department)`);
  console.log(`- POST /login - Login a user`);
  console.log(`- GET /me - Get current user info`);
  console.log(`- POST /logout - Logout user`);
  console.log(`\n📝 Leave Management:`);
  console.log(`- GET /leaves - Get leave applications (filtered by role)`);
  console.log(`- POST /leaves/apply - Apply for leave`);
  console.log(`- PUT /leaves/:id/approve - Approve leave (HOD/Principal only)`);
  console.log(`- PUT /leaves/:id/reject - Reject leave (HOD/Principal only)`);
  console.log(`\n📊 Leave Balance:`);
  console.log(`- GET /balance - Get current user's leave balance`);
  console.log(`\n🏢 Departments:`);
  console.log(`- GET /departments - Get all departments`);

  console.log(`\n👥 Default users created:`);
  console.log(`📧 Principal: principal@college.edu (password: principal123)`);
  console.log(`📧 HOD: hod.cs@college.edu (password: hod123)`);
  console.log(`📧 Teacher: sarah.teacher@college.edu (password: teacher123)`);

  console.log(`\n🏫 Departments initialized: ${departments.length}`);
  console.log(`👤 Users created: ${users.length}`);
  console.log(`📋 Leave types available: ${leaveTypes.length}`);
});