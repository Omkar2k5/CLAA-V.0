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
    console.log("Setting up Firebase auth listener...")

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Auth timeout reached, setting loading to false")
      setIsLoading(false)
    }, 5000) // 5 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log("Auth state changed:", firebaseUser ? "User signed in" : "User signed out")
        clearTimeout(timeoutId) // Clear timeout since we got a response
        setError(null)

        if (firebaseUser) {
          // User is signed in, get user data from Firestore
          console.log("Fetching user data for:", firebaseUser.uid)
          const userData = await getUserData(firebaseUser.uid)
          console.log("User data fetched:", userData)
          setUser(userData)
        } else {
          // User is signed out
          console.log("No user signed in")
          setUser(null)
        }
      } catch (err: any) {
        console.error("Auth state change error:", err)
        setError(err.message || "Authentication error")
        setUser(null)
      } finally {
        console.log("Setting loading to false")
        setIsLoading(false)
      }
    })

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up auth listener")
      clearTimeout(timeoutId)
      unsubscribe()
    }
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
        role as 'teacher' | 'admin',
        department,
        employeeId
      )

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