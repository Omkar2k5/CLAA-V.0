"use client"

import { motion } from "framer-motion"
import { Calendar, TrendingDown, TrendingUp, Clock } from "lucide-react"

interface LeaveBalance {
  id: string
  teacherId: string
  year: number
  totalLeaves: number
  casualLeaves: {
    total: number
    taken: number
    remaining: number
  }
  sickLeaves: {
    total: number
    taken: number
    remaining: number
  }
  emergencyLeaves: {
    total: number
    taken: number
    remaining: number
  }
  otherLeaves: {
    total: number
    taken: number
    remaining: number
  }
  lastUpdated: string
}

interface LeaveBalanceCardProps {
  balance: LeaveBalance
  isLoading?: boolean
}

export default function LeaveBalanceCard({ balance, isLoading = false }: LeaveBalanceCardProps) {
  const leaveCategories = [
    {
      name: 'Casual Leave',
      code: 'CL',
      data: balance.casualLeaves,
      color: 'blue',
      icon: Calendar
    },
    {
      name: 'Sick Leave',
      code: 'SL',
      data: balance.sickLeaves,
      color: 'red',
      icon: TrendingDown
    },
    {
      name: 'Emergency Leave',
      code: 'EL',
      data: balance.emergencyLeaves,
      color: 'orange',
      icon: Clock
    },
    {
      name: 'Other Leave',
      code: 'OL',
      data: balance.otherLeaves,
      color: 'purple',
      icon: TrendingUp
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, any> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-600 dark:text-blue-400',
        progress: 'bg-blue-600'
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/30',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400',
        progress: 'bg-red-600'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/30',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-800 dark:text-orange-200',
        icon: 'text-orange-600 dark:text-orange-400',
        progress: 'bg-orange-600'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-800 dark:text-purple-200',
        icon: 'text-purple-600 dark:text-purple-400',
        progress: 'bg-purple-600'
      }
    }
    return colors[color] || colors.blue
  }

  const calculateUsagePercentage = (taken: number, total: number) => {
    return total > 0 ? (taken / total) * 100 : 0
  }

  const totalTaken = leaveCategories.reduce((sum, category) => sum + category.data.taken, 0)
  const totalRemaining = leaveCategories.reduce((sum, category) => sum + category.data.remaining, 0)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Leave Balance
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Year {balance.year}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {totalRemaining}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Days Remaining
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Allocated
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {balance.totalLeaves}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Used
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {totalTaken}
          </div>
        </div>
      </div>

      {/* Leave Categories */}
      <div className="space-y-4">
        {leaveCategories.map((category) => {
          const colors = getColorClasses(category.color)
          const usagePercentage = calculateUsagePercentage(category.data.taken, category.data.total)
          const Icon = category.icon

          return (
            <motion.div
              key={category.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`border rounded-lg p-4 ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/50 dark:bg-gray-800/50`}>
                    <Icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${colors.text}`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm opacity-75 ${colors.text}`}>
                      {category.code}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${colors.text}`}>
                    {category.data.remaining}
                  </div>
                  <div className={`text-sm opacity-75 ${colors.text}`}>
                    of {category.data.total}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className={`${colors.text} opacity-75`}>
                    Used: {category.data.taken}
                  </span>
                  <span className={`${colors.text} opacity-75`}>
                    {usagePercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-white/50 dark:bg-gray-800/50 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-2 rounded-full ${colors.progress}`}
                  />
                </div>
              </div>

              {/* Status */}
              <div className={`text-xs ${colors.text} opacity-75`}>
                {category.data.remaining === 0 ? (
                  <span className="font-medium">⚠️ No leaves remaining</span>
                ) : category.data.remaining <= 2 ? (
                  <span className="font-medium">⚠️ Low balance</span>
                ) : (
                  <span>✅ Good balance</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Last Updated */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date(balance.lastUpdated).toLocaleString()}
        </p>
      </div>
    </motion.div>
  )
}
