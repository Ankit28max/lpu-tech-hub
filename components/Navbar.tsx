// components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from './ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { 
  Home, 
  FolderOpen, 
  Users, 
  MessageSquare, 
  User, 
  LogOut, 
  Menu, 
  Settings,
  Bell,
  Search,
  Zap
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Navigation items
  const navItems = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/projects', label: 'Projects', icon: FolderOpen },
    { href: '/mentors', label: 'Mentors', icon: Users },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
  ];

  // Search suggestions
  const searchSuggestions = [
    { label: 'Search posts...', href: '/feed' },
    { label: 'Find projects...', href: '/projects' },
    { label: 'Browse mentors...', href: '/mentors' },
    { label: 'View messages...', href: '/messages' },
  ];

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If we are on the landing page AND the user is logged out, render the simple header.
  if (pathname === '/' && !user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LPU TechHub
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost" className="hover:bg-blue-50 hover:text-blue-600">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // For all other pages, or if the user is logged in, render the full application navbar.
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/feed" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LPU TechHub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg" 
                        : "hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side - User menu and notifications */}
        {user && (
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600 relative group">
                  <Search className="h-4 w-4" />
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Search <kbd className="ml-1 px-1 py-0.5 bg-slate-700 rounded text-xs">⌘K</kbd>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Search LPU TechHub</DialogTitle>
                </DialogHeader>
                <Command className="rounded-lg border shadow-md">
                  <CommandInput placeholder="Search posts, projects, mentors..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Quick Actions">
                      {searchSuggestions.map((suggestion) => (
                        <CommandItem key={suggestion.href} asChild>
                          <Link href={suggestion.href} onClick={() => setIsSearchOpen(false)}>
                            {suggestion.label}
                          </Link>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 hover:text-blue-600">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white">
                3
              </Badge>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.username}`} className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-indigo-500">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span>LPU TechHub</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start ${
                            isActive 
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" 
                              : "hover:bg-blue-50 hover:text-blue-600"
                          }`}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}