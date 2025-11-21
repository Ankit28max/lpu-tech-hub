// app/notifications/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/fade-in';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';

export default function NotificationsPage() {
    const { user } = useAuth();

    // Mock notifications data
    const notifications = [
        {
            id: 1,
            type: 'like',
            user: 'John Doe',
            action: 'liked your post',
            time: '2 hours ago',
            link: '/feed',
            read: false,
        },
        {
            id: 2,
            type: 'comment',
            user: 'Jane Smith',
            action: 'commented on your project',
            time: '5 hours ago',
            link: '/projects',
            read: false,
        },
        {
            id: 3,
            type: 'follow',
            user: 'Mike Johnson',
            action: 'started following you',
            time: '1 day ago',
            link: '/feed',
            read: true,
        },
        {
            id: 4,
            type: 'like',
            user: 'Sarah Williams',
            action: 'liked your post',
            time: '2 days ago',
            link: '/feed',
            read: true,
        },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />;
            case 'comment':
                return <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
            case 'follow':
                return <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />;
            default:
                return <Bell className="h-5 w-5" />;
        }
    };

    const getIconBg = (type: string) => {
        switch (type) {
            case 'like':
                return 'bg-red-100 dark:bg-red-900/20';
            case 'comment':
                return 'bg-blue-100 dark:bg-blue-900/20';
            case 'follow':
                return 'bg-green-100 dark:bg-green-900/20';
            default:
                return 'bg-gray-100 dark:bg-gray-900/20';
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto my-12 px-4 min-h-screen flex items-center justify-center">
                <Card className="max-w-md text-center p-8">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                    <p className="text-muted-foreground">Please login to view your notifications.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto my-12 px-4 min-h-screen max-w-3xl">
            <FadeIn>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Notifications
                    </h1>
                    <p className="text-muted-foreground">Stay updated with your latest activity</p>
                </div>

                <div className="space-y-3">
                    {notifications.map((notification, index) => (
                        <FadeIn key={notification.id} delay={index * 0.05}>
                            <Link href={notification.link}>
                                <Card
                                    className={`border-none shadow-sm hover:shadow-md transition-all cursor-pointer ${notification.read
                                        ? 'bg-white/30 dark:bg-zinc-900/30'
                                        : 'bg-white/70 dark:bg-zinc-900/70 ring-2 ring-indigo-500/20'
                                        } backdrop-blur-sm`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex gap-4 items-start">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${getIconBg(notification.type)} flex-shrink-0`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm mb-1">
                                                    <span className="font-semibold">{notification.user}</span>{' '}
                                                    {notification.action}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{notification.time}</p>
                                            </div>
                                            {!notification.read && (
                                                <Badge className="bg-indigo-500 text-white flex-shrink-0">New</Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </FadeIn>
                    ))}
                </div>

                {notifications.length === 0 && (
                    <Card className="text-center p-12">
                        <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
                        <p className="text-muted-foreground">When you get notifications, they&apos;ll show up here.</p>
                    </Card>
                )}
            </FadeIn>
        </div>
    );
}
