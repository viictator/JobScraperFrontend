'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// Simple inline SVG icons
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6">
    <circle cx="12" cy="12" r="5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
  </svg>
)

const Navbar = () => {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    window.location.replace('/')
  }

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev
      document.documentElement.classList.toggle('dark', newMode)
      localStorage.setItem('darkMode', newMode)
      return newMode
    })
  }

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    setLoggedIn(!!token)

    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    document.documentElement.classList.toggle('dark', savedDarkMode)
  }, [])

  if (!loggedIn) return null

  const mainNavItems = [
    { label: 'Jobs', href: '/jobs' },
    { label: 'Profile', href: '/profile' },
  ]

  return (
    <nav className="fixed top-0 left-0 z-50 w-full backdrop-blur-md bg-[var(--popover)]/80 py-4 px-6 flex items-center justify-between border-b border-[var(--border)] transition-colors">
      {/* Left: Logo */}
      <div className="text-xl font-bold text-[var(--foreground)]">JobGen</div>

      {/* Center: Main nav + dark mode */}
      <ul className="flex gap-6 items-center">
        {mainNavItems.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`text-[var(--foreground)] hover:text-[var(--foreground)]/80 transition-colors duration-300 ${
                pathname === item.href ? 'underline' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}

        {/* Dark Mode Toggle */}
        <li>
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center w-10 h-10 p-1 rounded-full text-[var(--foreground)] hover:text-[var(--foreground)]/80 cursor-pointer transition-colors duration-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </li>
      </ul>

      {/* Right: Logout */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="text-[var(--foreground)] font-semibold cursor-pointer hover:text-[var(--foreground)]/80 transition-colors duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
