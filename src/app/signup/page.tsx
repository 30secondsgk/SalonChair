"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore } from "@/firebase";
import { initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Scissors } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const router = useRouter();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      initiateEmailSignUp(auth, email, password);
      toast({
        title: "Account Created",
        description: "Welcome to Salon Chair! Redirecting...",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md rounded-3xl border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-white text-center pb-8 pt-10">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-headline font-bold">Join Salon Chair</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Create an account to start booking
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-10">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full py-6 rounded-2xl shadow-lg shadow-primary/20 text-lg font-bold">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 p-6 flex justify-center border-t">
          <Button variant="link" onClick={() => router.push("/login")} className="text-primary font-semibold">
            Already have an account? Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
