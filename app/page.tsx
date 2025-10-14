// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { Lightbulb, Users, Rocket } from 'lucide-react'; // Icons for features

// --- Sub-components for a cleaner structure ---

const LandingNav = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container h-14 flex items-center justify-between">
      <h1 className="text-xl font-bold text-indigo-600">LPU TechHub</h1>
      <div className="space-x-2">
        <Link href="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link href="/register">
          <Button>Get Started</Button>
        </Link>
      </div>
    </div>
  </header>
);

const HeroSection = () => {
    const typewriterWords = [
        { text: "Connect." },
        { text: "Collaborate." },
        { text: "Create." },
        { text: "Succeed.", className: "text-indigo-500" },
    ];
    return (
        <section className="flex flex-col items-center justify-center text-center pt-20 pb-20">
            <TypewriterEffectSmooth words={typewriterWords} />
            <p className="text-lg text-muted-foreground my-8 max-w-2xl mx-auto">
                The exclusive platform for LPU students to connect, collaborate on projects, and find mentors in the tech community.
            </p>
        </section>
    );
};

const FeatureGrid = () => {
    const features = [
        { title: "Project Board", description: "Find exciting projects and showcase your skills.", icon: <Rocket className="h-4 w-4 text-neutral-500" />, className: "md:col-span-2" },
        { title: "Find a Mentor", description: "Get guidance from experienced seniors.", icon: <Users className="h-4 w-4 text-neutral-500" />, className: "col-span-1" },
        { title: "Tech Feed", description: "Share ideas, ask questions, and stay updated.", icon: <Lightbulb className="h-4 w-4 text-neutral-500" />, className: "col-span-1" },
        { title: "Build Your Profile", description: "Create your personal tech portfolio.", icon: <Users className="h-4 w-4 text-neutral-500" />, className: "md:col-span-2" },
    ];
    return (
        <section className="container mx-auto px-4 pb-20">
             <h2 className="text-center text-3xl font-bold mb-10">Everything You Need In One Place</h2>
            <BentoGrid className="max-w-4xl mx-auto">
            {features.map((feature, i) => (
                <BentoGridItem
                key={i}
                title={feature.title}
                description={feature.description}
                header={<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">{feature.icon}</div>}
                className={feature.className}
                />
            ))}
            </BentoGrid>
        </section>
    );
};

const TestimonialsSection = () => {
    const testimonials = [
        { id: 1, name: "Ankit S.", designation: "CSE Final Year", image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Ankit", testimony: "Found my hackathon team here and we won! An amazing platform for collaboration." },
        { id: 2, name: "Priya K.", designation: "CSE 2nd Year", image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Priya", testimony: "A senior mentored me through my data structures course. I wouldn't have passed without this community." },
        { id: 3, name: "Rohan M.", designation: "Designer", image: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Rohan", testimony: "As a designer, I found developers for my side project in just a few days. Highly recommended." },
    ];
    return (
        <section className="bg-muted py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-center text-3xl font-bold mb-10">What Students Are Saying</h2>
                <div className="flex flex-row items-center justify-center mb-10 w-full">
                    <AnimatedTooltip items={testimonials} />
                </div>
            </div>
        </section>
    );
};

const CallToActionSection = () => (
    <section className="container mx-auto text-center py-20">
        <h2 className="text-4xl font-bold mb-4">Ready to Join the Hub?</h2>
        <p className="text-muted-foreground mb-8">Create your profile and start connecting today.</p>
        <Link href="/register">
            <Button size="lg">Sign Up Now</Button>
        </Link>
    </section>
);


// --- Main Page Component ---
export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/feed');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <main>
        <HeroSection />
        <FeatureGrid />
        <TestimonialsSection />
        <CallToActionSection />
      </main>
    </div>
  );
}