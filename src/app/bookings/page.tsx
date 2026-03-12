'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Store, Scissors, Loader2, ChevronRight } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import Link from 'next/link';

export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bookingsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'appointments'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: bookings, isLoading } = useCollection(bookingsQuery);

  if (!mounted || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-headline font-bold">My Bookings</h1>
              <p className="text-muted-foreground">Track your requests and session history.</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="rounded-xl">Find a Salon</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-3xl animate-pulse h-32" />
              ))}
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <Card className="rounded-3xl border-dashed py-20 flex flex-col items-center justify-center text-center bg-white">
              <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                You haven't requested any appointments. Browse top-rated salons and book your first session today!
              </p>
              <Link href="/">
                <Button className="rounded-2xl px-8">Explore Salons</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="rounded-3xl border-none shadow-sm bg-white overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className={`w-2 md:w-3 ${
                        booking.status === 'Accepted' ? 'bg-green-500' :
                        booking.status === 'Rejected' ? 'bg-red-500' :
                        booking.status === 'NoShow' ? 'bg-amber-500' :
                        'bg-primary'
                      }`} />
                      
                      <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex gap-4 items-start">
                          <div className="bg-muted p-4 rounded-2xl text-primary">
                            <Scissors className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg">{booking.salonName}</h4>
                              <StatusBadge status={booking.status} />
                            </div>
                            <p className="text-sm font-medium text-primary mb-2">{booking.serviceName}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(booking.requestedDateTime.split('T')[0]), 'PPP')}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {booking.requestedDateTime.split('T')[1]}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Store className="h-4 w-4" />
                                {booking.salonName}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <div className="text-right flex-1 md:flex-none">
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Amount</p>
                            <p className="text-xl font-headline font-bold text-primary">₹{booking.estimatedTotalAmount}</p>
                          </div>
                          <Link href={`/salon/${booking.salonId}`}>
                            <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-primary/10 text-primary border-primary/20',
    Accepted: 'bg-green-50 text-green-600 border-green-200',
    Rejected: 'bg-red-50 text-red-600 border-red-200',
    Completed: 'bg-blue-50 text-blue-600 border-blue-200',
    Cancelled: 'bg-muted text-muted-foreground border-border',
    NoShow: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase ${styles[status] || styles.Pending}`}>
      {status}
    </Badge>
  );
}
