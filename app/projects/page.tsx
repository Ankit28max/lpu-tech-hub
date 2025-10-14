// app/projects/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="container mx-auto my-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold">Project Board</h1>
            <p className="text-muted-foreground">Find a team or build yours.</p>
        </div>
        {user && (
          <Link href="/projects/new">
             <Button>+ Post a Project</Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project._id} className="flex flex-col">
                <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>
                        Posted by <Link href={`/profile/${project.owner.username}`} className="font-medium text-indigo-600 hover:underline">{project.owner.username}</Link>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {project.requiredSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">{new Date(project.createdAt).toLocaleDateString()}</p>
                </CardFooter>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 mt-10">No open projects right now. Why not post one?</p>
        )}
      </div>
    </div>
  );
}