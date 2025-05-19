"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Sun, Moon, Laptop } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md ${
          theme === "light" 
            ? "bg-white text-yellow-500 shadow-sm" 
            : "text-gray-500 dark:text-gray-400"
        }`}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md ${
          theme === "dark" 
            ? "bg-gray-700 text-blue-300 shadow-sm" 
            : "text-gray-500 dark:text-gray-400"
        }`}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md ${
          theme === "system" 
            ? "bg-white dark:bg-gray-700 text-purple-500 shadow-sm" 
            : "text-gray-500 dark:text-gray-400"
        }`}
        aria-label="System preference"
      >
        <Laptop className="h-4 w-4" />
      </motion.button>
    </div>
  )
}