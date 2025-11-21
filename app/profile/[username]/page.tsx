// app/profile/[username]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'motion/react';
import { FadeIn } from '@/components/ui/fade-in';
import { MessageCircle, Calendar, Briefcase, UserPlus, UserCheck, Edit } from 'lucide-react';

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
                const following: string[] = (meData.user?.following || []).map((id: unknown) => String(id));
                setIsFollowing(following.includes(String(data.user._id)));
              }
            }
          } catch { }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred');
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserProfile();
    }
  }, [username, loggedInUser]);

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-red-500 text-xl font-semibold mb-2">Error</div>
      <p className="text-muted-foreground">{error}</p>
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto my-8 px-4">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Profile Header Skeleton */}
            <Card className="border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="space-y-3 flex-1 w-full">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32 mb-4" />
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-none shadow-sm bg-white/50 dark:bg-zinc-900/50">
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-24 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : profileUser ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Profile Header */}
            <Card className="mb-8 border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 pointer-events-none" />
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                      <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${profileUser.username}`} alt={profileUser.username} />
                      <AvatarFallback className="text-2xl font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                        {profileUser.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                          {profileUser.username}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {isOwnProfile ? (
                          <Link href="/profile/edit">
                            <Button variant="outline" className="gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                              <Edit className="h-4 w-4" />
                              Edit Profile
                            </Button>
                          </Link>
                        ) : (
                          <>
                            <Button
                              variant={isFollowing ? 'outline' : 'default'}
                              className={`gap-2 transition-all ${isFollowing ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}
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
                              {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                              {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                            <Link href={`/messages?with=${profileUser._id}`}>
                              <Button variant="secondary" className="gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Message
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    {profileUser.bio && (
                      <p className="text-lg text-foreground/90 leading-relaxed max-w-2xl">
                        {profileUser.bio}
                      </p>
                    )}

                    {profileUser.isAcceptingMentees && profileUser.mentorshipSkills && profileUser.mentorshipSkills.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                          <Briefcase className="h-4 w-4" />
                          <span>Mentorship Areas</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {profileUser.mentorshipSkills.map(skill => (
                            <Badge key={skill} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold px-1">Recent Posts</h2>
              <div className="space-y-4">
                {posts.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-none shadow-sm hover:shadow-md transition-all bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-zinc-900/80">
                          <CardContent className="p-6">
                            <p className="text-base whitespace-pre-wrap break-words leading-relaxed mb-3">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-16 bg-muted/10 rounded-2xl border border-dashed">
                    <div className="w-16 h-16 bg-muted/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">No posts yet</h3>
                    <p className="text-muted-foreground">This user hasn&apos;t shared anything with the community yet.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}