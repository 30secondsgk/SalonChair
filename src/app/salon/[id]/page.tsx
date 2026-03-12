
"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Info, Star, Clock, CheckCircle2 } from "lucide-react";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

export default function SalonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  // Fetch salon details
  const salonRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, "salons", id);
  }, [db, id]);
  const { data: salon, isLoading: isSalonLoading } = useDoc(salonRef);

  // Fetch salon services
  const servicesRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return collection(db, "salons", id, "services");
  }, [db, id]);
  const { data: services, isLoading: isServicesLoading } = useCollection(servicesRef);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isSalonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading salon details...</p>
      </div>
    );
  }

  if (!salon) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Salon not found</h1>
        <Button onClick={() => router.push('/')}>Back to Home</Button>
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) {
      toast({
        title: "Error",
        description: "Please select a service before booking.",
        variant: "destructive"
      });
      return;
    }
    setBookingStatus('submitting');
    setTimeout(() => {
      setBookingStatus('success');
      toast({
        title: "Booking Requested",
        description: "Your request has been sent to the owner. You'll receive a confirmation soon.",
      });
    }, 1500);
  };

  if (bookingStatus === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
          <div className="bg-white p-12 rounded-3xl shadow-lg border max-w-lg">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-headline font-bold mb-4">Request Sent!</h1>
            <p className="text-muted-foreground mb-8">
              We've notified <strong>{salon.name}</strong> of your appointment request. 
              Keep an eye on your phone for a confirmation SMS within the next 4 hours.
            </p>
            <div className="bg-muted/30 p-4 rounded-2xl mb-8 text-left">
              <p className="text-sm font-semibold mb-1">Landmark for your visit:</p>
              <p className="text-primary font-medium">{salon.landmark}</p>
            </div>
            <Button asChild className="w-full py-6 rounded-2xl">
              <a href="/">Browse more salons</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-96 w-full rounded-3xl overflow-hidden shadow-sm">
              <Image 
                src={salon.imageUrl || 'https://picsum.photos/seed/salon/800/600'}
                alt={salon.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">Open Now</Badge>
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="h-4 w-4 fill-amber-500 mr-1" /> {salon.rating || '4.5'}
                </div>
              </div>
              <h1 className="text-4xl font-headline font-bold mb-2">{salon.name}</h1>
              <p className="text-muted-foreground flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-1 text-primary" /> {salon.address}
              </p>
              <div className="mt-4 p-4 bg-white border rounded-2xl flex items-start gap-3">
                <Info className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Landmark</p>
                  <p className="text-muted-foreground text-sm">{salon.landmark}</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="services" className="w-full">
              <TabsList className="bg-white p-1 rounded-xl border w-full justify-start h-auto gap-2">
                <TabsTrigger value="services" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">Service Menu</TabsTrigger>
                <TabsTrigger value="about" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white">About</TabsTrigger>
              </TabsList>
              <TabsContent value="services" className="mt-6">
                {isServicesLoading ? (
                  <div className="p-8 text-center animate-pulse text-muted-foreground">Loading services...</div>
                ) : !services || services.length === 0 ? (
                  <div className="p-12 text-center bg-white border rounded-3xl border-dashed">
                    <p className="text-muted-foreground">This salon hasn't listed any services yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <Card 
                        key={service.id} 
                        className={`cursor-pointer transition-all border-2 rounded-2xl ${selectedService === service.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <CardContent className="p-4 flex justify-between items-center">
                          <div className="flex items-start gap-3">
                            <div className={`h-4 w-4 rounded-full border-2 mt-1 ${selectedService === service.id ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`} />
                            <div>
                              <p className="font-bold text-lg">{service.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> {service.durationMinutes} min
                              </p>
                            </div>
                          </div>
                          <p className="font-headline font-bold text-xl text-primary">₹{service.price}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="about" className="mt-6 bg-white p-8 rounded-3xl border">
                <h3 className="text-xl font-bold mb-4">The Experience</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {salon.description || `Located at the heart of ${salon.city}, ${salon.name} is dedicated to providing high-quality grooming services for the modern professional. Our experienced stylists use only premium products to ensure you walk out looking your absolute best.`}
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-3xl border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-primary p-6">
                <CardTitle className="text-white font-headline">Book Appointment</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Full Name</Label>
                    <Input id="userName" placeholder="Your Name" required className="rounded-xl" defaultValue={user?.displayName || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPhone">WhatsApp Number</Label>
                    <Input id="userPhone" placeholder="+91 12345 67890" required className="rounded-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" required className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" type="time" required className="rounded-xl" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-2xl mt-6 border border-dashed">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Selected Service</span>
                      <span className="text-sm font-bold">
                        {selectedService ? services?.find(s => s.id === selectedService)?.name : "None"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{selectedService ? services?.find(s => s.id === selectedService)?.price : "0"}
                      </span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg rounded-2xl shadow-lg shadow-primary/20"
                    disabled={bookingStatus === 'submitting'}
                  >
                    {bookingStatus === 'submitting' ? 'Processing...' : 'Request Slot'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
