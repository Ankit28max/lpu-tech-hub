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
import { Spotlight } from '@/components/ui/spotlight';
import { GlowingCard } from '@/components/ui/glowing-card';
import { Lightbulb, Users, Rocket, Code, Terminal, Zap } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';

// --- Sub-components for a cleaner structure ---

const HeroSection = () => {
    const typewriterWords = [
        { text: "Connect.", className: "text-zinc-500 dark:text-zinc-500" },
        { text: "Collaborate.", className: "text-zinc-500 dark:text-zinc-500" },
        { text: "Create.", className: "text-zinc-500 dark:text-zinc-500" },
        { text: "Succeed.", className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" },
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black/[0.96] antialiased bg-grid-white/[0.02] pt-0">
            {/* Custom Navbar for Landing Page */}
            <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">LPU TechHub</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link href="/register">
                        <Button size="sm" className="bg-white text-black hover:bg-neutral-200 rounded-full px-6 font-semibold">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

            <div className="relative z-10 flex w-full max-w-7xl flex-col items-center justify-center p-4 text-center mt-20">
                <FadeIn>
                    <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 pb-4">
                        Build the Future <br /> at LPU TechHub
                    </h1>
                </FadeIn>

                <FadeIn delay={0.1}>
                    <div className="mt-4">
                        <TypewriterEffectSmooth words={typewriterWords} />
                    </div>
                </FadeIn>

                <FadeIn delay={0.2}>
                    <p className="mt-4 max-w-lg text-base font-normal text-neutral-300 mx-auto">
                        The exclusive platform for LPU students to connect, collaborate on projects, and find mentors in the tech community.
                    </p>
                </FadeIn>

                <FadeIn delay={0.3}>
                    <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-center">
                        <Link href="/register">
                            <Button size="lg" className="bg-white text-black hover:bg-neutral-200 rounded-full px-8 py-6 text-lg font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" size="lg" className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white rounded-full px-8 py-6 text-lg">
                                Login
                            </Button>
                        </Link>
                    </div>
                </FadeIn>

                <FadeIn delay={0.4} className="w-full">
                    <GlowingCard />
                </FadeIn>
            </div>
        </div>
    );
};

const FeatureGrid = () => {
    const features = [
        {
            title: "Project Board",
            description: "Find exciting projects and showcase your skills to the world.",
            icon: <Rocket className="h-6 w-6 text-blue-500" />,
            className: "md:col-span-2"
        },
        {
            title: "Find a Mentor",
            description: "Get guidance from experienced seniors and alumni.",
            icon: <Users className="h-6 w-6 text-purple-500" />,
            className: "col-span-1"
        },
        {
            title: "Tech Feed",
            description: "Share ideas, ask questions, and stay updated with latest tech.",
            icon: <Lightbulb className="h-6 w-6 text-yellow-500" />,
            className: "col-span-1"
        },
        {
            title: "Code Snippets",
            description: "Share and discover useful code snippets.",
            icon: <Code className="h-6 w-6 text-green-500" />,
            className: "col-span-1"
        },
        {
            title: "Hackathons",
            description: "Team up for upcoming hackathons and competitions.",
            icon: <Terminal className="h-6 w-6 text-pink-500" />,
            className: "col-span-1"
        },
        {
            title: "Build Your Profile",
            description: "Create your personal tech portfolio that stands out.",
            icon: <Zap className="h-6 w-6 text-orange-500" />,
            className: "md:col-span-3"
        },
    ];

    return (
        <section className="bg-black py-20 relative">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <FadeIn>
                    <h2 className="text-center text-3xl md:text-5xl font-bold mb-6 text-white">
                        Everything You Need <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">In One Place</span>
                    </h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-neutral-400 text-lg">
                        Discover peers, mentors, and real projects. Learn in public and build a portfolio employers love.
                    </p>
                </FadeIn>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <FadeIn key={i} delay={i * 0.1} className={feature.className}>
                            <BentoGridItem
                                title={feature.title}
                                description={feature.description}
                                header={<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">{feature.icon}</div>}
                                className="h-full min-h-[200px]"
                            />
                        </FadeIn>
                    ))}
                </div>
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
        <section className="bg-black py-20 border-t border-white/10">
            <div className="container mx-auto px-4">
                <FadeIn>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {stats.map((s) => (
                            <div key={s.label} className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 group-hover:to-white transition-all duration-300">{s.value}</span>
                                <span className="text-lg text-neutral-400 mt-2">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

const CommunitySection = () => {
    const community = [
        { id: 1, name: "Aarav", designation: "Full‑stack", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Aarav" },
        { id: 2, name: "Diya", designation: "AI/ML", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Diya" },
        { id: 3, name: "Kabir", designation: "Mobile", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Kabir" },
        { id: 4, name: "Maya", designation: "Design", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Maya" },
        { id: 5, name: "Zoya", designation: "Web3", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Zoya" },
        { id: 6, name: "Rohan", designation: "DevOps", image: "https://api.dicebear.com/7.x/thumbs/svg?seed=Rohan" },
    ];

    return (
        <section className="bg-black py-20 border-t border-white/10">
            <div className="container mx-auto px-4 text-center">
                <FadeIn>
                    <h2 className="text-3xl font-bold mb-8 text-white">Join the Community</h2>
                    <div className="flex flex-row items-center justify-center mb-10 w-full">
                        <AnimatedTooltip items={community} />
                    </div>
                    <p className="text-neutral-400 max-w-xl mx-auto">
                        Connect with thousands of other students building the future of tech.
                    </p>
                </FadeIn>
            </div>
        </section>
    );
}

const CallToActionSection = () => (
    <section className="bg-black py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>
        <div className="container mx-auto text-center relative z-10 px-4">
            <FadeIn>
                <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
                    Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Launch?</span>
                </h2>
                <p className="text-neutral-400 mb-10 max-w-xl mx-auto text-lg">
                    Create your profile, showcase your projects, and start connecting with the best tech minds at LPU today.
                </p>
                <Link href="/register">
                    <Button size="lg" className="bg-white text-black hover:bg-neutral-200 rounded-full px-10 py-8 text-xl font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300">
                        Join Now
                    </Button>
                </Link>
            </FadeIn>
        </div>
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
            <div className="flex justify-center items-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            <main>
                <HeroSection />
                <FeatureGrid />
                <StatsSection />
                <CommunitySection />
                <CallToActionSection />
            </main>
        </div>
    );
}