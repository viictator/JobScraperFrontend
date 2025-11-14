'use client'

import { useEffect, useState } from 'react'

export default function DarkModeProvider({ children }) {
  const [darkModeLoaded, setDarkModeLoaded] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    document.documentElement.classList.toggle('dark', savedDarkMode)
    setDarkModeLoaded(true)
  }, [])

  if (!darkModeLoaded) return null // prevent flashing before dark mode applied

  return <>{children}</>
}
