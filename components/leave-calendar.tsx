"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, User, Clock } from "lucide-react"

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

interface LeaveCalendarProps {
  applications: LeaveApplication[]
  isLoading?: boolean
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  leaves: LeaveApplication[]
}

export default function LeaveCalendar({ applications, isLoading = false }: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])

  const leaveTypeColors = {
    casual: 'bg-blue-500',
    sick: 'bg-red-500',
    emergency: 'bg-orange-500',
    other: 'bg-purple-500'
  }

  const leaveTypeLabels = {
    casual: 'Casual',
    sick: 'Sick',
    emergency: 'Emergency',
    other: 'Other'
  }

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate, applications])

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get first day of the month and last day
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the first day of the calendar (might be from previous month)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Get the last day of the calendar (might be from next month)
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days: CalendarDay[] = []
    const currentDateIter = new Date(startDate)
    
    while (currentDateIter <= endDate) {
      const dayLeaves = getLeavesForDate(currentDateIter)
      
      days.push({
        date: new Date(currentDateIter),
        isCurrentMonth: currentDateIter.getMonth() === month,
        leaves: dayLeaves
      })
      
      currentDateIter.setDate(currentDateIter.getDate() + 1)
    }
    
    setCalendarDays(days)
  }

  const getLeavesForDate = (date: Date): LeaveApplication[] => {
    return applications.filter(app => {
      if (app.status !== 'approved') return false
      
      const startDate = new Date(app.startDate)
      const endDate = new Date(app.endDate)
      
      return date >= startDate && date <= endDate
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

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Leave Calendar
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-[180px] text-center">
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatMonthYear(currentDate)}
            </span>
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          <button
            onClick={goToToday}
            className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Today
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Leave Types:
        </div>
        {Object.entries(leaveTypeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {leaveTypeLabels[type as keyof typeof leaveTypeLabels]}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center font-semibold text-gray-600 dark:text-gray-400 text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`
              min-h-[80px] p-2 border border-gray-200 dark:border-gray-600 rounded-lg
              ${day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
              ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
            `}
          >
            <div className={`
              text-sm font-medium mb-1
              ${day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
              ${isToday(day.date) ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
            `}>
              {day.date.getDate()}
            </div>
            
            {/* Leave indicators */}
            <div className="space-y-1">
              {day.leaves.slice(0, 3).map((leave, leaveIndex) => (
                <div
                  key={leaveIndex}
                  className={`
                    text-xs px-2 py-1 rounded text-white truncate
                    ${leaveTypeColors[leave.leaveType]}
                  `}
                  title={`${leave.teacherName} - ${leaveTypeLabels[leave.leaveType]} Leave`}
                >
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{leave.teacherName?.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
              
              {day.leaves.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                  +{day.leaves.length - 3} more
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            This Month Summary
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Object.entries(leaveTypeLabels).map(([type, label]) => {
            const count = applications.filter(app => 
              app.leaveType === type && 
              app.status === 'approved' &&
              new Date(app.startDate).getMonth() === currentDate.getMonth() &&
              new Date(app.startDate).getFullYear() === currentDate.getFullYear()
            ).length
            
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${leaveTypeColors[type as keyof typeof leaveTypeColors]}`}></div>
                <span className="text-gray-600 dark:text-gray-400">
                  {label}: {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
