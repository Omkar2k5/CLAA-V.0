"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, User, Clock, X, MapPin } from "lucide-react"

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
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

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
            onClick={() => day.leaves.length > 0 && setSelectedDay(day)}
            className={`
              min-h-[80px] p-2 border border-gray-200 dark:border-gray-600 rounded-lg
              ${day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
              ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
              ${day.leaves.length > 0 ? 'cursor-pointer hover:shadow-md' : ''}
              hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200
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
              {day.leaves.slice(0, 2).map((leave, leaveIndex) => (
                <div
                  key={leaveIndex}
                  className={`
                    text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity
                    ${leaveTypeColors[leave.leaveType]}
                  `}
                  title={`${leave.teacherName} (${leave.teacherDepartment}) - ${leaveTypeLabels[leave.leaveType]} Leave\nDuration: ${leave.daysCount} day${leave.daysCount > 1 ? 's' : ''}\nStatus: ${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate font-medium">
                        {leave.teacherName?.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-xs opacity-75 flex-shrink-0">
                      {leaveTypeLabels[leave.leaveType].charAt(0)}
                    </span>
                  </div>
                  <div className="text-xs opacity-75 truncate">
                    {leave.teacherDepartment}
                  </div>
                </div>
              ))}

              {day.leaves.length > 2 && (
                <div
                  className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  title={`View all ${day.leaves.length} leave applications for this date:\n${day.leaves.map(l => `• ${l.teacherName} (${leaveTypeLabels[l.leaveType]})`).join('\n')}`}
                >
                  +{day.leaves.length - 2} more staff
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

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Leave Details
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedDay.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedDay.leaves.map((leave, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${leaveTypeColors[leave.leaveType]}`}></div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {leave.teacherName}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-3 w-3" />
                              <span>{leave.teacherDepartment}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${leave.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            leave.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}
                        `}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Leave Type:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {leaveTypeLabels[leave.leaveType]}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {leave.daysCount} day{leave.daysCount > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Period:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
