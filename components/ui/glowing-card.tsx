"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Home, Users, FolderOpen, MessageSquare, Bell, Search, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

export const GlowingCard = () => {
    return (
        <div className="relative mx-auto mt-20 w-full max-w-5xl">
            {/* Glow Effect */}
            <div
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-30 blur-2xl transition duration-1000 group-hover:opacity-100 group-hover:duration-200"
            ></div>

            {/* Card Container */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl backdrop-blur-xl">
                {/* Screen Content Mockup */}
                <div className="aspect-[16/9] w-full bg-[#0a0a0a] flex flex-col">
                    {/* Browser Top Bar */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/40">
                        <div className="flex gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                            <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                            <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="ml-4 flex-1 max-w-md rounded-md bg-white/5 px-3 py-1 text-xs text-neutral-500 flex items-center">
                            <span className="mr-2">🔒</span> lpu-tech-hub.com/feed
                        </div>
                    </div>

                    {/* App Interface */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-64 border-r border-white/5 bg-black/20 p-4 hidden md:flex flex-col gap-6">
                            <div className="flex items-center gap-2 px-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600"></div>
                                <span className="font-bold text-white">TechHub</span>
                            </div>
                            <div className="space-y-1">
                                {[
                                    { icon: Home, label: "Feed", active: true },
                                    { icon: FolderOpen, label: "Projects", active: false },
                                    { icon: Users, label: "Mentors", active: false },
                                    { icon: MessageSquare, label: "Messages", active: false },
                                ].map((item, i) => (
                                    <div key={i} className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        item.active ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                    )}>
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="flex-1 p-6 overflow-hidden relative">
                            {/* Post Input */}
                            <div className="mb-6 rounded-xl border border-white/5 bg-white/5 p-4">
                                <div className="flex gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500"></div>
                                    <div className="flex-1">
                                        <div className="h-10 w-full rounded-lg bg-white/5 px-4 py-2 text-sm text-neutral-500">
                                            Share your latest project update...
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feed Post */}
                            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-500"></div>
                                        <div>
                                            <div className="font-semibold text-white text-sm">Alex Chen</div>
                                            <div className="text-xs text-neutral-500">2 hours ago</div>
                                        </div>
                                    </div>
                                    <MoreHorizontal className="h-4 w-4 text-neutral-500" />
                                </div>
                                <div className="mb-4 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-white/10"></div>
                                    <div className="h-4 w-full rounded bg-white/10"></div>
                                    <div className="h-4 w-5/6 rounded bg-white/10"></div>
                                </div>
                                <div className="h-48 w-full rounded-lg bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/5 flex items-center justify-center mb-4">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🚀</div>
                                        <div className="text-sm text-neutral-400">Project Launch: AI Tutor</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-neutral-400 text-sm">
                                    <div className="flex items-center gap-2"><Heart className="h-4 w-4" /> 24</div>
                                    <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> 5</div>
                                    <div className="flex items-center gap-2"><Share2 className="h-4 w-4" /> Share</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="w-64 border-l border-white/5 bg-black/20 p-4 hidden lg:block">
                            <div className="mb-4 text-sm font-semibold text-neutral-400">Trending Projects</div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                                        <div className="h-8 w-8 rounded bg-white/10"></div>
                                        <div>
                                            <div className="h-3 w-20 rounded bg-white/10 mb-1"></div>
                                            <div className="h-2 w-12 rounded bg-white/5"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Reflection/Gradient */}
            <div className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-20"></div>
        </div>
    );
};
