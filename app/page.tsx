"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TimeSlotGrid from "@/components/time-slot-grid"
import BookingModal from "@/components/booking-modal"
import CancelModal from "@/components/cancel-modal"
import LoadingSpinner from "@/components/loading-spinner"

// API URL - use environment variable or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function BookingPage() {
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch time slots from the API
  useEffect(() => {
    fetchTimeSlots()
  }, [])

  const fetchTimeSlots = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/slots`)

      if (!response.ok) {
        throw new Error(`Failed to fetch slots: ${response.status}`)
      }

      const data = await response.json()
      setTimeSlots(data.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching time slots:", err)
      setError("Failed to load time slots. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookSlot = (slot) => {
    setSelectedSlot(slot)
    setIsBookingModalOpen(true)
  }

  const handleCancelSlot = (slot) => {
    setSelectedSlot(slot)
    setIsCancelModalOpen(true)
  }

  const confirmBooking = async (name) => {
    try {
      setIsBookingModalOpen(false)
      showNotification("Booking in progress...", "info")

      const response = await fetch(`${API_URL}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          name: name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to book slot")
      }

      // Refresh the time slots to get the updated data
      await fetchTimeSlots()
      showNotification(`Successfully booked slot for ${name}`, "success")
    } catch (err) {
      console.error("Error booking slot:", err)
      showNotification(err.message || "Failed to book slot", "error")
    }
  }

  const confirmCancellation = async () => {
    try {
      setIsCancelModalOpen(false)
      showNotification("Cancellation in progress...", "info")

      const response = await fetch(`${API_URL}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking")
      }

      // Refresh the time slots to get the updated data
      await fetchTimeSlots()
      showNotification("Booking has been cancelled", "success")
    } catch (err) {
      console.error("Error cancelling booking:", err)
      showNotification(err.message || "Failed to cancel booking", "error")
    }
  }

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.header
        className="bg-white shadow"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking System</h1>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          className="px-4 py-6 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Available Time Slots</h2>
              <motion.button
                onClick={fetchTimeSlots}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh
              </motion.button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <motion.div
                className="bg-red-50 p-4 rounded-md text-red-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p>{error}</p>
                <motion.button
                  onClick={fetchTimeSlots}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : (
              <TimeSlotGrid timeSlots={timeSlots} onBook={handleBookSlot} onCancel={handleCancelSlot} />
            )}
          </div>
        </motion.div>
      </main>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-md ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
            } text-white`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <BookingModal onClose={() => setIsBookingModalOpen(false)} onConfirm={confirmBooking} slot={selectedSlot} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCancelModalOpen && (
          <CancelModal
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={confirmCancellation}
            slot={selectedSlot}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
