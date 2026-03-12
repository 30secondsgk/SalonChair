
'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  Calendar, 
  Scissors, 
  CreditCard,
  UserCheck,
  Store,
  Plus
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state for registration
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
  });

  // Query for the owner's salon
  const salonQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "salons"), where("ownerId", "==", user.uid));
  }, [db, user?.uid]);

  const { data: salons, isLoading: isSalonLoading } = useCollection(salonQuery);

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isSalonLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Checking salon records...</p>
      </div>
    );
  }

  const salon = salons?.[0];

  const handleRegisterSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setIsSubmitting(true);
    try {
      const salonRef = doc(collection(db, "salons"));
      const newSalon = {
        id: salonRef.id,
        ownerId: user.uid,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        isVerifiedByAdmin: false,
        isActive: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(salonRef, newSalon);
      
      toast({
        title: "Registration Successful",
        description: "Your salon is now listed and awaiting administrative verification.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not register salon.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!salon) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                <Store className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-headline font-bold mb-2">Register Your Salon</h1>
              <p className="text-muted-foreground">List your business on SalonChair to start reaching customers.</p>
            </div>

            <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white">
              <form onSubmit={handleRegisterSalon}>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Salon Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Royal Barber Shop" 
                      required 
                      className="rounded-xl"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe your salon's ambiance and specialties..." 
                      className="rounded-xl min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input 
                      id="address" 
                      placeholder="Street, Area, Building No." 
                      required 
                      className="rounded-xl"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="landmark">Landmark</Label>
                      <Input 
                        id="landmark" 
                        placeholder="e.g. Opp. City Mall" 
                        required 
                        className="rounded-xl"
                        value={formData.landmark}
                        onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        placeholder="e.g. Pune" 
                        required 
                        className="rounded-xl"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      placeholder="e.g. Maharashtra" 
                      required 
                      className="rounded-xl"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button type="submit" className="w-full py-6 rounded-2xl text-lg font-bold shadow-lg" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-headline font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground">Managing <strong>{salon.name}</strong></p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className={`py-1 px-4 ${salon.isActive ? 'text-green-600 bg-green-50 border-green-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
               {salon.isActive ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
               {salon.isActive ? 'Verified & Active' : 'Pending Verification'}
             </Badge>
             {!salon.isActive && (
               <p className="text-xs text-muted-foreground hidden lg:block max-w-[200px]">
                 Note: Your salon will appear in search results once verified.
               </p>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Pending Requests", value: "0", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Bookings Today", value: "0", icon: Calendar, color: "text-primary", bg: "bg-primary/5" },
            { label: "Earnings (Month)", value: "₹0", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
            { label: "User Flags Given", value: "0", icon: UserCheck, color: "text-red-600", bg: "bg-red-50" },
          ].map((stat, i) => (
            <Card key={i} className="rounded-3xl border-none shadow-sm overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-headline font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold">Incoming Requests</h2>
              <Button variant="ghost" size="sm" className="text-primary font-bold">View History</Button>
            </div>
            <Card className="rounded-3xl border-dashed py-20 flex flex-col items-center justify-center text-center bg-white">
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No booking requests at the moment.</p>
            </Card>
          </div>

          <div className="space-y-6">
             <Card className="rounded-3xl border-none shadow-xl bg-primary text-white p-6">
                <h3 className="text-xl font-headline font-bold mb-4">Store Info</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-primary-foreground/70 uppercase font-bold tracking-tight">Address</p>
                    <p className="text-sm leading-snug">{salon.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-primary-foreground/70 uppercase font-bold tracking-tight">Landmark</p>
                    <p className="text-sm">{salon.landmark}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-primary-foreground/70 uppercase font-bold tracking-tight">Location</p>
                    <p className="text-sm">{salon.city}, {salon.state}</p>
                  </div>
                  <Button variant="outline" className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl py-6 font-bold shadow-lg border-none mt-4">
                    Update Details
                  </Button>
                </div>
             </Card>

             <Card className="rounded-3xl border-none shadow-sm p-6 bg-white">
                <h3 className="text-xl font-headline font-bold mb-4">Salon Settings</h3>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-left">
                    <Plus className="h-4 w-4 text-primary" /> Add New Service
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-left">
                    <Scissors className="h-4 w-4 text-primary" /> Manage Services
                  </Button>
                </div>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
