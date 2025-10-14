// components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // If we are on the landing page AND the user is logged out, render the simple header.
  if (pathname === '/' && !user) {
    return (
      <header className="p-4 bg-white border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">LPU TechHub</h1>
          <div className="space-x-2">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // For all other pages, or if the user is logged in, render the full application navbar.
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href={user ? "/feed" : "/"} className="text-2xl font-bold text-indigo-600">
              LPU TechHub
            </Link>
          </div>
          <div className="flex items-center">
            {user && ( // Only show the main nav links if a user is logged in
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/feed" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                  Feed
                </Link>
                <Link href="/projects" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                  Projects
                </Link>
                <Link href="/mentors" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                  Mentors
                </Link>
                <Link href={`/profile/${user.username}`} className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}