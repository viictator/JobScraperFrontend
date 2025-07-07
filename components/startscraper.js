'use client';

import { useState } from 'react';

export default function StartScraperButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setStatus('Starting scraper...');

    try {
      const res = await fetch('http://localhost:8080/api/start-scraper', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Scraper failed to start.');

      setStatus('Scraping in progress...');

      // Polling or timeout to simulate wait (replace with real logic if you have it)
      const result = await res.text();
      console.log(result); // Optional: print response if your backend returns something

      setStatus('✅ Done! Refreshing...');
      setTimeout(() => {
        window.location.reload(); // Reload to fetch new jobs
      }, 1000);

    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to start scraper.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Scraping...' : 'Start Scraping'}
      </button>

      {status && <p className="text-gray-300 mt-2">{status}</p>}

      {loading && (
        <div className="w-full bg-gray-700 h-2 mt-4 rounded">
          <div className="bg-blue-500 h-full animate-pulse rounded w-full" />
        </div>
      )}
    </div>
  );
}
