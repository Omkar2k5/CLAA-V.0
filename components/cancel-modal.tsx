"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, AlertTriangle, User, Clock } from "lucide-react"

interface CancelModalProps {
  onClose: () => void
  onConfirm: () => void
  slot: {
    id: string
    time: string
    bookedBy: string
  }
}

export default function CancelModal({ onClose, onConfirm, slot }: CancelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = () => {
    setIsSubmitting(true)
    onConfirm()
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium text-gray-800">Cancel Booking</h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="bg-red-50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Are you sure you want to cancel this booking?</p>
              <p className="text-red-600 text-sm mt-1">This action cannot be undone.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{slot?.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Booked by {slot?.bookedBy}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm"
              whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              Keep Booking
            </motion.button>
            <motion.button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium text-sm disabled:opacity-50"
              whileHover={{ scale: 1.02, backgroundColor: "#ef4444" }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cancelling..." : "Cancel Booking"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
