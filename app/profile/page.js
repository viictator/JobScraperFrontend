'use client';

import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Handlers ---

    const handleLogout = () => {
        // 1. JWT Logout: Remove the token from localStorage
        localStorage.removeItem('jwtToken');
        // 2. Redirect to login page
        window.location.replace('/login');
    };

    /**
     * Executes the API call to update a single user field.
     * @param {string} fieldName - The key of the field to update (e.g., 'personalName').
     * @param {string} newValue - The new value.
     */
    const handleProfileUpdate = async (fieldName, newValue) => {
        setError(null);
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) return false;

        // CRITICAL FIX: Construct the payload to match the PropertyUpdateRequest DTO:
        // {"fieldName": "...", "value": "..."}
        const payload = {
            fieldName: fieldName,
            value: newValue
        };

        const endpoint = 'http://localhost:8080/api/user/profile'; 
        
        try {
            // Execute actual fetch call
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Try to read error message from response body if available
                const errorBody = await response.json().catch(() => ({ message: `HTTP Status ${response.status}` }));
                const errorMessage = errorBody.message || errorBody.error || `Failed to update ${fieldName}. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
            
            // The backend is expected to return the full, updated user object on success
            const updatedUser = await response.json();
            
            // On success, update the local state with the user object returned from the API
            setUser(updatedUser);
            
            console.log(`✅ Successfully updated ${fieldName} to: ${newValue}`);
            return true; // Indicate success

        } catch (err) {
            console.error("Error updating field:", err);
            setError(`Failed to save ${fieldName}: ${err.message}`);
            return false; // Indicate failure
        }
    };


    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        const jwtToken = localStorage.getItem('jwtToken');

        if (!jwtToken) {
            console.log("No JWT found, potentially redirecting to login.");
            // NOTE: Uncomment this line in a real environment if authentication fails.
            // window.location.replace('/login');
            // return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // Mock response data if API fails or is not available
            let data;
            if (response.ok) {
                data = await response.json();
            } else {
                // Use mock data for visual development if API call fails
                console.warn("Using mock user data for development or missing token.");
                data = {
                    username: 'user_handle_123',
                    personalName: 'John Johnson',
                    personalEmail: 'john.johnson@example.com',
                    personalAddress: '123 E 43rd Street, New York, NY',
                    profileText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam gravida tempus sem sed sodales. Praesent lobortis sodales dapibus. Duis convallis pellentesque ultrices. Aliquam venenatis non nibh nec fringilla. Pellentesque vel diam eget augue tristique pharetra. Morbi at bibendum dolor. Integer tristique magna suscipit, vehicula risus et, ornare magna. Nullam nulla erat, blandit vitae mauris consectetur, imperdiet fermentum erat. Curabitur posuere tellus vel nunc viverra, eget porttitor ante molestie. Donec cursus orci ac bibendum hendrerit. Nulla congue nulla ut consectetur condimentum. Duis luctus arcu augue, lobortis.'
                }
            }
            
            setUser(data);

        } catch (err) {
            console.error("Error fetching profile:", err);
            setError(err?.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // --- Effects & Logic ---

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // --- Components ---

    /**
     * Component that handles in-place editing for a single field with minimal styling.
     */
    const EditableField = ({ initialValue, fieldName, onUpdate, className = '', isTextarea = false, isTitle = false }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [value, setValue] = useState(initialValue || '');
        const [isSaving, setIsSaving] = useState(false);
        const inputRef = useRef(null);

        // Sync local state when external initialValue changes (e.g., after successful save)
        useEffect(() => {
            setValue(initialValue || '');
        }, [initialValue]);
        
        // Focus when editing starts
        useEffect(() => {
            if (isEditing && inputRef.current) {
                inputRef.current.focus();
            }
        }, [isEditing]);

        const handleSave = async () => {
            if (isSaving || value === initialValue) {
                setIsEditing(false);
                return;
            }

            setIsSaving(true);
            const success = await onUpdate(fieldName, value);
            setIsSaving(false);
            
            if (success) {
                setIsEditing(false);
            } else {
                // If update fails, revert the local value and exit editing mode. Error is shown globally.
                setValue(initialValue);
                setIsEditing(false); 
            }
        };

        const handleKeyDown = (e) => {
            // Save on Enter key press (but not for textareas)
            if (e.key === 'Enter' && !isTextarea) {
                e.preventDefault();
                handleSave();
            }
        };

        const baseClasses = `cursor-pointer transition duration-150 relative inline-block text-center group ${className}`;
        const hoverClasses = 'hover:bg-gray-200 hover:rounded-sm hover:px-1';

        const FieldDisplay = (
            <div 
                className={`${baseClasses} ${isTextarea ? 'text-left' : ''} ${hoverClasses}`}
                onClick={() => setIsEditing(true)}
            >
                <p className={`font-bold ${isTextarea ? 'whitespace-pre-wrap' : ''}`}>
                    {initialValue || 'Click to edit...'}
                </p>
                {/* Visual hint only appears on hover in this design */}
                <span className="absolute top-0 right-[-20px] text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    (edit)
                </span>
            </div>
        );

        // --- REVISED FieldInput for Seamless Editing ---
        const FieldInput = (
            <div className="flex flex-col items-center w-full">
                {isTextarea ? (
                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={handleSave}
                        autoFocus
                        rows={10}
                        // Seamless styling: subtle background and clean focus ring
                        className={`w-full text-gray-800 bg-gray-100/70 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition duration-150 ${className}`}
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
                        // Seamless styling: subtle background, padding/margin trick to match display size, and clean focus ring
                        className={`text-gray-800 focus:outline-none bg-gray-100/70 rounded-sm px-1 -mx-1 focus:ring-2 focus:ring-blue-500 text-center transition duration-150 ${className}`}
                        style={{ minWidth: '200px' }}
                    />
                )}
                
                {/* Consolidated Saving Status Display */}
                <div className={`mt-2 text-right ${isTextarea ? 'w-full max-w-xl' : 'w-auto'}`}>
                    {isSaving ? (
                        <p className="text-sm text-blue-500 flex items-center justify-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                        </p>
                    ) : (
                        <p className="text-sm text-gray-500">Click outside or press Enter to save</p>
                    )}
                </div>
            </div>
        );

        return isEditing ? FieldInput : FieldDisplay;
    };


    // --- Render States ---

    if (loading)
        return (
            // Using default font (Inter)
            <main className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
                <p className="text-center text-gray-600 text-xl flex items-center gap-2">
                    <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                    Loading profile...
                </p>
            </main>
        );

    // --- Main Render ---

    return (
      <>
        <main className="min-h-screen bg-[#F7F8FA] flex flex-col items-center pt-24 pb-16 px-4"> 
            
            {/* Logout Button (Top Right for non-centered element) */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-150 shadow-sm"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md mb-8 w-full max-w-2xl text-center">
                    <p className="font-semibold">{error}</p>
                </div>
            )}

            {/* Profile Content - Centered */}
            {user && (
                <div className="w-full max-w-4xl flex flex-col items-center text-gray-800">
                    
                    {/* Header */}
                    <h1 className="text-5xl font-extrabold mb-2 text-center">
                        Hello, <span className="text-gray-900">{user.username}</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-12 text-center">
                        This is your place to feed the AI
                    </p>

                    {/* Editable Text Fields */}
                    <div className="flex flex-col items-center space-y-3 mb-16 text-xl">
                        {/* Personal Name */}
                        <EditableField
                            initialValue={user.personalName}
                            fieldName="personalName"
                            onUpdate={handleProfileUpdate}
                            className="text-2xl font-extrabold"
                        />
                        
                        {/* Personal Email */}
                        <EditableField
                            initialValue={user.personalEmail}
                            fieldName="personalEmail"
                            onUpdate={handleProfileUpdate}
                            className="text-lg text-gray-700"
                        />
                        
                        {/* Personal Address */}
                        <EditableField
                            initialValue={user.personalAddress}
                            fieldName="personalAddress"
                            onUpdate={handleProfileUpdate}
                            className="text-lg text-gray-700"
                        />
                    </div>

                    {/* Profile Text Area */}
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 pt-8 border-t border-gray-300 w-full max-w-xl text-center">
                        Your profile text
                    </h2>

                    <EditableField
                        initialValue={user.profileText}
                        fieldName="profileText"
                        onUpdate={handleProfileUpdate}
                        isTextarea={true}
                        className="text-base text-gray-700 w-full max-w-xl text-left"
                    />
                    
                </div>
            )}

            {!user && !error && !loading && (
                <p className="text-gray-600 text-center text-lg mt-12">
                    Unable to load profile data.
                </p>
            )}

        </main>
        </>
    );
}