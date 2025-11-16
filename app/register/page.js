'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LiquidButton } from "@/components/ui/shadcn-io/liquid-button";

const BACKGROUND_IMAGE_SRC = '/bg.png';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('jwtToken', data.token);
        window.location.replace('/jobs');
      } else if (response.status === 401) {
        setError('Registration failed: Invalid username or password.');
      } else {
        setError(`Registration failed with status ${response.status}. Check backend.`);
      }
    } catch (err) {
      console.error('Network error during registration:', err);
      setError('Network error: Could not connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
      <Image
        src={BACKGROUND_IMAGE_SRC}
        alt="Background"
        fill
        className="object-cover opacity-15"
        priority
      />

      <div className="bg-opacity-90 p-8 rounded-xl shadow-2xl w-full max-w-md backdrop-blur z-10">
        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6 text-center">
          Register
        </h2>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition duration-150"
              placeholder="Enter username"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--input)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition duration-150"
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>

          <LiquidButton
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !username || !password}
            className="w-full py-3 rounded-lg font-semibold shadow-lg transition duration-150"
          >
            Register
          </LiquidButton>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          Create a new database user account.
        </p>
      </div>
    </div>
  );
}
