"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

// Mock user for testing
const mockUser = {
  id: "test-user-123",
  name: "Test Teacher",
  email: "test@college.edu",
  role: "teacher" as const,
  department: "Computer Science",
  employeeId: "EMP001",
  joinDate: new Date().toISOString(),
  totalLeaves: 20,
  createdAt: new Date().toISOString()
}

type User = typeof mockUser

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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate loading and set mock user
  useEffect(() => {
    console.log("Using bypass auth context...")
    setTimeout(() => {
      setUser(mockUser)
      setIsLoading(false)
    }, 1000)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setUser(mockUser)
      setIsLoading(false)
    }, 500)
  }

  const register = async (name: string, email: string, password: string, role: string, department: string, employeeId: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setUser({ ...mockUser, name, email, role: role as any, department, employeeId })
      setIsLoading(false)
    }, 500)
  }

  const logout = async () => {
    setUser(null)
  }

  const clearError = () => setError(null)

  const isAdmin = () => {
    return user?.role === 'hod' || user?.role === 'principal'
  }

  const value = {
    user,
    token: null,
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
