'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState({});
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        window.location.replace('/login');
    };

    const handleViewJob = (jobId) => {
        window.location.href = `/jobs/${jobId}`;
    }

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);

        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            window.location.replace('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/user/jobs', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            } else if (response.status === 401 || response.status === 403) {
                handleLogout();
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

    useEffect(() => {
        fetchJobs();
    }, []);

    const toggleExpand = (idx) => {
        setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    const parseDaysAgo = (timeStr) => {
        if (!timeStr) return Number.MAX_SAFE_INTEGER;
        const lower = timeStr.toLowerCase();
        if (lower === 'today') return 0;
        const match = lower.match(/(\d+)\s*day/);
        if (match) return parseInt(match[1], 10);
        return Number.MAX_SAFE_INTEGER;
    };

    const sortedJobs = [...jobs].sort((a, b) => parseDaysAgo(a.time) - parseDaysAgo(b.time));

    if (loading)
        return (
            <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <p className="text-center text-[var(--foreground)] text-xl flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading job listings...
                </p>
            </main>
        );

    return (
        <main className="bg-[var(--background)] pt-16 w-full flex flex-col items-center">
            <h1 className="text-[var(--foreground)] text-4xl font-black pt-8">{jobs.length} Jobs</h1>
            <h3 className="text-[var(--foreground)] text-lg font-medium pb-8">currently scraped.</h3>

            {error && (
                <div className="bg-red-700 bg-opacity-20 border border-red-600 text-red-600 p-4 rounded-md mb-6 w-full max-w-7xl text-center">
                    {error}
                </div>
            )}

            {jobs.length === 0 && !error && (
                <div className="flex items-center justify-center flex-col text-[var(--foreground)]">
                    <p>No jobs found.</p>
                    <p>Try running the scraper again or check your backend connection.</p>
                </div>
            )}

            <div className="flex flex-col gap-8 w-2xl">
                {sortedJobs.map((job, idx) => {
                    const isExpanded = expanded[idx];
                    const description = job.description || '';
                    const preview = description.slice(0, 160);

                    return (
                        <div
                            onClick={() => handleViewJob(job.id)}
                            key={idx}
                            className="bg-[var(--card)] text-[var(--card-foreground)] cursor-pointer rounded-lg shadow-xl p-6 border-2 border-[var(--foreground)] flex flex-col items-center hover:border-[var(--primary)] transition-all duration-300"
                        >
                            <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col flex-grow items-center"
                            >
                                <h2 className="text-xl font-semibold mb-2 hover:text-[var(--primary)] transition-colors duration-150">{job.jobTitle}</h2>
                                <p className="mb-1 font-medium">{job.companyName}</p>
                                <p className="mb-1 text-sm flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {job.location} &middot; {job.contract}
                                </p>
                                <p className="text-xs mb-4 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {job.time}
                                </p>
                            </a>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
