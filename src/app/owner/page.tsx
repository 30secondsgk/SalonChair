
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  IndianRupee, 
  Calendar, 
  Scissors, 
  CreditCard,
  UserCheck
} from "lucide-react";
import { MOCK_SALONS, MOCK_BOOKINGS, Booking } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const salon = MOCK_SALONS[0]; // Assuming logged in as owner of s1

  const handleAction = (id: string, action: 'accepted' | 'rejected') => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
    toast({
      title: `Booking ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: action === 'accepted' ? "User notified with landmark details." : "User notified with nearby suggestions.",
    });
  };

  const handleNoShow = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'noshow' } : b));
    toast({
      title: "User Flagged",
      description: "User has been marked as a No-Show. 3 flags result in a 30-day ban.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-headline font-bold">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage your salon <strong>{salon.name}</strong></p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="py-1 px-4 text-green-600 bg-green-50 border-green-200">
               <CheckCircle className="h-3 w-3 mr-1" /> Active
             </Badge>
             <Button variant="secondary" className="gap-2 rounded-xl">
               <CreditCard className="h-4 w-4" /> Renew Subscription
             </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Pending Requests", value: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Bookings Today", value: "8", icon: Calendar, color: "text-primary", bg: "bg-primary/5" },
            { label: "Earnings (Month)", value: "₹12,400", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
            { label: "User Flags Given", value: "2", icon: UserCheck, color: "text-red-600", bg: "bg-red-50" },
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
          {/* Recent Bookings */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-headline font-bold">Incoming Requests</h2>
            {bookings.length === 0 ? (
              <Card className="rounded-3xl border-dashed py-12 flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground mb-4">No incoming booking requests at the moment.</p>
                <Button variant="outline" className="rounded-xl">Refresh List</Button>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className={`rounded-3xl border-none shadow-sm overflow-hidden ${booking.status === 'pending' ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <h3 className="text-lg font-bold">{booking.userName}</h3>
                           <Badge variant={booking.status === 'pending' ? 'secondary' : booking.status === 'accepted' ? 'default' : 'destructive'} className="rounded-full">
                             {booking.status}
                           </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.date} @ {booking.time}</span>
                          <span className="flex items-center gap-1"><Scissors className="h-3 w-3" /> {salon.services.find(s => s.id === booking.serviceId)?.name}</span>
                          <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> ₹{salon.services.find(s => s.id === booking.serviceId)?.price}</span>
                        </div>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="default" 
                            className="flex-1 md:flex-none rounded-xl bg-green-600 hover:bg-green-700 gap-2"
                            onClick={() => handleAction(booking.id, 'accepted')}
                          >
                            <CheckCircle className="h-4 w-4" /> Accept
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1 md:flex-none rounded-xl gap-2"
                            onClick={() => handleAction(booking.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}

                      {booking.status === 'accepted' && (
                        <Button 
                          variant="outline" 
                          className="rounded-xl gap-2 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleNoShow(booking.id)}
                        >
                          Mark No-Show
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Quick Actions / Profile Summary */}
          <div className="space-y-6">
             <Card className="rounded-3xl border-none shadow-xl bg-primary text-white p-6">
                <h3 className="text-xl font-headline font-bold mb-4">Subscription Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-primary-foreground/80">
                    <span>Current Plan</span>
                    <span className="font-bold text-white">Monthly Basic</span>
                  </div>
                  <div className="flex justify-between items-center text-primary-foreground/80">
                    <span>Amount</span>
                    <span className="font-bold text-white">₹200 / Month</span>
                  </div>
                  <div className="flex justify-between items-center text-primary-foreground/80">
                    <span>Next Due</span>
                    <span className="font-bold text-white">{salon.subscriptionExpiry.toLocaleDateString()}</span>
                  </div>
                  <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl py-6 font-bold shadow-lg">
                    Pay Now
                  </Button>
                </div>
             </Card>

             <Card className="rounded-3xl border-none shadow-sm p-6 bg-white">
                <h3 className="text-xl font-headline font-bold mb-4">Store Settings</h3>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start rounded-xl gap-3">
                    <UserCheck className="h-4 w-4 text-primary" /> Edit Store Profile
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-xl gap-3">
                    <Scissors className="h-4 w-4 text-primary" /> Manage Services
                  </Button>
                  <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <XCircle className="h-4 w-4" /> Temporarily Close Shop
                  </Button>
                </div>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
