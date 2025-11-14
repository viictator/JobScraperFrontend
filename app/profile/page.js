'use client';

import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Handlers ---

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    window.location.replace('/');
  };

  const handleProfileUpdate = async (fieldName, newValue) => {
    setError(null);
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) return false;

    const payload = { fieldName, value: newValue };
    try {
      const response = await fetch('http://localhost:8080/api/user/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: `HTTP Status ${response.status}` }));
        const errorMessage = errorBody.message || errorBody.error || `Failed to update ${fieldName}. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError(`Failed to save ${fieldName}: ${err.message}`);
      return false;
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    const jwtToken = localStorage.getItem('jwtToken');

    try {
      const response = await fetch('http://localhost:8080/api/user/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      let data;
      if (response.ok) {
        data = await response.json();
      } else {
        // Mock data for dev
        data = {
          username: 'user_handle_123',
          personalName: 'John Johnson',
          personalEmail: 'john.johnson@example.com',
          personalAddress: '123 E 43rd Street, New York, NY',
          profileText: 'Lorem ipsum dolor sit amet...',
        };
      }
      setUser(data);
    } catch (err) {
      setError(err?.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // --- Editable Field Component ---
  const EditableField = ({ initialValue, fieldName, onUpdate, className = '', isTextarea = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue || '');
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => setValue(initialValue || ''), [initialValue]);
    useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);

    const handleSave = async () => {
      if (isSaving || value === initialValue) {
        setIsEditing(false);
        return;
      }
      setIsSaving(true);
      const success = await onUpdate(fieldName, value);
      setIsSaving(false);
      if (success) setIsEditing(false);
      else setValue(initialValue);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !isTextarea) {
        e.preventDefault();
        handleSave();
      }
    };

    const FieldDisplay = (
      <div
        className={`cursor-pointer transition duration-150 relative inline-block text-center group ${className}`}
        onClick={() => setIsEditing(true)}
      >
        <p className={isTextarea ? 'whitespace-pre-wrap' : ''}>{initialValue || 'Click to edit...'}</p>
        <span className="absolute top-0 right-[-20px] text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">(edit)</span>
      </div>
    );

    const FieldInput = (
      <div className="flex flex-col items-center w-full">
        {isTextarea ? (
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            autoFocus
            rows={8}
            className="w-full bg-[var(--card)] text-[var(--card-foreground)] rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 resize-none"
            placeholder="Enter your profile text..."
          />
        ) : (
          <input
            ref={inputRef}
            type={fieldName.includes('email') ? 'email' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="bg-[var(--card)] text-[var(--card-foreground)] rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center transition duration-150"
            style={{ minWidth: '200px' }}
          />
        )}

        {isSaving && (
          <p className="mt-2 text-sm text-blue-500 flex items-center justify-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving...
          </p>
        )}
      </div>
    );

    return isEditing ? FieldInput : FieldDisplay;
  };

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <p className="text-center text-xl flex items-center gap-2">
          <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
          Loading profile...
        </p>
      </main>
    );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center pt-24 pb-16 px-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--card)] text-[var(--card-foreground)] font-semibold rounded-lg border border-[var(--border)] hover:bg-[var(--popover)] transition duration-150 shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md mb-8 w-full max-w-2xl text-center">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {user && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          <h1 className="text-5xl font-extrabold mb-2 text-center">
            Hello, <span className="text-[var(--foreground)]">{user.username}</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-12 text-center">
            This is your place to feed the AI
          </p>

          <div className="flex flex-col items-center space-y-3 mb-16 text-xl">
            <EditableField
              initialValue={user.personalName}
              fieldName="personalName"
              onUpdate={handleProfileUpdate}
              className="text-2xl font-extrabold"
            />
            <EditableField
              initialValue={user.personalEmail}
              fieldName="personalEmail"
              onUpdate={handleProfileUpdate}
              className="text-lg"
            />
            <EditableField
              initialValue={user.personalAddress}
              fieldName="personalAddress"
              onUpdate={handleProfileUpdate}
              className="text-lg"
            />
          </div>

          <h2 className="text-xl font-semibold mb-4 pt-8 border-t border-[var(--border)] w-full max-w-xl text-center">
            Your profile text
          </h2>

          <EditableField
            initialValue={user.profileText}
            fieldName="profileText"
            onUpdate={handleProfileUpdate}
            isTextarea={true}
            className="text-base w-full max-w-xl text-left"
          />
        </div>
      )}

      {!user && !error && !loading && (
        <p className="text-[var(--muted-foreground)] text-center text-lg mt-12">
          Unable to load profile data.
        </p>
      )}
    </main>
  );
}
