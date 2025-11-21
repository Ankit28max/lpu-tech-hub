// app/feed/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Repeat2, Ellipsis, Smile, Image as ImageIcon, BarChart3 } from 'lucide-react';
import { FadeIn } from '@/components/ui/fade-in';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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
  reposts: string[];
  comments: Comment[];
  mediaUrls?: string[];
  poll?: {
    options: { id: string; text: string; votes: number }[];
    totalVotes?: number;
    hasVoted?: boolean;
  };
}
interface Mentor {
  _id: string;
  username: string;
}

// --- Utilities ---
function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(value % 1000 < 100 ? 1 : 0)}K`.replace(/\.0K$/, 'K');
  return `${(value / 1_000_000).toFixed(value % 1_000_000 < 100_000 ? 1 : 0)}M`.replace(/\.0M$/, 'M');
}

function getRelativeTime(date: Date): { text: string; title: string } {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
    ['second', 1000],
  ];
  for (const [unit, ms] of units) {
    if (absMs >= ms || unit === 'second') {
      const value = Math.round(diffMs / ms);
      return { text: rtf.format(value, unit), title: date.toLocaleString() };
    }
  }
  return { text: '', title: date.toLocaleString() };
}

function AutolinkContent({ text }: { text: string }) {
  const nodes = useMemo(() => {
    const parts: Array<React.ReactNode> = [];
    const regex = /(https?:\/\/[^\s]+)|(#\w+)|(@[A-Za-z0-9_]+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const [token, url, hashtag, mention] = match as unknown as [string, string, string, string];
      if (url) {
        parts.push(
          <a key={`${match.index}-url`} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {url}
          </a>
        );
      } else if (hashtag) {
        parts.push(
          <Link key={`${match.index}-tag`} href={`/tags/${hashtag.substring(1).toLowerCase()}`} className="text-blue-600 hover:underline">
            {hashtag}
          </Link>
        );
      } else if (mention) {
        parts.push(
          <Link key={`${match.index}-mention`} href={`/profile/${mention.substring(1)}`} className="text-blue-600 hover:underline">
            {mention}
          </Link>
        );
      } else {
        parts.push(token);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  }, [text]);

  return <>{nodes}</>;
}

// --- Lightweight Toasts (local to this page) ---
type ToastType = 'success' | 'error' | 'info';
function useToasts() {
  const [toasts, setToasts] = useState<{ id: number; type: ToastType; message: string }[]>([]);
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);
  const ToastContainer = (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-md px-3 py-2 shadow-md text-sm text-white ${t.type === 'success' ? 'bg-emerald-600' : t.type === 'error' ? 'bg-rose-600' : 'bg-gray-800'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
  return { showToast, ToastContainer } as const;
}

// --- Create Post Form Component ---
function CreatePostForm({ onPostCreated, onOptimisticPost }: { onPostCreated: () => void; onOptimisticPost: (temp: Post) => void }) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const remaining = 280 - content.length;
  const isTooLong = remaining < 0;
  const canSubmit = !isLoading && content.trim().length > 0 && !isTooLong;
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const { showToast } = useToasts();
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [gifUrl, setGifUrl] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const { user } = useAuth();

  const insertAtCaret = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const next = content.slice(0, start) + emoji + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
      el.focus();
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);

    const token = localStorage.getItem('authToken');
    try {
      // Optimistic insert
      const tempPost: Post = {
        _id: `temp-${Date.now()}`,
        content,
        author: { _id: 'me', username: 'you' },
        createdAt: new Date().toISOString(),
        likes: [],
        reposts: [],
        comments: [],
        mediaUrls: previews.length ? previews : (gifUrl ? [gifUrl] : undefined),
        poll: showPoll ? {
          options: pollOptions.filter((o) => o.trim()).map((o) => ({ id: `${o}-${Math.random().toString(36).slice(2, 8)}`, text: o.trim(), votes: 0 })),
          totalVotes: 0,
          hasVoted: false,
        } : undefined,
      };
      onOptimisticPost(tempPost);

      let response: Response;
      if (files.length > 0) {
        const form = new FormData();
        form.append('content', content);
        files.forEach((f) => form.append('media', f));
        response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: form,
        });
      } else {
        response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ content, mediaUrls: gifUrl ? [gifUrl] : undefined, poll: showPoll ? { options: pollOptions.filter((o) => o.trim()) } : undefined }),
        });
      }
      if (!response.ok) throw new Error('Failed to create post');
      setContent('');
      setFiles([]);
      setPreviews([]);
      setGifUrl('');
      setShowPoll(false);
      setPollOptions(['', '']);
      showToast('success', 'Posted');
      onPostCreated();
    } catch (error) {
      console.error(error);
      showToast('error', 'Failed to post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 hidden sm:block">
              <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.username || 'guest'}`} />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                  }
                }}
                placeholder="What is happening?!"
                className="mb-3 resize-none min-h-[80px] border-none focus-visible:ring-0 bg-transparent text-lg placeholder:text-muted-foreground/70 p-0"
                maxLength={560}
                ref={textareaRef}
              />

              {previews.length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border shadow-sm group">
                      <img src={src} alt="preview" className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                    </div>
                  ))}
                </div>
              )}
              {!previews.length && gifUrl && (
                <div className="mb-3 rounded-xl overflow-hidden border shadow-sm">
                  <img src={gifUrl} alt="gif" className="w-full h-48 object-cover" />
                </div>
              )}
              {showPoll && (
                <div className="mb-3 space-y-2 p-3 border rounded-xl bg-muted/30">
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      value={opt}
                      onChange={(e) => setPollOptions((arr) => arr.map((v, i) => i === idx ? e.target.value : v))}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full text-sm px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      maxLength={80}
                    />
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPollOptions((arr) => arr.length < 4 ? [...arr, ''] : arr)} className="text-xs">+ Add</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPollOptions((arr) => arr.length > 2 ? arr.slice(0, -1) : arr)} className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50">- Remove</Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-3 mt-2">
                <div className="flex items-center gap-1 text-indigo-500">
                  <label className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors" title="Media">
                    <input type="file" accept="image/*" multiple onChange={(e) => {
                      const filesList = Array.from(e.target.files || []);
                      const valid: File[] = [];
                      for (const f of filesList.slice(0, 4)) {
                        if (!f.type.startsWith('image/')) { showToast('error', 'Only images allowed'); continue; }
                        if (f.size > 5 * 1024 * 1024) { showToast('error', 'Image too large (max 5MB)'); continue; }
                        valid.push(f);
                      }
                      Promise.all(valid.map((file) => new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(String(reader.result));
                        reader.readAsDataURL(file);
                      }))).then((urls) => {
                        setFiles(valid);
                        setPreviews(urls);
                      });
                    }} className="hidden" />
                    <ImageIcon className="h-5 w-5" />
                  </label>
                  <button type="button" onClick={() => setShowPoll((s) => !s)} className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="Poll">
                    <BarChart3 className="h-5 w-5" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors outline-none">
                      <Smile className="h-5 w-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="grid grid-cols-8 gap-1 p-2 w-64">
                      {['😀', '😄', '😁', '😂', '😊', '😍', '😎', '🤩', '😇', '🥳', '🤔', '😴', '😭', '😤', '🔥', '✨', '💯', '✅', '🎉', '🙌', '👏', '👍', '❤️', '🤝', '🧠'].map((e) => (
                        <button key={e} onClick={() => insertAtCaret(e)} className="text-xl hover:scale-125 transition-transform p-1">
                          {e}
                        </button>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <input
                    type="url"
                    placeholder="GIF URL..."
                    value={gifUrl}
                    onChange={(e) => setGifUrl(e.target.value.trim())}
                    className="ml-2 text-xs px-2 py-1 border-b bg-transparent focus:border-indigo-500 outline-none w-24 transition-all focus:w-40"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {content.length > 0 && (
                    <span className={`text-xs font-medium ${isTooLong ? 'text-red-600' : remaining <= 20 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      {remaining}
                    </span>
                  )}
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
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
  const [reposts, setReposts] = useState(post.reposts.length);
  const [isReposted, setIsReposted] = useState(user ? post.reposts.includes(user._id) : false);
  const isOwner = user && user._id === post.author._id;
  const { showToast } = useToasts();

  useEffect(() => {
    setIsLiked(user ? post.likes.includes(user._id) : false);
    setIsReposted(user ? post.reposts.includes(user._id) : false);
  }, [user, post.likes, post.reposts]);

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
        showToast('error', 'Failed to like');
      }
    } catch (error) {
      console.error("Failed to like post:", error);
      setIsLiked(originalIsLiked);
      setLikes(originalLikes);
      showToast('error', 'Failed to like');
    }
  };

  const handleRepost = async () => {
    if (!user) return;

    const originalIsReposted = isReposted;
    const originalReposts = reposts;
    setIsReposted(!isReposted);
    setReposts(isReposted ? reposts - 1 : reposts + 1);

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`/api/posts/${post._id}/repost`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        setIsReposted(originalIsReposted);
        setReposts(originalReposts);
        showToast('error', 'Failed to repost');
      }
    } catch (error) {
      console.error("Failed to repost:", error);
      setIsReposted(originalIsReposted);
      setReposts(originalReposts);
      showToast('error', 'Failed to repost');
    }
  };

  return (
    <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40">
      <div className="flex items-center gap-6">
        <button
          onClick={handleLike}
          disabled={!user}
          className={`group flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:bg-red-500/10 hover:text-red-500'}`}
        >
          <Heart className={`h-5 w-5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{formatCount(likes)}</span>
        </button>
        <button
          onClick={handleRepost}
          disabled={!user}
          className={`group flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${isReposted ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground hover:bg-green-500/10 hover:text-green-500'}`}
        >
          <Repeat2 className={`h-5 w-5 transition-transform group-hover:rotate-180 ${isReposted ? 'text-green-500' : ''}`} />
          <span className="text-sm font-medium">{formatCount(reposts)}</span>
        </button>
        <button
          onClick={onCommentClick}
          className="group flex items-center gap-2 rounded-full px-3 py-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500 transition-all"
        >
          <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="text-sm font-medium">{formatCount(post.comments.length)}</span>
        </button>
      </div>
    </div>
  );
}

function PostMenu({ isOwner, onDelete }: { isOwner: boolean; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ml-auto rounded-full p-1 text-gray-400 hover:bg-muted hover:text-gray-600">
        <Ellipsis className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem onClick={() => {
          const url = typeof window !== 'undefined' ? `${window.location.origin}/feed` : '/feed';
          navigator.clipboard?.writeText(url).catch(() => { });
        }}>Copy link</DropdownMenuItem>
        <DropdownMenuSeparator />
        {isOwner && (
          <DropdownMenuItem variant="destructive" onClick={onDelete}>Delete post</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
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
              <AvatarFallback>{c.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-lg px-3 py-2 flex-1">
              <Link href={`/profile/${c.author.username}`} className="font-semibold hover:underline">{c.author.username}</Link>
              <p className="text-foreground break-words">{c.content}</p>
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
        <div className="flex items-center -space-x-2">
          <AnimatedTooltip
            items={mentors.map((m, i) => ({
              id: i + 1,
              name: m.username,
              designation: 'Mentor',
              image: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${m.username}`,
            }))}
          />
        </div>
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
  const { showToast, ToastContainer } = useToasts();
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'latest' | 'following' | 'trending' | 'media' | 'polls'>('latest');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [followingPosts, setFollowingPosts] = useState<Post[] | null>(null);
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  const displayedPosts = useMemo(() => {
    const base = posts.slice();
    if (activeFilter === 'following') {
      return (followingPosts || []);
    }
    if (activeFilter === 'trending') {
      // Simple trending score based on engagement; recent ties broken by recency
      return base
        .slice()
        .sort((a, b) => {
          const aScore = (a.likes?.length || 0) * 3 + (a.comments?.length || 0) * 2 + (a.reposts?.length || 0) * 4;
          const bScore = (b.likes?.length || 0) * 3 + (b.comments?.length || 0) * 2 + (b.reposts?.length || 0) * 4;
          if (bScore !== aScore) return bScore - aScore;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
    if (activeFilter === 'media') {
      return base.filter((p) => p.mediaUrls && p.mediaUrls.length > 0);
    }
    if (activeFilter === 'polls') {
      return base.filter((p) => Boolean(p.poll));
    }
    // latest
    return base.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, followingPosts, activeFilter]);

  useEffect(() => {
    if (activeFilter !== 'following' || followingPosts) return;
    const load = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/feed/following', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setFollowingPosts(data.posts || []);
      } catch { }
    };
    load();
  }, [activeFilter, followingPosts]);

  function TrendingTopics() {
    const [topics, setTopics] = useState<{ name: string; count: number }[]>([]);
    const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const res = await fetch('/api/trending');
          const data = await res.json();
          if (!mounted) return;
          if (res.ok) {
            setTopics(data.trendingTopics || []);
            setCategories(data.categoryStats || []);
          }
        } catch (e) {
          // no-op
        } finally {
          mounted = false;
          setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, []);

    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">Trending</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-3/4 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topics.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Trending topics</div>
                  <ul className="space-y-1">
                    {topics.map((t) => (
                      <li key={t.name} className="flex items-center justify-between">
                        <Link href={`/tags/${t.name}`} className="text-blue-600 hover:underline">#{t.name}</Link>
                        <span className="text-xs text-muted-foreground">{t.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {categories.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Popular categories</div>
                  <ul className="space-y-1">
                    {categories.map((c) => (
                      <li key={c.category} className="flex items-center justify-between">
                        <span className="capitalize">{c.category}</span>
                        <span className="text-xs text-muted-foreground">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {topics.length === 0 && categories.length === 0 && (
                <div className="text-sm text-muted-foreground">No trending data yet.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function SuggestedUsers() {
    const { user } = useAuth();
    const [users, setUsers] = useState<{ _id: string; username: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch('/api/users/suggestions', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (!mounted) return;
          if (res.ok) setUsers(data.users || []);
        } catch { }
        finally { setLoading(false); }
      })();
      return () => { mounted = false };
    }, []);

    const toggleFollow = async (targetId: string) => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`/api/users/${targetId}/follow`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          setFollowingMap((m) => ({ ...m, [targetId]: !m[targetId] }));
        }
      } catch { }
    };

    if (!user) return null;
    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            users.slice(0, 5).map((u) => (
              <div key={u._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.username}`} />
                    <AvatarFallback>{u.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Link href={`/profile/${u.username}`} className="font-medium hover:underline">{u.username}</Link>
                </div>
                <Button size="sm" variant={followingMap[u._id] ? 'outline' : 'default'} onClick={() => toggleFollow(u._id)}>
                  {followingMap[u._id] ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

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

  useEffect(() => {
    // load my following list for follow buttons
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (!token) return;
        const res = await fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok && data.user?.following) {
          setFollowingSet(new Set<string>(data.user.following.map((id: string) => String(id))));
        }
      } catch { }
    })();
  }, []);

  const toggleFollowUser = async (targetUserId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const isFollowing = followingSet.has(targetUserId);
      setFollowingSet((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.delete(targetUserId); else next.add(targetUserId);
        return next;
      });
      const res = await fetch(`/api/users/${targetUserId}/follow`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) {
        // revert on failure
        setFollowingSet((prev) => {
          const next = new Set(prev);
          if (isFollowing) next.add(targetUserId); else next.delete(targetUserId);
          return next;
        });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCommentClick = (postId: string) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto my-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <aside className="hidden lg:block lg:col-span-1" />
          <main className="lg:col-span-2 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-muted/50" />
                  <div className="h-3 w-24 rounded bg-muted/50" />
                </div>
                <div className="h-3 w-full rounded bg-muted/50 mb-2" />
                <div className="h-3 w-3/4 rounded bg-muted/50" />
              </div>
            ))}
          </main>
          <aside className="hidden lg:block lg:col-span-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">

        {/* --- Left Column (Vertical Tabs) --- */}
        <aside className="col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Feed</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <nav className="flex flex-col">
                  <button
                    className={`text-left px-3 py-2 rounded-md mb-1 ${activeFilter === 'latest' ? 'bg-muted font-semibold' : 'hover:bg-muted/50'}`}
                    onClick={() => setActiveFilter('latest')}
                  >
                    Latest
                  </button>
                  <button
                    className={`text-left px-3 py-2 rounded-md mb-1 ${activeFilter === 'following' ? 'bg-muted font-semibold' : 'hover:bg-muted/50'}`}
                    onClick={() => setActiveFilter('following')}
                  >
                    Following
                  </button>
                  <button
                    className={`text-left px-3 py-2 rounded-md mb-1 ${activeFilter === 'trending' ? 'bg-muted font-semibold' : 'hover:bg-muted/50'}`}
                    onClick={() => setActiveFilter('trending')}
                  >
                    Trending
                  </button>
                  <button
                    className={`text-left px-3 py-2 rounded-md mb-1 ${activeFilter === 'media' ? 'bg-muted font-semibold' : 'hover:bg-muted/50'}`}
                    onClick={() => setActiveFilter('media')}
                  >
                    Media
                  </button>
                  <button
                    className={`text-left px-3 py-2 rounded-md ${activeFilter === 'polls' ? 'bg-muted font-semibold' : 'hover:bg-muted/50'}`}
                    onClick={() => setActiveFilter('polls')}
                  >
                    Polls
                  </button>
                </nav>
              </CardContent>
            </Card>
            <UserProfileCard />
          </div>
        </aside>

        {/* --- Middle Column (Main Feed) --- */}
        <main className="md:col-span-2">
          <div className="z-10 bg-background border-b">
            <div className="flex items-center gap-2 px-2 py-3">
              <div className="flex items-center gap-1 rounded-full border p-1">
                <Badge variant={activeFilter === 'latest' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setActiveFilter('latest')}>Latest</Badge>
                <Badge variant={activeFilter === 'following' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setActiveFilter('following')}>Following</Badge>
                <Badge variant={activeFilter === 'trending' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setActiveFilter('trending')}>Trending</Badge>
                <Badge variant={activeFilter === 'media' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setActiveFilter('media')}>Media</Badge>
                <Badge variant={activeFilter === 'polls' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setActiveFilter('polls')}>Polls</Badge>
              </div>
              <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsCmdOpen(true)}>Search / Cmd+K</Button>
              <Sheet open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <SheetTrigger asChild>
                  <Button size="sm">Compose</Button>
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Compose</SheetTitle>
                  </SheetHeader>
                  {user && (
                    <div className="p-4 pt-0">
                      <CreatePostForm
                        onPostCreated={() => { setIsComposeOpen(false); fetchPosts(); }}
                        onOptimisticPost={(temp) => setPosts((prev) => [temp, ...prev])}
                      />
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <FadeIn>
            {user && (
              <CreatePostForm
                onPostCreated={fetchPosts}
                onOptimisticPost={(temp) => setPosts((prev) => [temp, ...prev])}
              />
            )}
          </FadeIn>
          <div className="space-y-4 mt-6">
            {displayedPosts.length > 0 ? (
              displayedPosts.map((post) => (
                <FadeIn key={post._id}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start gap-4">
                        <Link href={`/profile/${post.author.username}`}>
                          <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-indigo-500/20 transition-transform hover:scale-105 cursor-pointer">
                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.author.username}`} alt={post.author.username} />
                            <AvatarFallback>{post.author.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <Link href={`/profile/${post.author.username}`} className="font-bold text-lg hover:text-indigo-600 transition-colors">
                                {post.author.username}
                              </Link>
                              <span className="text-xs text-muted-foreground font-medium" title={new Date(post.createdAt).toLocaleString()}>
                                {getRelativeTime(new Date(post.createdAt)).text}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {user && user._id !== post.author._id && (
                                <Button
                                  size="sm"
                                  variant={followingSet.has(post.author._id) ? 'secondary' : 'outline'}
                                  className={`h-8 px-3 text-xs rounded-full transition-all ${followingSet.has(post.author._id) ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:border-indigo-500 hover:text-indigo-500'}`}
                                  onClick={() => toggleFollowUser(post.author._id)}
                                >
                                  {followingSet.has(post.author._id) ? 'Following' : 'Follow'}
                                </Button>
                              )}
                              <PostMenu
                                isOwner={Boolean(user && user._id === post.author._id)}
                                onDelete={async () => {
                                  const token = localStorage.getItem('authToken');
                                  try {
                                    // Optimistic remove
                                    setPosts((prev) => prev.filter((p) => p._id !== post._id));
                                    const res = await fetch(`/api/posts/${post._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                                    if (!res.ok) throw new Error('Failed');
                                    showToast('success', 'Post deleted');
                                  } catch (e) {
                                    console.error(e);
                                    showToast('error', 'Failed to delete');
                                    // Re-fetch to restore
                                    fetchPosts();
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-3">
                      <div className="text-[16px] leading-relaxed text-foreground/90 break-words whitespace-pre-wrap font-normal">
                        <AutolinkContent text={post.content} />
                      </div>
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className={`mt-4 grid gap-2 rounded-xl overflow-hidden ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {post.mediaUrls.slice(0, 4).map((src, i) => (
                            <button key={i} className="relative overflow-hidden group bg-muted" onClick={() => setLightbox(src)}>
                              <img src={src} alt="media" className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                      {post.poll && post.poll.options && post.poll.options.length > 0 && (
                        <div className="mt-4 space-y-2 p-4 rounded-xl bg-muted/30 border border-border/50">
                          {post.poll.options.map((opt) => {
                            const total = post.poll?.totalVotes || (post.poll?.options ? post.poll.options.reduce((a, b) => a + (b.votes || 0), 0) : 0);
                            const pct = total ? Math.round((opt.votes / total) * 100) : 0;
                            return (
                              <button
                                key={opt.id}
                                disabled={post.poll?.hasVoted}
                                onClick={async () => {
                                  // optimistic vote
                                  setPosts((prev) => prev.map((p) => {
                                    if (p._id !== post._id || !p.poll) return p;
                                    const updated = { ...p, poll: { ...p.poll, hasVoted: true, options: p.poll.options.map(o => o.id === opt.id ? { ...o, votes: o.votes + 1 } : o) } };
                                    return updated;
                                  }));
                                  try {
                                    const token = localStorage.getItem('authToken');
                                    await fetch(`/api/posts/${post._id}/poll`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ optionId: opt.id }) });
                                  } catch {
                                    fetchPosts();
                                  }
                                }}
                                className="relative w-full text-left text-sm border rounded-lg px-4 py-3 hover:bg-muted/50 disabled:opacity-80 disabled:cursor-default overflow-hidden transition-all"
                              >
                                <div className="relative z-10 flex items-center justify-between font-medium">
                                  <span>{opt.text}</span>
                                  {total > 0 && <span>{pct}%</span>}
                                </div>
                                {total > 0 && (
                                  <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 transition-all duration-500" style={{ width: `${pct}%` }} />
                                )}
                              </button>
                            );
                          })}
                          {post.poll?.totalVotes !== undefined && (
                            <div className="text-xs text-muted-foreground text-right font-medium">{post.poll.totalVotes} votes</div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-0 px-5 pb-4">
                      <div className="w-full">
                        <PostActions post={post} onCommentClick={() => handleCommentClick(post._id)} />
                      </div>
                    </CardFooter>
                    {activeCommentPostId === post._id && (
                      <CommentSection post={post} onCommentAdded={fetchPosts} />
                    )}
                  </Card>
                </FadeIn>
              ))
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Smile className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">The feed is quiet. Be the first to share something amazing with the community!</p>
              </div>
            )}
          </div>
        </main>

        {/* --- Right Column --- */}
        <aside className="col-span-1">
          <div className="sticky top-24 space-y-6">
            <TrendingTopics />
            <SuggestedUsers />
            <SuggestedMentors />
          </div>
        </aside>
      </div>
      {ToastContainer}
      <CommandDialog open={isCmdOpen} onOpenChange={setIsCmdOpen}>
        <CommandInput placeholder="Search posts, people, tags..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { setIsCmdOpen(false); window.location.href = '/feed'; }}>Feed<CommandShortcut>G F</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { setIsCmdOpen(false); window.location.href = '/projects'; }}>Projects<CommandShortcut>G P</CommandShortcut></CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { setIsCmdOpen(false); setIsComposeOpen(true); }}>Compose<CommandShortcut>C</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { setIsCmdOpen(false); setActiveFilter('latest'); }}>Show Latest<CommandShortcut>L</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { setIsCmdOpen(false); setActiveFilter('following'); }}>Show Following<CommandShortcut>F</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { setIsCmdOpen(false); setActiveFilter('trending'); }}>Show Trending<CommandShortcut>T</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { setIsCmdOpen(false); setActiveFilter('media'); }}>Show Media<CommandShortcut>M</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { setIsCmdOpen(false); setActiveFilter('polls'); }}>Show Polls<CommandShortcut>P</CommandShortcut></CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <Dialog open={Boolean(lightbox)} onOpenChange={(v) => !v && setLightbox(null)}>
        <DialogContent className="max-w-3xl">
          {lightbox && (
            <img src={lightbox} alt="media" className="w-full h-auto rounded" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}