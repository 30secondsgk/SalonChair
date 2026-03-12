'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, User, LayoutDashboard, LogOut, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out.',
        });
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Scissors className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-headline font-bold text-primary flex items-center">
            Salon Chair
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-9 w-9 ml-2"
            >
              <path d="M6 21h12" />
              <path d="M12 21v-5" />
              <path d="M9 16h7c1 0 2-1 2-2V7c0-1-1-2-2-2" />
              <path d="M14 11H8" />
              <path d="M9 16l-3 4" />
            </svg>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Link href="/bookings">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary font-semibold">
                    <Calendar className="h-4 w-4" />
                    My Bookings
                  </Button>
                </Link>
                <Link href="/owner">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary font-semibold">
                    <LayoutDashboard className="h-4 w-4" />
                    Salon Owner
                  </Button>
                </Link>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-white">
                        {user.email?.[0].toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/bookings">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/owner">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Salon Owner</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="rounded-full">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
