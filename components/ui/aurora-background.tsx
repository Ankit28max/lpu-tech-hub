import { cn } from "@/lib/utils";
import React from "react";

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function AuroraBackground({ className, children }: AuroraBackgroundProps) {
  return (
    <div className={cn("relative", className)}>
      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      </div>
      {children}
    </div>
  );
}


