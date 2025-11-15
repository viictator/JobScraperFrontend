'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [circlePos, setCirclePos] = useState({ x: 0, y: 0 })

  // Initialize dark mode
  useEffect(() => {
    const saved = localStorage.getItem('darkMode') === 'true'
    setDarkMode(saved)
    document.documentElement.classList.toggle('dark', saved)
    setMounted(true)
  }, [])

  const toggleDarkMode = () => {
    if (!buttonRef.current) return

    // Get button position for the circle origin
    const rect = buttonRef.current.getBoundingClientRect()
    setCirclePos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })

    // Start animation
    setAnimating(true)

    // After animation duration, toggle dark mode
    setTimeout(() => {
      const newMode = !darkMode
      setDarkMode(newMode)
      document.documentElement.classList.toggle('dark', newMode)
      localStorage.setItem('darkMode', newMode)
      setAnimating(false)
    }, 600) // Match the duration below
  }

  if (!mounted) return null

  return (
    <>
      {/* Toggle Button */}
      <button
        ref={buttonRef}
        onClick={toggleDarkMode}
        className="relative w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full p-1 focus:outline-none"
      >
        <div
          className={`w-4 h-4 bg-yellow-400 dark:bg-gray-100 rounded-full shadow-md transform transition-transform duration-300 ${
            darkMode ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>

      {/* Fullscreen Circular Wipe */}
      <AnimatePresence>
        {animating && (
          <motion.div
            key="circle-wipe"
            initial={{ scale: 0 }}
            animate={{ scale: 20 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              top: circlePos.y,
              left: circlePos.x,
            }}
            className="fixed w-6 h-6 bg-[var(--background)] rounded-full -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </>
  )
}
