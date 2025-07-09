import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Function to create sample leave applications for testing
export const createSampleLeaveApplications = async () => {
  const sampleApplications = [
    {
      teacherId: "sample-teacher-1",
      teacherName: "John Smith",
      teacherDepartment: "Computer Science",
      startDate: "2024-12-20",
      endDate: "2024-12-22",
      leaveType: "casual",
      reason: "Family wedding ceremony",
      status: "pending",
      appliedDate: new Date().toISOString(),
      daysCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      teacherId: "sample-teacher-2", 
      teacherName: "Sarah Johnson",
      teacherDepartment: "Mathematics",
      startDate: "2024-12-25",
      endDate: "2024-12-25",
      leaveType: "sick",
      reason: "Medical appointment",
      status: "pending",
      appliedDate: new Date().toISOString(),
      daysCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      teacherId: "sample-teacher-3",
      teacherName: "Mike Wilson", 
      teacherDepartment: "Physics",
      startDate: "2024-12-18",
      endDate: "2024-12-19",
      leaveType: "emergency",
      reason: "Family emergency",
      status: "approved",
      appliedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      reviewedDate: new Date().toISOString(),
      reviewComments: "Approved due to emergency nature",
      daysCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  try {
    for (const application of sampleApplications) {
      const docRef = doc(collection(db, 'leaveApplications'));
      await setDoc(docRef, { ...application, id: docRef.id });
    }
    console.log('Sample leave applications created successfully');
  } catch (error) {
    console.error('Error creating sample applications:', error);
  }
};

// Function to create sample users for testing
export const createSampleUsers = async () => {
  const sampleUsers = [
    {
      id: "sample-teacher-1",
      name: "John Smith",
      email: "john.smith@college.edu",
      role: "teacher",
      department: "Computer Science",
      employeeId: "EMP001",
      joinDate: new Date().toISOString(),
      totalLeaves: 20,
      createdAt: new Date().toISOString()
    },
    {
      id: "sample-teacher-2",
      name: "Sarah Johnson", 
      email: "sarah.johnson@college.edu",
      role: "teacher",
      department: "Mathematics",
      employeeId: "EMP002",
      joinDate: new Date().toISOString(),
      totalLeaves: 20,
      createdAt: new Date().toISOString()
    },
    {
      id: "sample-teacher-3",
      name: "Mike Wilson",
      email: "mike.wilson@college.edu", 
      role: "teacher",
      department: "Physics",
      employeeId: "EMP003",
      joinDate: new Date().toISOString(),
      totalLeaves: 20,
      createdAt: new Date().toISOString()
    }
  ];

  try {
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.id), user);
    }
    console.log('Sample users created successfully');
  } catch (error) {
    console.error('Error creating sample users:', error);
  }
};
