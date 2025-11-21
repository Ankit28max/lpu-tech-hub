// app/mentors/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FadeIn } from '@/components/ui/fade-in';


// TypeScript interface for a Mentor
interface Mentor {
  _id: string;
  username: string;
  bio?: string;
  mentorshipSkills: string[];
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch('/api/mentors');
        const data = await response.json();
        if (response.ok) {
          setMentors(data.mentors);
        }
      } catch (error) {
        console.error('Failed to fetch mentors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredMentors = mentors.filter(mentor =>
    mentor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.mentorshipSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="container mx-auto my-12 px-4 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted/30 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-muted/30 rounded w-1/4 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted/30 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-12 px-4 min-h-screen">
      <FadeIn>
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Find a Mentor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with experienced students who can guide you through your tech journey.
          </p>

          <div className="max-w-md mx-auto mt-8 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or skill..."
              className="w-full pl-10 pr-4 py-3 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMentors.length > 0 ? (
          filteredMentors.map((mentor, index) => (
            <FadeIn key={mentor._id} delay={index * 0.1}>
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm group overflow-hidden flex flex-col">
                <CardHeader className="pb-2 text-center pt-8 relative">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-500/10 to-transparent" />
                  <div className="relative mx-auto mb-4">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full transform scale-150 group-hover:scale-175 transition-transform duration-700" />
                    <Avatar className="h-24 w-24 ring-4 ring-background relative z-10 mx-auto shadow-lg">
                      <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${mentor.username}`} alt={mentor.username} />
                      <AvatarFallback>{mentor.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-indigo-600 transition-colors">
                    {mentor.username}
                  </CardTitle>
                  <p className="text-sm text-indigo-500 font-medium">Mentor</p>
                </CardHeader>
                <CardContent className="text-center flex-grow px-6">
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed min-h-[40px]">
                    {mentor.bio || "Ready to help you grow and succeed in your tech journey."}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {mentor.mentorshipSkills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.mentorshipSkills.length > 4 && (
                      <Badge variant="outline" className="text-xs">+{mentor.mentorshipSkills.length - 4}</Badge>
                    )}
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Link href={`/profile/${mentor.username}`} className="w-full block">
                    <button className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all transform group-hover:-translate-y-0.5">
                      View Profile
                    </button>
                  </Link>
                </div>
              </Card>
            </FadeIn>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">No mentors found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}