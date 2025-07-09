"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, FileText, Clock, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LeaveApplicationFormProps {
  onSubmit: (leaveData: any) => void
  isLoading?: boolean
}

export default function LeaveApplicationForm({ onSubmit, isLoading = false }: LeaveApplicationFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual',
    reason: '',
    attachments: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const leaveTypes = [
    { value: 'casual', label: 'Casual Leave', maxDays: 12 },
    { value: 'sick', label: 'Sick Leave', maxDays: 10 },
    { value: 'emergency', label: 'Emergency Leave', maxDays: 5 },
    { value: 'other', label: 'Other Leave', maxDays: 10 }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past'
      }

      if (end < start) {
        newErrors.endDate = 'End date must be after start date'
      }

      // Calculate days and check against leave type limits
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      const selectedLeaveType = leaveTypes.find(lt => lt.value === formData.leaveType)
      
      if (selectedLeaveType && diffDays > selectedLeaveType.maxDays) {
        newErrors.endDate = `${selectedLeaveType.label} cannot exceed ${selectedLeaveType.maxDays} days`
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required'
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    }
    return 0
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Apply for Leave
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Submit your leave application for approval
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.startDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        {/* Days Count Display */}
        {formData.startDate && formData.endDate && (
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                Total Days: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Leave Type
          </label>
          <select
            value={formData.leaveType}
            onChange={(e) => handleInputChange('leaveType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            {leaveTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} (Max: {type.maxDays} days)
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason for Leave
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            placeholder="Please provide a detailed reason for your leave application..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 resize-none ${
              errors.reason ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.reason}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.reason.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setFormData({ startDate: '', endDate: '', leaveType: 'casual', reason: '', attachments: [] })}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
