"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import TimeSlotGrid from "@/components/time-slot-grid"
import BookingModal from "@/components/booking-modal"
import CancelModal from "@/components/cancel-modal"
import LoadingSpinner from "@/components/loading-spinner"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"

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
  const { user, token } = useAuth()
  const router = useRouter()

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
    // Check if user is logged in
    if (!user) {
      showNotification("Please sign in to book a slot", "error")
      router.push("/auth/login")
      return
    }
    
    setSelectedSlot(slot)
    setIsBookingModalOpen(true)
  }

  const handleCancelSlot = (slot) => {
    // Check if user is logged in
    if (!user) {
      showNotification("Please sign in to cancel a booking", "error")
      router.push("/auth/login")
      return
    }
    
    // Check if the slot was booked by the current user
    if (slot.bookedById && slot.bookedById !== user.id) {
      showNotification("You can only cancel your own bookings", "error")
      return
    }
    
    setSelectedSlot(slot)
    setIsCancelModalOpen(true)
  }

  const confirmBooking = async () => {
    try {
      setIsBookingModalOpen(false)
      showNotification("Booking in progress...", "info")

      // Use the authentication token for the request
      const response = await fetch(`${API_URL}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          slotId: selectedSlot.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to book slot")
      }

      // Refresh the time slots to get the updated data
      await fetchTimeSlots()
      showNotification(`Successfully booked slot for ${user.name}`, "success")
    } catch (err) {
      console.error("Error booking slot:", err)
      showNotification(err.message || "Failed to book slot", "error")
    }
  }

  const confirmCancellation = async () => {
    try {
      setIsCancelModalOpen(false)
      showNotification("Cancellation in progress...", "info")

      // Use the authentication token for the request
      const response = await fetch(`${API_URL}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <motion.header
        className="bg-white dark:bg-gray-800 shadow"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedulo Lite</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Smart Session Booking System</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserProfile />
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          className="px-4 py-6 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* App description */}
          <motion.div 
            className="mb-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-6 border border-indigo-100 dark:border-indigo-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Welcome to Schedulo Lite</h2>
            <p className="text-indigo-700 dark:text-indigo-200 mb-3">
              A simple and intuitive booking system that helps you manage your time slots efficiently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-indigo-700 dark:text-indigo-300">View Available Slots</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">Browse through all available time slots</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-indigo-700 dark:text-indigo-300">Book a Session</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">Reserve a time slot by entering your name</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-indigo-700 dark:text-indigo-300">Cancel Bookings</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">Cancel your reservation if plans change</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Available Time Slots</h2>
              <motion.button
                onClick={fetchTimeSlots}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
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
                className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p>{error}</p>
                <motion.button
                  onClick={fetchTimeSlots}
                  className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
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
          
          {/* Help section */}
          <motion.div 
            className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">How to Use Schedulo Lite</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full flex-shrink-0 mt-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-300 text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Browse Available Slots</h3>
                  <p className="text-gray-600 dark:text-gray-400">Look through the grid to find a time that works for you. Green slots are available, red slots are already booked.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full flex-shrink-0 mt-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-300 text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Book a Slot</h3>
                  <p className="text-gray-600 dark:text-gray-400">Click the "Book" button on an available slot, enter your name, and confirm your booking.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full flex-shrink-0 mt-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-300 text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Cancel if Needed</h3>
                  <p className="text-gray-600 dark:text-gray-400">If your plans change, you can cancel your booking by clicking the "Cancel" button on your booked slot.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="bg-white dark:bg-gray-800 shadow-inner mt-8 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Schedulo Lite — A simple and intuitive booking system
          </p>
        </div>
      </motion.footer>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-md ${
              notification.type === "success"
                ? "bg-green-500 dark:bg-green-600"
                : notification.type === "error"
                  ? "bg-red-500 dark:bg-red-600"
                  : "bg-indigo-500 dark:bg-indigo-600"
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
