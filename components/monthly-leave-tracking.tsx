"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, TrendingDown, Users, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface LeaveApplication {
  id: string
  teacherId: string
  teacherName?: string
  teacherDepartment?: string
  startDate: string
  endDate: string
  leaveType: 'casual' | 'sick' | 'emergency' | 'other'
  status: 'pending' | 'approved' | 'rejected'
  daysCount: number
}

interface MonthlyLeaveTrackingProps {
  applications: LeaveApplication[]
  isLoading?: boolean
}

interface MonthlyStats {
  month: string
  year: number
  totalLeaves: number
  approvedLeaves: number
  pendingLeaves: number
  rejectedLeaves: number
  departmentStats: Record<string, number>
  leaveTypeStats: Record<string, number>
  topEmployees: Array<{ name: string; department: string; count: number }>
}

export default function MonthlyLeaveTracking({ applications, isLoading = false }: MonthlyLeaveTrackingProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)

  const leaveTypeColors = {
    casual: 'bg-blue-500',
    sick: 'bg-red-500',
    emergency: 'bg-orange-500',
    other: 'bg-purple-500'
  }

  const leaveTypeLabels = {
    casual: 'Casual Leave',
    sick: 'Sick Leave',
    emergency: 'Emergency Leave',
    other: 'Other Leave'
  }

  useEffect(() => {
    calculateMonthlyStats()
  }, [currentDate, applications])

  const calculateMonthlyStats = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Filter applications for the current month
    const monthlyApplications = applications.filter(app => {
      const appDate = new Date(app.startDate)
      return appDate.getFullYear() === year && appDate.getMonth() === month
    })

    // Calculate basic stats
    const totalLeaves = monthlyApplications.length
    const approvedLeaves = monthlyApplications.filter(app => app.status === 'approved').length
    const pendingLeaves = monthlyApplications.filter(app => app.status === 'pending').length
    const rejectedLeaves = monthlyApplications.filter(app => app.status === 'rejected').length

    // Department-wise stats
    const departmentStats: Record<string, number> = {}
    monthlyApplications.forEach(app => {
      if (app.teacherDepartment) {
        departmentStats[app.teacherDepartment] = (departmentStats[app.teacherDepartment] || 0) + 1
      }
    })

    // Leave type stats
    const leaveTypeStats: Record<string, number> = {}
    monthlyApplications.forEach(app => {
      leaveTypeStats[app.leaveType] = (leaveTypeStats[app.leaveType] || 0) + 1
    })

    // Top employees by leave count
    const employeeStats: Record<string, { name: string; department: string; count: number }> = {}
    monthlyApplications.forEach(app => {
      if (app.teacherName && app.teacherDepartment) {
        const key = app.teacherId
        if (!employeeStats[key]) {
          employeeStats[key] = {
            name: app.teacherName,
            department: app.teacherDepartment,
            count: 0
          }
        }
        employeeStats[key].count += 1
      }
    })

    const topEmployees = Object.values(employeeStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setMonthlyStats({
      month: currentDate.toLocaleDateString('en-US', { month: 'long' }),
      year,
      totalLeaves,
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves,
      departmentStats,
      leaveTypeStats,
      topEmployees
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0
  }

  if (isLoading || !monthlyStats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Monthly Leave Tracking
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-[150px] text-center">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {monthlyStats.month} {monthlyStats.year}
            </span>
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Applications</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{monthlyStats.totalLeaves}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{monthlyStats.approvedLeaves}</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {getPercentage(monthlyStats.approvedLeaves, monthlyStats.totalLeaves)}% of total
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{monthlyStats.pendingLeaves}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                {getPercentage(monthlyStats.pendingLeaves, monthlyStats.totalLeaves)}% of total
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">{monthlyStats.rejectedLeaves}</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {getPercentage(monthlyStats.rejectedLeaves, monthlyStats.totalLeaves)}% of total
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Department-wise Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(monthlyStats.departmentStats).map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{dept}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${getPercentage(count, monthlyStats.totalLeaves)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Leave Type Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Leave Type Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(monthlyStats.leaveTypeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${leaveTypeColors[type as keyof typeof leaveTypeColors]}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {leaveTypeLabels[type as keyof typeof leaveTypeLabels]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${leaveTypeColors[type as keyof typeof leaveTypeColors]}`}
                      style={{ width: `${getPercentage(count, monthlyStats.totalLeaves)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Employees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Most Active Employees
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyStats.topEmployees.map((employee, index) => (
              <div
                key={employee.name}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {employee.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {employee.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {employee.count}
                    </p>
                    <p className="text-xs text-gray-500">
                      leave{employee.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
