"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Plus, Calendar, BarChart3, Users } from "lucide-react"
import LeaveApplicationForm from "@/components/leave-application-form"
import LeaveApplicationsList from "@/components/leave-applications-list"
import LeaveBalanceCard from "@/components/leave-balance-card"
import LeaveCalendar from "@/components/leave-calendar"
import MonthlyLeaveTracking from "@/components/monthly-leave-tracking"
import LoadingSpinner from "@/components/loading-spinner"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import {
  getLeaveApplications,
  getLeaveBalance,
  applyForLeave,
  approveLeave,
  rejectLeave
} from "@/lib/firebase-leaves"

export default function LeaveManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [leaveApplications, setLeaveApplications] = useState([])
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log("Auth state:", { user: !!user, isLoading })
    if (!user && !isLoading) {
      console.log("Redirecting to login...")
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Fetch data when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log("User found, fetching leave data...")
      fetchLeaveData()
    }
  }, [user])

  const fetchLeaveData = async () => {
    if (!user) return

    try {
      console.log("Fetching leave data...")
      setIsDataLoading(true)

      // Fetch leave applications
      const applications = await getLeaveApplications(user)
      setLeaveApplications(applications)

      // Only fetch leave balance for teachers
      if (user.role === 'teacher') {
        const balance = await getLeaveBalance(user.id)
        setLeaveBalance(balance)
        console.log("Leave data fetched:", { applications: applications.length, balance: !!balance })
      } else {
        console.log("Leave data fetched:", { applications: applications.length, userRole: user.role })
      }
    } catch (error) {
      console.error("Error fetching leave data:", error)
      toast.error("Failed to load leave data")
    } finally {
      setIsDataLoading(false)
    }
  }

  const handleLeaveApplication = async (leaveData: any) => {
    if (!user) return

    try {
      setIsSubmitting(true)

      await applyForLeave(
        user.id,
        leaveData.startDate,
        leaveData.endDate,
        leaveData.leaveType,
        leaveData.reason,
        leaveData.attachments || []
      )

      toast.success("Leave application submitted successfully!")
      setActiveTab('applications')
      await fetchLeaveData() // Refresh data
    } catch (error: any) {
      console.error("Error submitting leave application:", error)
      toast.error(error.message || "Failed to submit leave application")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveLeave = async (leaveId: string, comments?: string) => {
    if (!user) return

    try {
      await approveLeave(leaveId, user.id, comments || '')
      toast.success("Leave application approved successfully!")
      await fetchLeaveData() // Refresh data
    } catch (error: any) {
      console.error("Error approving leave:", error)
      toast.error(error.message || "Failed to approve leave")
    }
  }

  const handleRejectLeave = async (leaveId: string, comments?: string) => {
    if (!user) return

    try {
      await rejectLeave(leaveId, user.id, comments || '')
      toast.success("Leave application rejected")
      await fetchLeaveData() // Refresh data
    } catch (error: any) {
      console.error("Error rejecting leave:", error)
      toast.error(error.message || "Failed to reject leave")
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    ...(user?.role === 'teacher' ? [{ id: 'apply', label: 'Apply Leave', icon: Plus }] : []),
    { id: 'applications', label: isAdmin() ? 'Leave Applications' : 'My Applications', icon: Calendar },
    ...(isAdmin() ? [
      { id: 'calendar', label: 'Leave Calendar', icon: Calendar },
      { id: 'tracking', label: 'Monthly Tracking', icon: BarChart3 }
    ] : [])
  ]

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log("Showing loading spinner...")
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Initializing application...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            If this takes too long, try <a href="/debug" className="text-blue-600 hover:underline">debugging</a>
          </p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    console.log("No user, should redirect to login...")
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting to login...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            If you're not redirected, <a href="/auth/login" className="text-blue-600 hover:underline">click here</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <motion.header
        className="bg-white dark:bg-gray-800 shadow"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🎓 College Leave Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Welcome, {user.name} ({user.role === 'admin' ? 'HOD/Principal' : 'Teacher'})
                {user.role === 'teacher' && ` - ${user.department}`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          className="px-4 py-6 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Navigation Tabs */}
          <motion.div
            className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {user?.role === 'teacher' ? (
                    // Teacher Dashboard
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <LeaveApplicationsList
                          applications={leaveApplications.slice(0, 5)} // Show recent applications
                          onApprove={handleApproveLeave}
                          onReject={handleRejectLeave}
                        />
                      </div>
                      <div>
                        {leaveBalance && <LeaveBalanceCard balance={leaveBalance} />}
                      </div>
                    </div>
                  ) : (
                    // Admin Dashboard
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <LeaveCalendar applications={leaveApplications} isLoading={isDataLoading} />
                        <MonthlyLeaveTracking applications={leaveApplications} isLoading={isDataLoading} />
                      </div>
                      <LeaveApplicationsList
                        applications={leaveApplications.slice(0, 5)} // Show recent applications
                        onApprove={handleApproveLeave}
                        onReject={handleRejectLeave}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'apply' && (
                <LeaveApplicationForm
                  onSubmit={handleLeaveApplication}
                  isLoading={isSubmitting}
                />
              )}

              {activeTab === 'applications' && (
                <LeaveApplicationsList
                  applications={leaveApplications}
                  onApprove={handleApproveLeave}
                  onReject={handleRejectLeave}
                />
              )}

              {activeTab === 'calendar' && isAdmin() && (
                <LeaveCalendar applications={leaveApplications} isLoading={isDataLoading} />
              )}

              {activeTab === 'tracking' && isAdmin() && (
                <MonthlyLeaveTracking applications={leaveApplications} isLoading={isDataLoading} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className="bg-white dark:bg-gray-800 shadow-inner mt-8 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            🎓 College Leave Management System — Streamline your leave approval process
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
