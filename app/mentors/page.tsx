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

  if (isLoading) {
    return <div className="text-center mt-10">Finding available mentors...</div>;
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <FadeIn>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Find a Mentor</h1>
          <p className="text-md text-muted-foreground mt-2">Connect with students who are ready to help.</p>
        </div>
      </FadeIn>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.length > 0 ? (
          mentors.map((mentor) => (
            <FadeIn key={mentor._id}>
              <Card>
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${mentor.username}`} alt={mentor.username} />
                            <AvatarFallback>{mentor.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <CardTitle>
                            <Link href={`/profile/${mentor.username}`} className="hover:underline">
                                {mentor.username}
                            </Link>
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 h-12 overflow-hidden">{mentor.bio || "No bio provided."}</p>
                    <div className="flex flex-wrap gap-2">
                        {mentor.mentorshipSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                    </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 mt-10">No students are currently accepting mentees. Check back later!</p>
        )}
      </div>
    </div>
  );
}