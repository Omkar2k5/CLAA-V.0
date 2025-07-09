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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {applications.map((application) => (
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
              <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                <button
                  onClick={() => handleAction(application.id, 'approve')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(application.id, 'reject')}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
