// app/projects/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/ui/fade-in';
import { motion } from 'motion/react';

// TypeScript interface
interface Project {
  _id: string;
  title: string;
  description: string;
  owner: {
    username: string;
  };
  requiredSkills: string[];
  createdAt: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        if (response.ok) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (isLoading) {
    return <div className="text-center mt-10">Loading projects...</div>;
  }

  return (
    <div className="container mx-auto my-12 px-4 min-h-screen">
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Project Board
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover exciting projects, find your dream team, or launch your own big idea.
            </p>
          </div>
          {user && (
            <Link href="/projects/new">
              <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-none">
                + Post a Project
              </Button>
            </Link>
          )}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <FadeIn key={project._id} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="flex flex-col h-full border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm group overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 w-full" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {project.title}
                      </CardTitle>
                      <Badge variant="outline" className="shrink-0 bg-background/50 backdrop-blur-sm">
                        {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 pt-1">
                      <span className="text-xs">by</span>
                      <Link href={`/profile/${project.owner.username}`} className="font-medium text-foreground hover:text-indigo-600 hover:underline flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[10px] text-white font-bold">
                          {project.owner.username[0].toUpperCase()}
                        </div>
                        {project.owner.username}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.requiredSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/40 bg-muted/20">
                    <Link href={`/projects/${project._id}`} className="w-full">
                      <Button variant="ghost" className="w-full group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            </FadeIn>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              The board is empty. This is your chance to start something big!
            </p>
            {user && (
              <Link href="/projects/new">
                <Button size="lg" variant="outline" className="border-dashed border-2">
                  Create the First Project
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}