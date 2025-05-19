"use client"

import { motion } from "framer-motion"
import { User, Check } from "lucide-react"

interface TimeSlotProps {
  slot: {
    id: string
    time: string
    isBooked: boolean
    bookedBy: string | null
  }
  onBook: () => void
  onCancel: () => void
  index: number
}

export default function TimeSlot({ slot, onBook, onCancel, index }: TimeSlotProps) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: index * 0.03,
      },
    },
  }

  return (
    <motion.div
      variants={item}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      className={`
        border rounded-lg p-4 shadow-sm transition-all duration-300
        ${slot.isBooked 
          ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800" 
          : "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <div
            className={`
            mt-1 w-6 h-6 rounded-full flex items-center justify-center
            ${slot.isBooked 
              ? "bg-red-100 dark:bg-red-800" 
              : "bg-green-100 dark:bg-green-800"}
          `}
          >
            {slot.isBooked 
              ? <User className="h-3 w-3 text-red-600 dark:text-red-300" /> 
              : <Check className="h-3 w-3 text-green-600 dark:text-green-300" />}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{slot.time}</h3>
            <p className={`text-sm ${
              slot.isBooked 
                ? "text-red-600 dark:text-red-300" 
                : "text-green-600 dark:text-green-300"
            }`}>
              {slot.isBooked ? `Booked by: ${slot.bookedBy}` : "Available"}
            </p>
          </div>
        </div>

        {slot.isBooked ? (
          <motion.button
            onClick={onCancel}
            className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        ) : (
          <motion.button
            onClick={onBook}
            className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-700 transition-colors text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
