// app/profile/edit/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileData {
    username: string;
  bio: string;
  isAcceptingMentees: boolean;
  mentorshipSkills: string[];
}

export default function EditProfilePage() {
  const [formData, setFormData] = useState<ProfileData>({
     username: '',
    bio: '',
    isAcceptingMentees: false,
    mentorshipSkills: [],
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      // We need an API route to get the current user's profile.
      // Let's create `GET /api/profile` for this.
      // For now, we'll assume it exists.
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await fetch('/api/profile', {
            headers: {'Authorization': `Bearer ${token}`}
        });
        if (!response.ok) throw new Error('Failed to fetch profile data.');
        const data = await response.json();
        setFormData({
            username: data.user.username || '',
            bio: data.user.bio || '',
            isAcceptingMentees: data.user.isAcceptingMentees || false,
            mentorshipSkills: data.user.mentorshipSkills || [],
        });
        setSkillsInput(data.user.mentorshipSkills.join(', '));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isAcceptingMentees: e.target.checked }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const mentorshipSkills = skillsInput.split(',').map(skill => skill.trim()).filter(Boolean);
    const finalData = { ...formData, mentorshipSkills };

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile.');
      }
      router.push(`/profile/${formData.username}`); // Redirect to their own profile page after update
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-center mt-10">Loading profile...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Edit Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Your Bio</label>
            <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Mentorship Skills</label>
            <input id="skills" type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g., React, Data Structures, Python" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            <p className="mt-2 text-xs text-gray-500">Separate skills with a comma.</p>
          </div>
          <div className="flex items-center">
            <input id="isAcceptingMentees" name="isAcceptingMentees" type="checkbox" checked={formData.isAcceptingMentees} onChange={handleCheckboxChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            <label htmlFor="isAcceptingMentees" className="ml-2 block text-sm text-gray-900">Open to mentoring students</label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button type="submit" disabled={isSaving} className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}