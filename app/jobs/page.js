'use client';

import { useEffect, useState } from 'react';
// We need 'next/navigation' for client-side redirection
import { useRouter } from 'next/navigation';

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});
    const router = useRouter(); // Initialize router for redirection

    // --- Handlers ---

    const handleLogout = () => {
        // 1. JWT Logout: Remove the token from localStorage
        localStorage.removeItem('jwtToken');
        // 2. Redirect to login page
        window.location.replace('/login');
    };

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        // 1. Get the JWT from localStorage
        const jwtToken = localStorage.getItem('jwtToken');

        // 2. Check for token and redirect if missing
        if (!jwtToken) {
            // Use window.location.replace for a full client-side redirect
            window.location.replace('/login');
            return; // Stop execution
        }

        try {
            const response = await fetch('http://localhost:8080/api/user/jobs', {
                method: 'GET',
                headers: {
                    // 3. CRITICAL: Pass the JWT in the Authorization Bearer header
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
                // IMPORTANT: Do NOT include credentials: 'include' for JWT
            });

            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            } else if (response.status === 401 || response.status === 403) {
                // If the JWT is invalid, expired, or doesn't have the 'USER' role
                handleLogout(); // Clear token and redirect to login
                return;
            } else {
                throw new Error(`Failed to fetch jobs with status ${response.status}.`);
            }
        } catch (err) {
            console.error("Error fetching jobs:", err);
            if (err.message.includes('Failed to fetch')) {
                setError('Network error: Could not connect to the backend server.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Effects & Logic ---

    useEffect(() => {
        fetchJobs();
    }, []);

    const toggleExpand = (idx) => {
        setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    // Helper function to convert time string to a numeric "days ago" value
    const parseDaysAgo = (timeStr) => {
        if (!timeStr) return Number.MAX_SAFE_INTEGER;
        const lower = timeStr.toLowerCase();
        if (lower === 'today') return 0;
        const match = lower.match(/(\d+)\s*day/);
        if (match) return parseInt(match[1], 10);
        return Number.MAX_SAFE_INTEGER;
    };

    const sortedJobs = [...jobs].sort((a, b) => {
        return parseDaysAgo(a.time) - parseDaysAgo(b.time);
    });

    // --- Loading and Error States ---
    if (loading)
        return (
            <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <p className="text-center text-gray-400 text-xl flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading job listings...
                </p>
            </main>
        );

    // --- Main Render ---
    return (
        <main className="min-h-screen bg-[#0f0f0f] px-6 py-12 flex flex-col items-center">
            <div className="w-full max-w-7xl flex justify-between items-center mb-10">
                <h1 className="text-4xl font-bold text-white text-center flex items-center justify-center gap-2">
                    Job Listings
                    <span className="text-lg text-gray-400">({jobs.length})</span>
                </h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-150 shadow-md"
                >
                    Logout
                </button>
            </div>

            {error && (
                <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-4 rounded-md mb-6 w-full max-w-7xl text-center">
                    {error}
                </div>
            )}

            {jobs.length === 0 && !error && (
                <div className="flex items-center justify-center flex-col">
                    <p className="text-gray-400">No jobs found.</p>
                    <p className="text-gray-400">Try running the scraper again or check your backend connection.</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-7xl">
                {sortedJobs.map((job, idx) => {
                    const isExpanded = expanded[idx];
                    const description = job.description || '';
                    const preview = description.slice(0, 160);

                    return (
                        <div 
                            key={idx}
                            className="bg-[#1c1c1c] rounded-lg shadow-xl p-6 text-white border border-gray-800 flex flex-col justify-between h-full hover:border-blue-500 transition-all duration-300"
                        >
                            <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col flex-grow text-left"
                            >
                                <h2 className="text-xl font-semibold mb-2 hover:text-blue-400 transition-colors duration-150">{job.jobTitle}</h2>
                                <p className="mb-1 text-gray-300 font-medium">{job.companyName}</p>
                                <p className="mb-1 text-sm text-gray-400 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {job.location} &middot; {job.contract}
                                </p>
                                <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {job.time}
                                </p>
                            </a>

                            {description && (
                                <div className="text-sm text-gray-300 mt-2">
                                    <p className="whitespace-pre-line text-left">
                                        {isExpanded ? description : `${preview}${description.length > 160 ? '...' : ''}`}
                                    </p>
                                    {description.length > 160 && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent anchor navigation
                                                toggleExpand(idx);
                                            }}
                                            className="mt-2 text-blue-400 hover:underline focus:outline-none text-xs font-medium"
                                        >
                                            {isExpanded ? 'Show less' : 'Show more'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>
    );
}