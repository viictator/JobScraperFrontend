'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { LiquidButton } from "@/components/ui/shadcn-io/liquid-button";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";

const JobIdPage = () => {
  const { jobId } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [jobApps, setJobApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileComplete, setProfileComplete] = useState(true);
  const [editingContent, setEditingContent] = useState({});
  const [openAppId, setOpenAppId] = useState(null);

  const toggleApp = (id) => setOpenAppId(prev => prev === id ? null : id);

  const fetchJob = async () => {
    setLoading(true);
    setError(null);
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) { router.replace('/login'); return; }

    try {
      const response = await fetch(`http://localhost:8080/api/user/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${jwtToken}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) setJob(await response.json());
      else if ([401, 403].includes(response.status)) { localStorage.removeItem('jwtToken'); router.replace('/login'); }
      else throw new Error(`Failed to fetch job with status ${response.status}`);
    } catch (err) { console.error(err); setError(err.message || 'Network error'); }
    finally { setLoading(false); }
  };

  const fetchJobApps = async () => {
    setLoading(true);
    setError(null);
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) { router.replace('/login'); return; }

    try {
      const response = await fetch(`http://localhost:8080/api/user/jobapp/${jobId}`, {
        headers: { 'Authorization': `Bearer ${jwtToken}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const json = await response.json();
        setJobApps(json.data || []);
      } else if ([401, 403].includes(response.status)) { localStorage.removeItem('jwtToken'); router.replace('/login'); }
      else throw new Error(`Failed to fetch jobApps with status ${response.status}`);
    } catch (err) { console.error(err); setError(err.message || 'Network error'); }
    finally { setLoading(false); }
  };

  const fetchProfileStatus = async () => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) return;
    try {
      const response = await fetch(`http://localhost:8080/api/user/profile/status`, { headers: { 'Authorization': `Bearer ${jwtToken}` } });
      if (response.ok) setProfileComplete((await response.json()).complete);
    } catch (err) { console.error("Failed to load profile status", err); }
  };

  const generateJobApp = async () => {
    setLoading(true);
    setError(null);
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) { router.replace('/login'); return; }

    try {
      const response = await fetch(`http://localhost:8080/api/user/jobapp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwtToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: jobId })
      });
      if (response.ok) {
        const json = await response.json();
        const newJobApp = json.data;
        setJobApps(prev => [...prev, newJobApp]);
      } else if ([401, 403].includes(response.status)) { localStorage.removeItem('jwtToken'); router.replace('/login'); }
      else throw new Error(`Failed to create job application with status ${response.status}`);
    } catch (err) { console.error(err); setError(err.message || 'Network error'); }
    finally { setLoading(false); }
  };

  const updateJobApp = async (index) => {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) return;

    const appId = jobApps[index]?.id;
    if (!appId) return;

    const updatedContent = editingContent[index];
    if (updatedContent === undefined || updatedContent === jobApps[index].content) return;

    try {
      const response = await fetch(`http://localhost:8080/api/user/jobapp/${appId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${jwtToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent })
      });
      if (response.ok) {
        setJobApps(prev => prev.map((app, i) => i === index ? { ...app, content: updatedContent } : app));
      } else throw new Error(`Failed to update application ${appId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update application');
    }
  };

  useEffect(() => { fetchProfileStatus(); }, []);
  useEffect(() => { if (jobId) fetchJob(); }, [jobId]);
  useEffect(() => { if (jobId) fetchJobApps(); }, [jobId]);

  return (
    <div className="relative flex justify-around min-h-screen p-4 items-center text-[var(--foreground)] bg-[var(--background)]">
      {loading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-[var(--foreground)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && <p className="text-red-500 absolute top-4 left-1/2 -translate-x-1/2">{error}</p>}

      <div className="flex-1 max-w-xl text-center">
        {job ? (
          <>
            <h1 className="text-3xl max-w-3xl font-black pb-4">{job.jobTitle}</h1>
            <p className="text-xl">{job.companyName}</p>
            <p className="text-xl">{job.location} · {job.contract}</p>
            <p className="text-xl pb-4">{job.time}</p>
            <p className="text-lg max-h-64 overflow-y-scroll">{job.description}</p>

            <div className="flex flex-col gap-2">
              <Link href={job.link} passHref>
                <LiquidButton className="text-xl py-3 px-6 font-bold rounded-full hover:scale-105 transition-transform duration-400">
                  Apply
                </LiquidButton>
              </Link>

              <div className="flex flex-col items-center">
                <LiquidButton
                  disabled={!profileComplete}
                  className={`text-xl py-3 px-6 font-bold rounded-full mt-2 ${!profileComplete ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  onClick={profileComplete ? generateJobApp : undefined}
                >
                  Generate Job Application
                </LiquidButton>

                {!profileComplete && (
                  <p className="text-red-500 mt-2 text-sm">
                    You must complete your profile first.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Loading job details...</p>
        )}
      </div>

      <div className="flex flex-col max-w-3xl text-center">
        <h2 className="text-2xl font-bold mt-8 mb-4">Job Applications</h2>

        {jobApps.length === 0 ? (
          <p>No applications found for this job.</p>
        ) : (
          jobApps.map((app, index) => (
            <div key={index} className="mb-4">
              <LiquidButton
                className={`w-full text-left font-bold text-lg py-2 mb-1 ${openAppId === index ? "bg-[var(--primary)]" : "bg-[var(--muted)]/20"}`}
                onClick={() => toggleApp(index)}
              >
                Application #{index + 1}
                <span className="float-right">{openAppId === index ? "▲" : "▼"}</span>
              </LiquidButton>

              <AnimatePresence>
                {openAppId === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[var(--muted)]/20 p-4 rounded-md text-sm"
                  >
                    <textarea
                      rows={Math.max(5, app.content.split("\n").length)}
                      value={editingContent[index] ?? app.content}
                      onChange={(e) => setEditingContent(prev => ({ ...prev, [index]: e.target.value }))}
                      onBlur={() => updateJobApp(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          updateJobApp(index);
                        }
                      }}
                      className="w-full p-2 text-sm rounded-md bg-[var(--input)] resize-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobIdPage;
