"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DebugPage() {
  const { user, isLoading, error } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [leaveApplications, setLeaveApplications] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    setDebugInfo({
      timestamp: new Date().toISOString(),
      user: user ? { id: user.id, name: user.name, role: user.role, department: user.department } : null,
      isLoading,
      error,
      hasFirebase: typeof window !== 'undefined' && window.firebase !== undefined,
    })

    if (user) {
      fetchDebugData()
    }
  }, [user, isLoading, error])

  const fetchDebugData = async () => {
    try {
      // Fetch all leave applications
      const leaveAppsSnapshot = await getDocs(collection(db, 'leaveApplications'))
      const apps = leaveAppsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setLeaveApplications(apps)

      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching debug data:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Debug Information
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
            <p><strong>User:</strong> {user ? "Authenticated" : "Not authenticated"}</p>
            <p><strong>Error:</strong> {error || "None"}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Details</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Department:</strong> {user.department}</p>
            </div>
          ) : (
            <p>No user data available</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Leave Applications ({leaveApplications.length})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {leaveApplications.map((app, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
                <div><strong>ID:</strong> {app.id}</div>
                <div><strong>Teacher ID:</strong> {app.teacherId}</div>
                <div><strong>Teacher Name:</strong> {app.teacherName || 'Not set'}</div>
                <div><strong>Department:</strong> {app.teacherDepartment || 'Not set'}</div>
                <div><strong>Status:</strong> {app.status}</div>
                <div><strong>Leave Type:</strong> {app.leaveType}</div>
                <div><strong>Applied Date:</strong> {app.appliedDate}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {users.map((user, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Role:</strong> {user.role}</div>
                <div><strong>Department:</strong> {user.department}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
