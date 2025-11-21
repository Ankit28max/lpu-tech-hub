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
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Lightbulb, Users, Rocket } from 'lucide-react'; // Icons for features
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';

// --- Sub-components for a cleaner structure ---

const HeroSection = () => {
    const typewriterWords = [
        { text: "Connect.", className: "text-zinc-900 dark:text-zinc-100" },
        { text: "Collaborate.", className: "text-zinc-900 dark:text-zinc-100" },
        { text: "Create.", className: "text-zinc-900 dark:text-zinc-100" },
        { text: "Succeed.", className: "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400" },
    ];
    const community = [
        { id: 1, name: "Aarav", designation: "Full‑stack", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Aarav" },
        { id: 2, name: "Diya", designation: "AI/ML", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Diya" },
        { id: 3, name: "Kabir", designation: "Mobile", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Kabir" },
        { id: 4, name: "Maya", designation: "Design", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Maya" },
        { id: 5, name: "Zoya", designation: "Web3", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Zoya" },
    ];
    return (
        <AuroraBackground className="pt-20 pb-20">
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <FadeIn>
                    <TypewriterEffectSmooth words={typewriterWords} />
                </FadeIn>
                <FadeIn delay={0.1}>
                    <p className="text-lg text-muted-foreground my-8 max-w-2xl mx-auto">
                        The exclusive platform for LPU students to connect, collaborate on projects, and find mentors in the tech community.
                    </p>
                </FadeIn>
                <FadeIn delay={0.2}>
                    <div className="mt-6 flex w-full items-center justify-center">
                        <AnimatedTooltip items={community} />
                    </div>
                </FadeIn>
            </div>
        </AuroraBackground>
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
            <FadeIn>
                <h2 className="text-center text-3xl font-bold mb-3">Everything You Need In One Place</h2>
                <p className="mx-auto mb-8 max-w-2xl text-center text-muted-foreground">Discover peers, mentors, and real projects. Learn in public and build a portfolio employers love.</p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {features.map((feature, i) => (
                    <FadeIn key={i} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"} className={feature.className}>
                        <BentoGridItem
                            title={feature.title}
                            description={feature.description}
                            header={<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">{feature.icon}</div>}
                            className="h-full"
                        />
                    </FadeIn>
                ))}
            </div>
        </section>
    );
};

const StatsSection = () => {
    const stats = [
        { label: 'Students', value: '12k+' },
        { label: 'Projects', value: '1.8k+' },
        { label: 'Mentors', value: '240+' },
    ];
    return (
        <section className="container mx-auto px-4 pb-20">
            <FadeIn>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {stats.map((s) => (
                        <Card key={s.label}>
                            <CardHeader>
                                <CardTitle className="text-4xl font-bold">{s.value}</CardTitle>
                                <CardDescription>{s.label}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </FadeIn>
        </section>
    );
};

const PartnersSection = () => {
    const partners = ['Hackathons', 'GDSC', 'Mozilla', 'Devfolio', 'GitHub', 'Polygon'];
    return (
        <section className="container mx-auto px-4 pb-10">
            <FadeIn>
                <h3 className="mb-6 text-center text-sm font-medium text-muted-foreground">Trusted by student clubs and communities</h3>
            </FadeIn>
            <FadeIn delay={0.1}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                    {partners.map((p) => (
                        <div key={p} className="flex items-center justify-center rounded-md border bg-background py-6 text-sm font-semibold text-muted-foreground">
                            {p}
                        </div>
                    ))}
                </div>
            </FadeIn>
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
        <FadeIn>
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Ready to Join the Hub?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Create your profile, showcase your projects, and start connecting with the best tech minds at LPU today.
            </p>
            <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg border-0">
                    Sign Up Now
                </Button>
            </Link>
        </FadeIn>
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
            <main>
                <HeroSection />
                <PartnersSection />
                <FeatureGrid />
                <StatsSection />
                <TestimonialsSection />
                <CallToActionSection />
            </main>
        </div>
    );
}