
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ShieldAlert, BarChart3, Building2, Search, Lock } from "lucide-react";
import { MOCK_SALONS, Salon } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [salons, setSalons] = useState<Salon[]>(MOCK_SALONS);
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Jumbopack") {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the Admin Command Center.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid administrator password.",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = (id: string, newStatus: 'active' | 'hidden' | 'pending') => {
    setSalons(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    toast({
      title: "Status Updated",
      description: `Salon status has been changed to ${newStatus}.`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md rounded-3xl shadow-xl border-none">
            <CardHeader className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Lock className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-headline font-bold">Secure Access</CardTitle>
              <CardDescription>Enter the administrative password to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full py-6 rounded-2xl font-bold">
                  Unlock Dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const activeCount = salons.filter(s => s.status === 'active').length;
  const pendingCount = salons.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-bold">Admin Central</h1>
          <p className="text-muted-foreground">Monitor platform health and authorize new partners.</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 text-primary p-4 rounded-2xl">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Salons</p>
                <p className="text-2xl font-headline font-bold">{salons.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-50 text-green-600 p-4 rounded-2xl">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-headline font-bold">₹{activeCount * 200}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Verification</p>
                <p className="text-2xl font-headline font-bold">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold">Registration Queue</h2>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                className="pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none" 
                placeholder="Search salons..." 
              />
            </div>
          </div>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold">Salon Name</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Subscription</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salons.map((salon) => (
                  <TableRow key={salon.id} className="hover:bg-muted/5">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold">{salon.name}</span>
                        <span className="text-xs text-muted-foreground">Owner ID: {salon.ownerId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{salon.city}, {salon.state}</span>
                        <span className="text-xs text-muted-foreground">{salon.landmark}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={salon.status === 'active' ? 'default' : salon.status === 'pending' ? 'secondary' : 'destructive'} className="rounded-full">
                        {salon.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {mounted ? (
                          salon.subscriptionExpiry < new Date() ? (
                            <span className="text-red-500">Expired</span>
                          ) : (
                            <span className="text-green-600">Paid</span>
                          )
                        ) : (
                          <span className="text-muted-foreground">Checking...</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {salon.status !== 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-lg text-green-600 hover:bg-green-50 gap-1"
                            onClick={() => toggleStatus(salon.id, 'active')}
                          >
                            <ShieldCheck className="h-3 w-3" /> Approve
                          </Button>
                        )}
                        {salon.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-lg text-red-600 hover:bg-red-50 gap-1"
                            onClick={() => toggleStatus(salon.id, 'hidden')}
                          >
                            <ShieldAlert className="h-3 w-3" /> Hide Shop
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="rounded-lg">Details</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
