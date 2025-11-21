// app/profile/[username]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge'; // 👈 THE MISSING IMPORT
import { FadeIn } from '@/components/ui/fade-in';

interface User {
  _id: string;
  username: string;
  bio?: string;
  createdAt: string;
  isAcceptingMentees?: boolean;
  mentorshipSkills?: string[];
}
interface Post {
  _id: string;
  content: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: loggedInUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  useEffect(() => {
    if (username) {
      const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/users/${username}`);

          if (response.status === 404) {
            notFound();
            return;
          }

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
          setProfileUser(data.user);
          setPosts(data.posts);

          if (loggedInUser && loggedInUser._id === data.user._id) {
            setIsOwnProfile(true);
          } else {
            setIsOwnProfile(false);
          }
          // fetch my following to compute follow state
          try {
            const token = localStorage.getItem('authToken');
            if (token && loggedInUser && data.user?._id !== loggedInUser._id) {
              const meRes = await fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } });
              const meData = await meRes.json();
              if (meRes.ok) {
                const following: string[] = (meData.user?.following || []).map((id: any) => String(id));
                setIsFollowing(following.includes(String(data.user._id)));
              }
            }
          } catch { }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserProfile();
    }
  }, [username, loggedInUser]);

  if (isLoading) return <div className="text-center mt-10">Loading profile...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  if (!profileUser) return <div className="text-center mt-10">User not found.</div>;

  return (
    <div className="container max-w-2xl mx-auto my-8 px-4">
      <FadeIn>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profileUser.username}`} alt={profileUser.username} />
                  <AvatarFallback>{profileUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{profileUser.username}</h1>
                  <p className="text-sm text-muted-foreground">
                    Joined on {new Date(profileUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                )}
                {!isOwnProfile && (
                  <>
                    <Button
                      variant={isFollowing ? 'outline' : 'default'}
                      onClick={async () => {
                        if (!profileUser) return;
                        const prev = isFollowing;
                        setIsFollowing(!prev);
                        try {
                          const token = localStorage.getItem('authToken');
                          const res = await fetch(`/api/users/${profileUser._id}/follow`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
                          if (!res.ok) setIsFollowing(prev);
                        } catch {
                          setIsFollowing(prev);
                        }
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Link href={`/messages?with=${profileUser._id}`}>
                      <Button>Message</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            {profileUser.bio && <p className="mt-4 text-muted-foreground">{profileUser.bio}</p>}
            {profileUser.isAcceptingMentees && profileUser.mentorshipSkills && profileUser.mentorshipSkills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Can mentor in:</h3>
                <div className="flex flex-wrap gap-2">
                  {profileUser.mentorshipSkills.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn>
        <h2 className="text-xl font-bold mb-4">Posts</h2>
      </FadeIn>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FadeIn key={post._id}>
              <Card>
                <CardContent className="p-4">
                  <p className="text-gray-800 break-words">{post.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ))
        ) : (
          <p className="text-muted-foreground">This user hasn't posted anything yet.</p>
        )}
      </div>
    </div>
  );
}