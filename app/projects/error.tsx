'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Projects page error:', error);
    }, [error]);

    return (
        <div className="container mx-auto my-12 px-4 min-h-screen flex items-center justify-center">
            <div className="max-w-md text-center space-y-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Something went wrong!</h2>
                    <p className="text-muted-foreground">
                        We encountered an error while loading the projects page.
                    </p>
                </div>
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => reset()} variant="default">
                        Try again
                    </Button>
                    <Button onClick={() => window.location.href = '/feed'} variant="outline">
                        Go to Feed
                    </Button>
                </div>
            </div>
        </div>
    );
}
