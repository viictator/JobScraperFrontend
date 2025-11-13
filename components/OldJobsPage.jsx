import React from 'react'

const OldJobsPage = () => {
  return (
    <main className="min-h-screen bg-[#F7F8FA] px-6 py-12 flex flex-col items-center">
            <div className="w-full max-w-7xl flex justify-between items-center mb-10">
                <h1 className="text-4xl font-bold text-[#1A1A1A] text-center flex items-center justify-center gap-2">
                    Job Listings
                    <span className="text-lg text-[#1A1A1A]">({jobs.length})</span>
                </h1>
                
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
                            className="bg-[#F7F8FA] rounded-lg shadow-xl p-6 text-white border border-[#1A1A1A] flex flex-col justify-between h-full hover:border-blue-500 transition-all duration-300"
                        >
                            <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col flex-grow text-left"
                            >
                                <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2 hover:text-blue-400 transition-colors duration-150">{job.jobTitle}</h2>
                                <p className="mb-1 text-[#1A1A1A] font-medium">{job.companyName}</p>
                                <p className="mb-1 text-sm text-[#1A1A1A] flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {job.location} &middot; {job.contract}
                                </p>
                                <p className="text-xs text-[#1A1A1A] mb-4 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#1A1A1A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {job.time}
                                </p>
                            </a>

                            {description && (
                                <div className="text-sm text-[#1A1A1A] mt-2">
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
  )
}

export default OldJobsPage