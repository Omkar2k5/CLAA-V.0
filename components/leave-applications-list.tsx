"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LeaveApplication {
  id: string
  teacherId: string
  teacherName?: string
  teacherDepartment?: string
  startDate: string
  endDate: string
  leaveType: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  appliedDate: string
  reviewedBy?: string | null
  reviewedDate?: string | null
  reviewComments?: string | null
  daysCount: number
}

interface LeaveApplicationsListProps {
  applications: LeaveApplication[]
  onApprove?: (id: string, comments?: string) => void
  onReject?: (id: string, comments?: string) => void
  isLoading?: boolean
}

export default function LeaveApplicationsList({
  applications,
  onApprove,
  onReject,
  isLoading = false
}: LeaveApplicationsListProps) {
  const { user, isAdmin } = useAuth()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    }
  }

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      casual: 'Casual Leave',
      sick: 'Sick Leave',
      emergency: 'Emergency Leave',
      other: 'Other Leave'
    }
    return types[type] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    const comments = prompt(`Enter comments for ${action}ing this leave application (optional):`)
    if (action === 'approve' && onApprove) {
      onApprove(id, comments || '')
    } else if (action === 'reject' && onReject) {
      onReject(id, comments || '')
    }
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Leave Applications
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {isAdmin() ? 'No leave applications to review at the moment.' : 'You haven\'t submitted any leave applications yet.'}
        </p>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const approvedApplications = applications.filter(app => app.status === 'approved')
  const rejectedApplications = applications.filter(app => app.status === 'rejected')

  return (
    <div className="space-y-6">
      {/* Admin Status Header */}
      {isAdmin() && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                📋 Admin Dashboard
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                You have administrative privileges to approve/reject leave applications
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-lg">
                <div className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                  {pendingApplications.length}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg">
                <div className="text-lg font-bold text-green-800 dark:text-green-200">
                  {approvedApplications.length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Approved</div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded-lg">
                <div className="text-lg font-bold text-red-800 dark:text-red-200">
                  {rejectedApplications.length}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">Rejected</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
      {/* Sort applications to show pending ones first for admins */}
      {[...applications]
        .sort((a, b) => {
          if (isAdmin()) {
            // For admins, show pending applications first
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
          }
          // Then sort by application date (newest first)
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        })
        .map((application) => (
        <motion.div
          key={application.id}
          variants={item}
          className={`border rounded-lg p-6 shadow-sm transition-all duration-300 hover:shadow-md ${getStatusColor(application.status)}`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Main Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {getStatusIcon(application.status)}
                <div>
                  <h3 className="font-semibold text-lg">
                    {getLeaveTypeLabel(application.leaveType)}
                  </h3>
                  {application.teacherName && (
                    <p className="text-sm opacity-75 flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {application.teacherName} - {application.teacherDepartment}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {formatDate(application.startDate)} - {formatDate(application.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {application.daysCount} day{application.daysCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Reason:</p>
                <p className="text-sm opacity-90 bg-white/50 dark:bg-gray-800/50 p-3 rounded">
                  {application.reason}
                </p>
              </div>

              {application.reviewComments && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Review Comments:
                  </p>
                  <p className="text-sm opacity-90 bg-white/50 dark:bg-gray-800/50 p-3 rounded">
                    {application.reviewComments}
                  </p>
                </div>
              )}

              <div className="text-xs opacity-75">
                Applied on: {formatDate(application.appliedDate)}
                {application.reviewedDate && (
                  <span className="ml-4">
                    Reviewed on: {formatDate(application.reviewedDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {isAdmin() && application.status === 'pending' && (
              <div className="flex flex-col gap-2 min-w-[120px]">
                <div className="bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded text-center">
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    ⏳ Awaiting Review
                  </span>
                </div>
                <button
                  onClick={() => handleAction(application.id, 'approve')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleAction(application.id, 'reject')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  ❌ Reject
                </button>
              </div>
            )}

            {/* Status Display for Non-Pending Applications */}
            {application.status !== 'pending' && (
              <div className="flex flex-col gap-2 min-w-[120px]">
                <div className={`px-3 py-2 rounded-lg text-center ${
                  application.status === 'approved'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}>
                  <span className="text-sm font-medium">
                    {application.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                  </span>
                  {application.reviewedDate && (
                    <div className="text-xs opacity-75 mt-1">
                      {new Date(application.reviewedDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
    </div>
  )
}
