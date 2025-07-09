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
  totalMonthlyLeaves: number; // Total leaves allowed per month (5)
  totalTaken: number; // Total leaves taken this month
  totalRemaining: number; // Total leaves remaining this month
  leavesByType: {
    casual: number;
    sick: number;
    emergency: number;
    other: number;
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
export const createLeaveBalance = async (teacherId: string, totalMonthlyLeaves: number = 5): Promise<void> => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const balanceId = `${teacherId}_${currentYear}_${currentMonth}`;

  const balance: LeaveBalance = {
    id: balanceId,
    teacherId,
    year: currentYear,
    month: currentMonth,
    totalMonthlyLeaves: 5, // Maximum 5 leaves per month
    totalTaken: 0,
    totalRemaining: 5,
    leavesByType: {
      casual: 0,
      sick: 0,
      emergency: 0,
      other: 0
    },
    lastUpdated: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'leaveBalances', balanceId), balance);
  } catch (error) {
    console.error('Error creating leave balance:', error);
    throw new Error('Failed to create leave balance');
  }
};

// Migrate old leave balance format to new format
const migrateLeaveBalance = async (balanceId: string, oldBalance: any): Promise<void> => {
  try {
    // Check if it's already in new format
    if (oldBalance.totalTaken !== undefined && oldBalance.leavesByType !== undefined) {
      return; // Already migrated
    }

    // Calculate totals from old format
    const casualTaken = oldBalance.casualLeaves?.taken || 0;
    const sickTaken = oldBalance.sickLeaves?.taken || 0;
    const emergencyTaken = oldBalance.emergencyLeaves?.taken || 0;
    const otherTaken = oldBalance.otherLeaves?.taken || 0;

    const totalTaken = casualTaken + sickTaken + emergencyTaken + otherTaken;
    const totalRemaining = 5 - totalTaken;

    const newBalance: Partial<LeaveBalance> = {
      totalMonthlyLeaves: 5,
      totalTaken,
      totalRemaining: Math.max(0, totalRemaining),
      leavesByType: {
        casual: casualTaken,
        sick: sickTaken,
        emergency: emergencyTaken,
        other: otherTaken
      },
      lastUpdated: new Date().toISOString()
    };

    await updateDoc(doc(db, 'leaveBalances', balanceId), newBalance);
    console.log('Migrated leave balance:', balanceId);
  } catch (error) {
    console.error('Error migrating leave balance:', error);
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
      await createLeaveBalance(teacherId, 5); // 5 total monthly leaves
      const newBalanceDoc = await getDoc(doc(db, 'leaveBalances', balanceId));
      return newBalanceDoc.exists() ? { id: newBalanceDoc.id, ...newBalanceDoc.data() } as LeaveBalance : null;
    }

    const balanceData = balanceDoc.data();

    // Check if migration is needed
    if (balanceData.totalTaken === undefined || balanceData.leavesByType === undefined) {
      await migrateLeaveBalance(balanceId, balanceData);
      // Fetch the updated document
      const updatedDoc = await getDoc(doc(db, 'leaveBalances', balanceId));
      return updatedDoc.exists() ? { id: updatedDoc.id, ...updatedDoc.data() } as LeaveBalance : null;
    }

    return { id: balanceDoc.id, ...balanceData } as LeaveBalance;
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

    // Check if user has enough total leave balance (max 5 per month)
    if (balance.totalRemaining < daysCount) {
      throw new Error(`Insufficient leave balance. You have ${balance.totalRemaining} days remaining this month.`);
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
    console.log('getLeaveApplications called for user:', user.role, user.name);
    let querySnapshot;

    if (user.role === 'teacher') {
      // Teachers can only see their own leaves - simple query without orderBy to avoid index issues
      console.log('Fetching applications for teacher:', user.id);
      const q = query(
        collection(db, 'leaveApplications'),
        where('teacherId', '==', user.id)
      );
      querySnapshot = await getDocs(q);
    } else {
      // HODs/Principals can see all leaves - simple query without complex ordering
      console.log('Fetching all applications for admin user');
      querySnapshot = await getDocs(collection(db, 'leaveApplications'));
    }

    console.log('Found', querySnapshot.docs.length, 'leave applications');

    const applications: LeaveApplication[] = [];

    // Get user data for each application to add teacher info
    const userPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const appData = { id: docSnapshot.id, ...docSnapshot.data() } as LeaveApplication;

      // Get teacher info
      console.log('Fetching teacher info for teacherId:', appData.teacherId);
      const teacherDoc = await getDoc(doc(db, 'users', appData.teacherId));
      if (teacherDoc.exists()) {
        const teacherData = teacherDoc.data();
        appData.teacherName = teacherData.name;
        appData.teacherDepartment = teacherData.department;
        console.log('Found teacher:', teacherData.name, 'from', teacherData.department);
      } else {
        console.log('Teacher document not found for ID:', appData.teacherId);
      }

      return appData;
    });

    const applicationsWithTeacherInfo = await Promise.all(userPromises);

    // Sort by applied date in memory to avoid index issues
    applicationsWithTeacherInfo.sort((a, b) =>
      new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    );

    // Admin users can see all applications (no department filtering)
    // Since they are HOD/Principal, they should see all applications across departments
    console.log('Returning', applicationsWithTeacherInfo.length, 'applications for user:', user.role);
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

      // Calculate new values
      const newTotalTaken = balance.totalTaken + leaveData.daysCount;
      const newTotalRemaining = balance.totalRemaining - leaveData.daysCount;
      const newLeavesByType = { ...balance.leavesByType };
      newLeavesByType[leaveData.leaveType] += leaveData.daysCount;

      const updateFields = {
        totalTaken: newTotalTaken,
        totalRemaining: newTotalRemaining,
        [`leavesByType.${leaveData.leaveType}`]: newLeavesByType[leaveData.leaveType],
        lastUpdated: new Date().toISOString()
      };

      await updateDoc(doc(db, 'leaveBalances', balanceId), updateFields);
      console.log('Leave balance updated successfully:', updateFields);
    } else {
      console.error('Leave balance document not found for:', balanceId);
      // Create balance if it doesn't exist
      await createLeaveBalance(leaveData.teacherId, 5);
      // Retry the update
      const newBalanceDoc = await getDoc(doc(db, 'leaveBalances', balanceId));
      if (newBalanceDoc.exists()) {
        const balance = newBalanceDoc.data() as LeaveBalance;
        const updateFields = {
          totalTaken: leaveData.daysCount,
          totalRemaining: 5 - leaveData.daysCount,
          [`leavesByType.${leaveData.leaveType}`]: leaveData.daysCount,
          lastUpdated: new Date().toISOString()
        };
        await updateDoc(doc(db, 'leaveBalances', balanceId), updateFields);
        console.log('Leave balance created and updated:', updateFields);
      }
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
