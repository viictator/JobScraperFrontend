'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const Navbar = () => {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    window.location.replace('/login')
  }

  // Toggle dark mode globally
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev
      document.documentElement.classList.toggle('dark', newMode)
      localStorage.setItem('darkMode', newMode)
      return newMode
    })
  }

  // Initialize login state and dark mode
  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    setLoggedIn(!!token)

    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    document.documentElement.classList.toggle('dark', savedDarkMode)
  }, [])

  if (!loggedIn) return null

  const mainNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Profile', href: '/profile' },
  ]

  return (
    <nav className="fixed top-0 left-0 z-50 w-full backdrop-blur-md bg-[var(--popover)]/80 py-4 px-6 flex items-center justify-between border-b border-[var(--border)] transition-colors">
      
      {/* Left: Logo */}
      <div className="text-xl font-bold text-[var(--foreground)]">JobGen</div>

      {/* Center: Main nav */}
      <ul className="flex gap-6">
        {mainNavItems.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`text-[var(--foreground)] hover:text-[var(--foreground)]/80 transition-colors ${
                pathname === item.href ? 'underline' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right: Logout + Dark Mode */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="text-[var(--foreground)] hover:text-[var(--foreground)]/80 font-semibold transition-colors"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button
          onClick={handleLogout}
          className="text-[var(--foreground)] hover:text-[var(--foreground)]/80 font-semibold transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
