'use client';

import { useState } from 'react';
import Image from 'next/image'
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
            // 1. Send the request to the new JWT login endpoint
            const response = await fetch('http://localhost:8080/api/public/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send credentials in the JSON body, NOT in the Basic Auth header
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                // 2. Authentication successful! Extract the JWT token from the response body.
                const data = await response.json();
                const jwtToken = data.token; // Assuming the backend returns { "token": "..." }

                // 3. Store the JWT in localStorage
                // This is the key for stateless authentication.
                localStorage.setItem('jwtToken', jwtToken);

                // 4. Redirect to the main job listings page
                window.location.replace('/jobs');
            } else if (response.status === 401) {
                // 401 is typically returned for invalid credentials by the AuthController
                setError('Login failed: Invalid username or password.');
            } else {
                setError(`Login failed with status ${response.status}. Check backend availability.`);
            }

        } catch (err) {
            console.error("Network error during login:", err);
            setError('Network error: Could not connect to the backend server.');
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
            <div className="bg-transparent p-8 rounded-xl shadow-2xl w-full max-w-md bg-blur z-10">
                <h2 className="text-3xl font-bold text-[#1A1A1A] mb-6 text-center">Register</h2>

                {error && (
                    <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-md mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 bg-[#2c2c2c] border rounded-lg text-[#F7F8FA] placeholder[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-[#B1D2F7] transition duration-150"
                            placeholder="Enter username"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-[#2c2c2c] border border-gray-700 rounded-lg text-[#F7F8FA] placeholder[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-[#B1D2F7] transition duration-150"
                            placeholder="Enter password"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className={`w-full py-3 rounded-lg font-semibold shadow-lg transition duration-150 ${
                            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#B1D2F7] hover:bg-blue-300 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                {/* Simple spinning loader */}
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging In...
                            </span>
                        ) : (
                            'Register'
                        )}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Use your database credentials to log in.
                </p>
            </div>
        </div>
    );
}