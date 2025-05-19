"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Clock, User } from "lucide-react"

interface BookingModalProps {
  onClose: () => void
  onConfirm: (name: string) => void
  slot: {
    id: string
    time: string
  }
}

export default function BookingModal({ onClose, onConfirm, slot }: BookingModalProps) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    setIsSubmitting(true)
    onConfirm(name)
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
            <h3 className="text-xl font-medium text-gray-800">Book Time Slot</h3>
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

          <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-blue-700">{slot?.time}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError("")
                  }}
                  className={`
                    w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-1 outline-none transition-all
                    ${error ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}
                  `}
                  placeholder="Enter your name"
                  autoFocus
                  disabled={isSubmitting}
                />
                <User className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
              </div>
              {error && (
                <motion.p
                  className="mt-2 text-sm text-red-500"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
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
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm disabled:opacity-50"
                whileHover={{ scale: 1.02, backgroundColor: "#3b82f6" }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
