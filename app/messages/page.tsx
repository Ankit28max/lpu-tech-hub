'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FadeIn } from '@/components/ui/fade-in';

interface ConversationItem {
  _id: string;
  participants: { _id: string; username: string }[];
  lastMessageAt: string;
}
interface MessageItem {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [thread, setThread] = useState<MessageItem[]>([]);
  const [message, setMessage] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const loadConversations = async () => {
    const res = await fetch('/api/messages', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setConversations(data.conversations || []);
  };

  const otherParticipant = (c: ConversationItem) => c.participants.find(p => p._id !== user?._id);
  const activePartner = useMemo(() => {
    const conv = conversations.find(c => c._id === activeConversationId);
    return conv ? otherParticipant(conv) : undefined;
  }, [conversations, activeConversationId]);

  const loadThread = async (conversationId: string) => {
    const url = `/api/messages?conversationId=${conversationId}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) setThread(data.messages || []);
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeConversationId) return;
    const partner = conversations.find(c => c._id === activeConversationId);
    const recipientId = partner ? otherParticipant(partner)?._id : undefined;
    if (!recipientId) return;
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId: activeConversationId, recipientId, content: message })
    });
    if (res.ok) {
      setMessage('');
      await loadThread(activeConversationId);
      await loadConversations();
      try {
        wsRef.current?.send(JSON.stringify({ type: 'message', conversationId: activeConversationId }));
      } catch {}
    }
  };

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (activeConversationId) loadThread(activeConversationId);
  }, [activeConversationId]);

  // Focus input when opening a conversation
  useEffect(() => {
    if (activeConversationId) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [activeConversationId, thread.length]);

  // Auto-open or create conversation from ?with= param
  useEffect(() => {
    const withId = searchParams?.get('with');
    if (!user || !withId) return;
    const ensureConversation = async () => {
      const res = await fetch(`/api/messages?with=${withId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.conversation?._id) {
        setActiveConversationId(data.conversation._id);
        setThread(data.messages || []);
        await loadConversations();
      }
    };
    ensureConversation();
  }, [searchParams, user]);

  // WebSocket connection for realtime updates
  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined') return;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${window.location.host}/api/messages/ws`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    // identify this user to server for presence
    ws.onopen = () => {
      try { ws.send(JSON.stringify({ type: 'init', userId: user._id })); } catch {}
    };
    ws.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'message') {
          await loadConversations();
          if (payload.conversationId && payload.conversationId === activeConversationId) {
            await loadThread(activeConversationId);
          }
        }
        if (payload.type === 'presence' && activePartner && payload.userId === activePartner._id) {
          setIsPartnerOnline(!!payload.online);
        }
        if (payload.type === 'typing' && payload.conversationId === activeConversationId && payload.userId !== user._id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 1200);
        }
      } catch {}
    };
    ws.onclose = () => { wsRef.current = null; };
    return () => {
      try { ws.close(); } catch {}
      wsRef.current = null;
    };
  }, [user, activeConversationId]);

  if (!user) {
    return (
      <div className="container mx-auto my-12 px-4 text-center">
        <p className="mb-4 text-muted-foreground">Please log in to view your messages.</p>
        <Link href="/login"><Button>Log in</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <FadeIn>
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
      </FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul>
                {conversations.map((c) => (
                  <li key={c._id}>
                    <button
                      className={`w-full text-left px-4 py-3 border-b hover:bg-muted ${activeConversationId === c._id ? 'bg-muted' : ''}`}
                      onClick={() => setActiveConversationId(c._id)}
                    >
                      {otherParticipant(c)?.username || 'Unknown'}
                    </button>
                  </li>
                ))}
                {conversations.length === 0 && (
                  <div className="px-4 py-6 text-sm text-muted-foreground">No conversations yet.</div>
                )}
              </ul>
            </CardContent>
          </Card>
        </aside>

        <section className="md:col-span-2">
          <Card className="h-[70vh] flex flex-col">
            <div className="border-b p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chatting with</p>
                <h2 className="text-xl font-semibold">
                  {activePartner?.username || 'Select a conversation'}
                  {activePartner && (
                    <span className={`ml-2 align-middle inline-flex items-center text-xs ${isPartnerOnline ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`mr-1 h-2 w-2 rounded-full ${isPartnerOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {isPartnerOnline ? 'online' : 'offline'}
                    </span>
                  )}
                </h2>
                {isTyping && <p className="text-xs text-muted-foreground mt-1">typing…</p>}
              </div>
            </div>
            <CardContent className="flex-1 overflow-y-auto space-y-3 p-4">
              {thread.map((m) => (
                <div key={m._id} className={`max-w-[80%] rounded-lg px-3 py-2 ${m.sender === user._id ? 'bg-indigo-600 text-white ml-auto' : 'bg-gray-100 text-gray-900'}`}>
                  <p>{m.content}</p>
                  <p className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</p>
                </div>
              ))}
              {thread.length === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-10">Select a conversation to view messages.</p>
              )}
            </CardContent>
            <div className="border-t p-3 flex items-center gap-2">
              <Textarea ref={inputRef} value={message} onChange={(e) => {
                setMessage(e.target.value);
                try {
                  if (wsRef.current && activeConversationId) {
                    wsRef.current.send(JSON.stringify({ type: 'typing', conversationId: activeConversationId, userId: user._id }));
                  }
                } catch {}
              }} placeholder="Type a message..." className="h-10 resize-none" />
              <Button onClick={sendMessage} disabled={!activeConversationId || !message.trim()}>Send</Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}


