"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import {
  registerUser,
  signInUser,
  signOutUser,
  getUserData,
  isAdmin as checkIsAdmin,
  createLeaveBalance,
  type User
} from "@/lib/firebase-auth"

// Types are now imported from firebase-auth

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string, department: string, employeeId: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  isAdmin: () => boolean
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true)
        setError(null)

        if (firebaseUser) {
          // User is signed in, get user data from Firestore
          const userData = await getUserData(firebaseUser.uid)
          setUser(userData)
        } else {
          // User is signed out
          setUser(null)
        }
      } catch (err: any) {
        console.error("Auth state change error:", err)
        setError(err.message || "Authentication error")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const userData = await signInUser(email, password)
      setUser(userData)
    } catch (err: any) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string, role: string, department: string, employeeId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const userData = await registerUser(
        name,
        email,
        password,
        role as 'teacher' | 'hod' | 'principal',
        department,
        employeeId
      )

      // Create leave balance for the new user
      await createLeaveBalance(userData.id, userData.totalLeaves)

      setUser(userData)
    } catch (err: any) {
      setError(err.message || "Registration failed")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true)
      await signOutUser()
      setUser(null)
    } catch (err: any) {
      setError(err.message || "Logout failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Clear error
  const clearError = () => setError(null)

  // Check if current user is admin (HOD or Principal)
  const isAdmin = () => {
    return checkIsAdmin(user)
  }

  // Context value
  const value = {
    user,
    token: null, // No longer using tokens with Firebase Auth
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    isAdmin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}