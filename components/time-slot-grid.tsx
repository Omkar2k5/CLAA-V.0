"use client"

import { motion } from "framer-motion"
import TimeSlot from "./time-slot"

interface TimeSlotGridProps {
  timeSlots: Array<{
    id: string
    time: string
    isBooked: boolean
    bookedBy: string | null
  }>
  onBook: (slot: any) => void
  onCancel: (slot: any) => void
}

export default function TimeSlotGrid({ timeSlots, onBook, onCancel }: TimeSlotGridProps) {
  if (timeSlots.length === 0) {
    return <div className="text-center py-8 text-gray-500">No time slots available.</div>
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {timeSlots.map((slot, index) => (
        <TimeSlot key={slot.id} slot={slot} onBook={() => onBook(slot)} onCancel={() => onCancel(slot)} index={index} />
      ))}
    </motion.div>
  )
}
