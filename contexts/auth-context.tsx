"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Types
type User = {
  id: string
  name: string
  email: string
  role: 'teacher' | 'hod' | 'principal'
  department: string
  employeeId: string
  joinDate: string
  totalLeaves: number
  createdAt: string
}

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
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Fetch user data with token
  const fetchUser = async (authToken: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        // If token is invalid, clear it
        localStorage.removeItem("authToken")
        setToken(null)
        setUser(null)
        throw new Error("Session expired. Please login again.")
      }

      const data = await response.json()
      setUser(data.data)
    } catch (err: any) {
      setError(err.message || "Failed to fetch user data")
    } finally {
      setIsLoading(false)
    }
  }

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Save token and user data
      localStorage.setItem("authToken", data.data.token)
      setToken(data.data.token)
      setUser(data.data.user)
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

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, role, department, employeeId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Save token and user data
      localStorage.setItem("authToken", data.data.token)
      setToken(data.data.token)
      setUser(data.data.user)
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
      
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }
      
      // Clear local storage and state
      localStorage.removeItem("authToken")
      setToken(null)
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
    return user?.role === 'hod' || user?.role === 'principal'
  }

  // Context value
  const value = {
    user,
    token,
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