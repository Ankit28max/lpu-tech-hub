// app/profile/[username]/not-found.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserX, ArrowLeft } from 'lucide-react';

export default function ProfileNotFound() {
    return (
        <div className="container mx-auto my-12 px-4 min-h-screen flex items-center justify-center">
            <Card className="max-w-md text-center p-12 border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserX className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
                <p className="text-muted-foreground mb-8">
                    The profile you're looking for doesn't exist or may have been removed.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link href="/mentors">
                        <Button variant="outline">
                            Find Mentors
                        </Button>
                    </Link>
                    <Link href="/feed">
                        <Button>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go to Feed
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
