// app/projects/[projectId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FadeIn } from '@/components/ui/fade-in';
import { ArrowLeft, Calendar, User, Briefcase } from 'lucide-react';

interface ProjectDetail {
    _id: string;
    title: string;
    description: string;
    owner: {
        _id: string;
        username: string;
        bio?: string;
    };
    requiredSkills: string[];
    status: string;
    createdAt: string;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${params.projectId}`);
                const data = await response.json();

                if (response.ok) {
                    setProject(data.project);
                } else {
                    setError(data.message || 'Failed to load project');
                }
            } catch (err) {
                setError('An error occurred while loading the project');
                console.error('Error fetching project:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.projectId) {
            fetchProject();
        }
    }, [params.projectId]);

    if (isLoading) {
        return (
            <div className="container mx-auto my-12 px-4 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="container mx-auto my-12 px-4 min-h-screen">
                <FadeIn>
                    <Card className="max-w-2xl mx-auto text-center p-12">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
                        <p className="text-muted-foreground mb-8">{error || 'The project you are looking for does not exist.'}</p>
                        <Link href="/projects">
                            <Button>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Projects
                            </Button>
                        </Link>
                    </Card>
                </FadeIn>
            </div>
        );
    }

    return (
        <div className="container mx-auto my-12 px-4 min-h-screen">
            <FadeIn>
                {/* Back Button */}
                <Link href="/projects">
                    <Button variant="ghost" className="mb-6 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 w-full" />
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                            {project.title}
                                        </CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                                {project.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {project.description}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.requiredSkills.map((skill, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Owner Card */}
                        <Card className="border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Project Owner</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 ring-2 ring-indigo-500/20">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${project.owner.username}`}
                                            alt={project.owner.username}
                                        />
                                        <AvatarFallback>{project.owner.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Link
                                            href={`/profile/${project.owner.username}`}
                                            className="font-semibold hover:text-indigo-600 transition-colors"
                                        >
                                            {project.owner.username}
                                        </Link>
                                        {project.owner.bio && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">{project.owner.bio}</p>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/profile/${project.owner.username}`} className="block">
                                    <Button variant="outline" className="w-full">
                                        <User className="mr-2 h-4 w-4" />
                                        View Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Action Card */}
                        {user && user._id !== project.owner._id && (
                            <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                <CardHeader>
                                    <CardTitle className="text-white">Interested?</CardTitle>
                                    <CardDescription className="text-indigo-100">
                                        Reach out to the project owner to collaborate
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/messages`}>
                                        <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                                            Send Message
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </FadeIn>
        </div>
    );
}
