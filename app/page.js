'use client';

import { useEffect, useState } from 'react';
import StartScraper from '../components/startscraper';


export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({}); // Track which descriptions are expanded

  

  useEffect(() => {
    fetch('http://localhost:8080/api/scraped-jobs')
      .then((res) => {
        if (!res.ok) throw new Error('Start the backend');
        return res.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
  // Customize message if it's a network error (fetch failed)
  if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
    setError('Please start the backend');
  } else {
    setError(err.message);
  }
  setLoading(false);
});
  }, []);

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Helper function to convert time string to a numeric "days ago" value
const parseDaysAgo = (timeStr) => {
  if (!timeStr) return Number.MAX_SAFE_INTEGER; // treat missing as oldest

  const lower = timeStr.toLowerCase();

  if (lower === 'today') return 0;
  if (lower.includes('in the future')) return -1; // treat as most recent

  const match = lower.match(/(\d+)\s*day/);
  if (match) return parseInt(match[1], 10);

  return Number.MAX_SAFE_INTEGER; // fallback, treat as oldest
};

// Then inside your rendering, before the return:
const sortedJobs = [...jobs].sort((a, b) => {
  return parseDaysAgo(a.time) - parseDaysAgo(b.time);
});


  if (loading)
    return <p className="text-center text-gray-400 mt-10">Loading jobs...</p>;
  if (error)
    return <p className="text-center text-red-400 mt-10">Error: {error}</p>;

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-6 py-12 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-10 text-center flex items-center justify-center gap-2">
  Job Listings
  <span className="text-lg text-gray-400">({jobs.length})</span>
</h1>

      {jobs.length === 0 && (
        <div className="flex items-center justify-center flex-col">
        <p className="text-gray-400">No jobs found.</p>
        <p className="text-gray-400">Try running the scraper again.</p>
        </div>
      )}

    <StartScraper />


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        {sortedJobs.map((job, idx) => {
          const isExpanded = expanded[idx];
          const description = job.description || '';
          const preview = description.slice(0, 160);

          return (
            <a
              key={idx}
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1c1c1c] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 text-white border border-gray-800 flex flex-col items-center text-center"
            >
              <h2 className="text-xl font-semibold mb-2">{job.jobTitle}</h2>
              <p className="mb-1 text-gray-300 font-medium">{job.companyName}</p>
              <p className="mb-1 text-sm text-gray-400">
                {job.location} &middot; {job.contract}
              </p>
              <p className="text-xs text-gray-500 mb-3">{job.time}</p>

              {description && (
                <div className="text-sm text-gray-300">
                  <p className="whitespace-pre-line">
                    {isExpanded ? description : `${preview}${description.length > 160 ? '...' : ''}`}
                  </p>
                  {description.length > 160 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault(); // Prevent anchor navigation
                        toggleExpand(idx);
                      }}
                      className="mt-2 text-blue-400 hover:underline focus:outline-none text-sm"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </main>
  );
}
