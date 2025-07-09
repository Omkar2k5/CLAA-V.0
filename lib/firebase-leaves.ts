import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { User } from "./firebase-auth";

// Types
export interface LeaveApplication {
  id: string;
  teacherId: string;
  teacherName?: string;
  teacherDepartment?: string;
  startDate: string;
  endDate: string;
  leaveType: 'casual' | 'sick' | 'emergency' | 'other';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewComments?: string;
  daysCount: number;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  teacherId: string;
  year: number;
  month: number; // 0-11 (January = 0, December = 11)
  totalMonthlyLeaves: number;
  casualLeaves: {
    total: number;
    taken: number;
    remaining: number;
  };
  sickLeaves: {
    total: number;
    taken: number;
    remaining: number;
  };
  emergencyLeaves: {
    total: number;
    taken: number;
    remaining: number;
  };
  otherLeaves: {
    total: number;
    taken: number;
    remaining: number;
  };
  lastUpdated: string;
}

// Helper function to calculate days between dates
const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Create monthly leave balance for a user
export const createLeaveBalance = async (teacherId: string, totalMonthlyLeaves: number): Promise<void> => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const balanceId = `${teacherId}_${currentYear}_${currentMonth}`;

  const balance: LeaveBalance = {
    id: balanceId,
    teacherId,
    year: currentYear,
    month: currentMonth,
    totalMonthlyLeaves,
    casualLeaves: { total: 3, taken: 0, remaining: 3 }, // 3 casual leaves per month
    sickLeaves: { total: 2, taken: 0, remaining: 2 }, // 2 sick leaves per month
    emergencyLeaves: { total: 1, taken: 0, remaining: 1 }, // 1 emergency leave per month
    otherLeaves: { total: 1, taken: 0, remaining: 1 }, // 1 other leave per month
    lastUpdated: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'leaveBalances', balanceId), balance);
  } catch (error) {
    console.error('Error creating leave balance:', error);
    throw new Error('Failed to create leave balance');
  }
};

// Get leave balance for a user for current month
export const getLeaveBalance = async (teacherId: string): Promise<LeaveBalance | null> => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const balanceId = `${teacherId}_${currentYear}_${currentMonth}`;

  try {
    const balanceDoc = await getDoc(doc(db, 'leaveBalances', balanceId));

    if (!balanceDoc.exists()) {
      // If current month balance doesn't exist, create it
      await createLeaveBalance(teacherId, 7); // 7 total monthly leaves (3+2+1+1)
      const newBalanceDoc = await getDoc(doc(db, 'leaveBalances', balanceId));
      return newBalanceDoc.exists() ? { id: newBalanceDoc.id, ...newBalanceDoc.data() } as LeaveBalance : null;
    }

    return { id: balanceDoc.id, ...balanceDoc.data() } as LeaveBalance;
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    return null;
  }
};

