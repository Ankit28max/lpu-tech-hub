// app/feed/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';

// --- Reusable Interfaces ---
interface Comment {
    _id: string;
    content: string;
    author: { _id: string; username: string; };
    createdAt: string;
}
interface Post {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  likes: string[];
  comments: Comment[];
}
interface Mentor {
  _id: string;
  username: string;
}

// --- Create Post Form Component ---
function CreatePostForm({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true);
    
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to create post');
      setContent('');
      onPostCreated();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in tech?"
            className="mb-2"
            maxLength={280}
          />
          <div className="flex justify-end items-center">
             <span className="text-xs text-gray-500 mr-4">{content.length}/280</span>
             <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Post Actions Component (Likes & Comments) ---
function PostActions({ post, onCommentClick }: { post: Post, onCommentClick: () => void }) {
    const { user } = useAuth();
    const [likes, setLikes] = useState(post.likes.length);
    const [isLiked, setIsLiked] = useState(user ? post.likes.includes(user._id) : false);
    
    useEffect(() => {
        setIsLiked(user ? post.likes.includes(user._id) : false);
    }, [user, post.likes]);
    
    const handleLike = async () => {
        if (!user) return;
        
        const originalIsLiked = isLiked;
        const originalLikes = likes;
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);

        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`/api/posts/${post._id}/like`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                setIsLiked(originalIsLiked);
                setLikes(originalLikes);
            }
        } catch (error) {
            console.error("Failed to like post:", error);
            setIsLiked(originalIsLiked);
            setLikes(originalLikes);
        }
    };

    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={handleLike} disabled={!user}>
                    <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                </Button>
                <span className="text-sm text-gray-500">{likes}</span>
            </div>
            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={onCommentClick}>
                    <MessageCircle className="h-5 w-5 text-gray-500" />
                </Button>
                <span className="text-sm text-gray-500">{post.comments.length}</span>
            </div>
        </div>
    );
}

// --- Comment Section Component ---
function CommentSection({ post, onCommentAdded }: { post: Post, onCommentAdded: () => void }) {
    const { user } = useAuth();
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !user) return;
        setIsSubmitting(true);
        
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`/api/posts/${post._id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: comment })
            });
            if (!res.ok) throw new Error("Failed to add comment");
            setComment("");
            onCommentAdded();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="px-4 pb-4 pt-2 border-t">
            {user && (
                <form onSubmit={handleSubmit} className="flex space-x-2 my-4">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} />
                        <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="h-9 resize-none"
                    />
                    <Button type="submit" disabled={isSubmitting}>Reply</Button>
                </form>
            )}
            <div className="space-y-3">
                {post.comments.length > 0 && post.comments.slice(0).reverse().map((c) => (
                    <div key={c._id} className="flex space-x-2 text-sm">
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${c.author.username}`} />
                             <AvatarFallback>{c.author.username.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                            <Link href={`/profile/${c.author.username}`} className="font-semibold hover:underline">{c.author.username}</Link>
                            <p className="text-gray-700 break-words">{c.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- User Profile Card for the Left Column ---
function UserProfileCard() {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <Card>
            <CardHeader className="items-center text-center p-4">
                <Avatar className="h-20 w-20 mb-2">
                    <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} alt={user.username} />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <CardTitle>{user.username}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Link href={`/profile/${user.username}`} legacyBehavior passHref>
                   <Button variant="outline" className="w-full">View Profile</Button>
                </Link>
            </CardContent>
        </Card>
    );
}

// --- Suggested Mentors Card for the Right Column ---
function SuggestedMentors() {
    const [mentors, setMentors] = useState<Mentor[]>([]);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await fetch('/api/mentors');
                const data = await res.json();
                if (res.ok) {
                    setMentors(data.mentors.slice(0, 4));
                }
            } catch (error) {
                console.error("Failed to fetch mentors", error);
            }
        };
        fetchMentors();
    }, []);

    if (mentors.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Suggested Mentors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mentors.map(mentor => (
                    <div key={mentor._id} className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                           <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${mentor.username}`} alt={mentor.username} />
                           <AvatarFallback>{mentor.username.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Link href={`/profile/${mentor.username}`} className="font-medium hover:underline text-sm">{mentor.username}</Link>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// --- Main Feed Page Component ---
export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCommentClick = (postId: string) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
  };

  if (isLoading) {
    return <div className="text-center mt-20">Loading feed...</div>;
  }

  return (
    <div className="container mx-auto my-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

            {/* --- Left Column --- */}
            <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                   <UserProfileCard />
                </div>
            </aside>

            {/* --- Middle Column (Main Feed) --- */}
            <main className="lg:col-span-2">
                {user && <CreatePostForm onPostCreated={fetchPosts} />}
                <div className="space-y-4 mt-6">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <Card key={post._id}>
                                <CardHeader className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.author.username}`} alt={post.author.username} />
                                            <AvatarFallback>{post.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <Link href={`/profile/${post.author.username}`} className="font-bold hover:underline">
                                                {post.author.username}
                                            </Link>
                                            <p className="text-xs text-gray-500">
                                                {new Date(post.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 pb-2">
                                    <p className="text-gray-800 break-words">{post.content}</p>
                                </CardContent>
                                <CardFooter className="p-2 border-t">
                                    <PostActions post={post} onCommentClick={() => handleCommentClick(post._id)} />
                                </CardFooter>
                                {activeCommentPostId === post._id && (
                                    <CommentSection post={post} onCommentAdded={fetchPosts} />
                                )}
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <h3 className="text-lg font-semibold">The feed is empty!</h3>
                            <p className="text-muted-foreground">Be the first one to post.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* --- Right Column --- */}
            <aside className="hidden lg:block lg:col-span-1">
                 <div className="sticky top-24 space-y-6">
                   <SuggestedMentors />
                </div>
            </aside>
        </div>
    </div>
  );
}