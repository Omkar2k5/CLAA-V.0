import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
  department: string;
  employeeId: string;
  joinDate: string;
  totalLeaves: number;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hodId?: string;
  isActive: boolean;
  createdAt: string;
}

// Initialize default departments
export const initializeDefaultDepartments = async () => {
  const departments: Omit<Department, 'id'>[] = [
    { name: 'Computer Science', code: 'CS', isActive: true, createdAt: new Date().toISOString() },
    { name: 'Mathematics', code: 'MATH', isActive: true, createdAt: new Date().toISOString() },
    { name: 'Physics', code: 'PHY', isActive: true, createdAt: new Date().toISOString() },
    { name: 'Chemistry', code: 'CHEM', isActive: true, createdAt: new Date().toISOString() },
    { name: 'English', code: 'ENG', isActive: true, createdAt: new Date().toISOString() }
  ];

  try {
    for (const dept of departments) {
      const deptRef = doc(collection(db, 'departments'));
      await setDoc(deptRef, { ...dept, id: deptRef.id });
    }
    console.log('Default departments initialized');
  } catch (error) {
    console.error('Error initializing departments:', error);
  }
};

// Get all departments
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'departments'));
    const departments: Department[] = [];
    querySnapshot.forEach((doc) => {
      departments.push({ id: doc.id, ...doc.data() } as Department);
    });
    return departments;
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

// Register a new user
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: 'teacher' | 'admin',
  department: string,
  employeeId: string
): Promise<User> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update the user's display name
    await updateProfile(firebaseUser, { displayName: name });

    // Create user document in Firestore
    const userData: User = {
      id: firebaseUser.uid,
      name,
      email,
      role,
      department,
      employeeId,
      joinDate: new Date().toISOString(),
      totalLeaves: role === 'admin' ? 30 : 20,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    return userData;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw new Error(error.message || 'Failed to register user');
  }
};

// Sign in user
export const signInUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Check if user is admin (HOD or Principal)
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};