// Apply for leave
export const applyForLeave = async (
  teacherId: string,
  startDate: string,
  endDate: string,
  leaveType: 'casual' | 'sick' | 'emergency' | 'other',
  reason: string,
  attachments: string[] = []
): Promise<LeaveApplication> => {
  try {
    // Calculate days
    const daysCount = calculateDays(startDate, endDate);

    // Check leave balance
    const balance = await getLeaveBalance(teacherId);
    if (!balance) {
      throw new Error('Leave balance not found');
    }

    // Check if user has enough leave balance
    let hasEnoughBalance = false;
    switch (leaveType) {
      case 'casual':
        hasEnoughBalance = balance.casualLeaves.remaining >= daysCount;
        break;
      case 'sick':
        hasEnoughBalance = balance.sickLeaves.remaining >= daysCount;
        break;
      case 'emergency':
        hasEnoughBalance = balance.emergencyLeaves.remaining >= daysCount;
        break;
      default:
        hasEnoughBalance = balance.otherLeaves.remaining >= daysCount;
    }

    if (!hasEnoughBalance) {
      throw new Error(`Insufficient ${leaveType} leave balance`);
    }

    // Create leave application
    const leaveRef = doc(collection(db, 'leaveApplications'));
    const leaveApplication: LeaveApplication = {
      id: leaveRef.id,
      teacherId,
      startDate,
      endDate,
      leaveType,
      reason,
      status: 'pending',
      appliedDate: new Date().toISOString(),
      daysCount,
      attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(leaveRef, leaveApplication);
    return leaveApplication;
  } catch (error: any) {
    console.error('Error applying for leave:', error);
    throw new Error(error.message || 'Failed to apply for leave');
  }
};

// Get leave applications for a user or all (for admins)
export const getLeaveApplications = async (user: User): Promise<LeaveApplication[]> => {
  try {
    let querySnapshot;

    if (user.role === 'teacher') {
      // Teachers can only see their own leaves - simple query without orderBy to avoid index issues
      const q = query(
        collection(db, 'leaveApplications'),
        where('teacherId', '==', user.id)
      );
      querySnapshot = await getDocs(q);
    } else {
      // HODs/Principals can see all leaves - simple query without complex ordering
      querySnapshot = await getDocs(collection(db, 'leaveApplications'));
    }

    const applications: LeaveApplication[] = [];

    // Get user data for each application to add teacher info
    const userPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const appData = { id: docSnapshot.id, ...docSnapshot.data() } as LeaveApplication;

      // Get teacher info
      const teacherDoc = await getDoc(doc(db, 'users', appData.teacherId));
      if (teacherDoc.exists()) {
        const teacherData = teacherDoc.data();
        appData.teacherName = teacherData.name;
        appData.teacherDepartment = teacherData.department;
      }

      return appData;
    });

    const applicationsWithTeacherInfo = await Promise.all(userPromises);

    // Sort by applied date in memory to avoid index issues
    applicationsWithTeacherInfo.sort((a, b) =>
      new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    );

    // For HODs, filter by department after fetching
    if (user.role === 'admin') {
      return applicationsWithTeacherInfo.filter(app =>
        app.teacherDepartment === user.department
      );
    }

    return applicationsWithTeacherInfo;
  } catch (error) {
    console.error('Error fetching leave applications:', error);
    return [];
  }
};

// Approve leave application
export const approveLeave = async (
  leaveId: string,
  reviewerId: string,
  comments: string = ''
): Promise<void> => {
  try {
    // Get the leave application
    const leaveDoc = await getDoc(doc(db, 'leaveApplications', leaveId));
    if (!leaveDoc.exists()) {
      throw new Error('Leave application not found');
    }

    const leaveData = leaveDoc.data() as LeaveApplication;

    // Update leave application
    await updateDoc(doc(db, 'leaveApplications', leaveId), {
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedDate: new Date().toISOString(),
      reviewComments: comments,
      updatedAt: new Date().toISOString()
    });

    // Update leave balance for the month when leave was applied
    const leaveDate = new Date(leaveData.startDate);
    const leaveYear = leaveDate.getFullYear();
    const leaveMonth = leaveDate.getMonth();
    const balanceId = `${leaveData.teacherId}_${leaveYear}_${leaveMonth}`;
    const balanceDoc = await getDoc(doc(db, 'leaveBalances', balanceId));

    if (balanceDoc.exists()) {
      const balance = balanceDoc.data() as LeaveBalance;

      switch (leaveData.leaveType) {
        case 'casual':
          balance.casualLeaves.taken += leaveData.daysCount;
          balance.casualLeaves.remaining -= leaveData.daysCount;
          break;
        case 'sick':
          balance.sickLeaves.taken += leaveData.daysCount;
          balance.sickLeaves.remaining -= leaveData.daysCount;
          break;
        case 'emergency':
          balance.emergencyLeaves.taken += leaveData.daysCount;
          balance.emergencyLeaves.remaining -= leaveData.daysCount;
          break;
        default:
          balance.otherLeaves.taken += leaveData.daysCount;
          balance.otherLeaves.remaining -= leaveData.daysCount;
      }

      balance.lastUpdated = new Date().toISOString();
      await updateDoc(doc(db, 'leaveBalances', balanceId), balance);
    }
  } catch (error: any) {
    console.error('Error approving leave:', error);
    throw new Error(error.message || 'Failed to approve leave');
  }
};

// Reject leave application
export const rejectLeave = async (
  leaveId: string,
  reviewerId: string,
  comments: string = ''
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'leaveApplications', leaveId), {
      status: 'rejected',
      reviewedBy: reviewerId,
      reviewedDate: new Date().toISOString(),
      reviewComments: comments,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error rejecting leave:', error);
    throw new Error(error.message || 'Failed to reject leave');
  }
};
