
"use client";

import Link from "next/link";
import { Scissors, User, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Scissors className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-headline font-bold text-primary">SalonStack</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/owner">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Owner Dashboard
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="rounded-full">
            <User className="h-4 w-4 mr-2" />
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
}
