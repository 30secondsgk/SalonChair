
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Search, Filter, Calendar } from "lucide-react";
import { MOCK_SALONS, Salon } from "@/lib/mock-data";
import { useUser } from "@/firebase";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [state, setState] = useState<string>("all");
  const [city, setCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-salon');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const filteredSalons = MOCK_SALONS.filter(salon => {
    const matchesState = state === "all" || salon.state === state;
    const matchesCity = city === "" || salon.city.toLowerCase().includes(city.toLowerCase());
    const matchesSearch = salon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = salon.status === 'active';
    return matchesState && matchesCity && matchesSearch && isActive;
  });

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-white border-b overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-primary leading-tight">
              Premium Styling,<br /> Effortless Booking.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find the best salons in your neighborhood and book your next grooming session in seconds.
            </p>
            
            <div className="flex flex-col md:flex-row gap-3 p-2 bg-muted/30 rounded-2xl border shadow-sm">
              <div className="flex-1 flex items-center bg-white rounded-xl px-3 border focus-within:ring-2 ring-primary/20">
                <Search className="h-5 w-5 text-muted-foreground mr-2" />
                <Input 
                  placeholder="Search salons..." 
                  className="border-none shadow-none focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select onValueChange={setState} value={state}>
                <SelectTrigger className="md:w-[180px] bg-white rounded-xl">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 flex items-center bg-white rounded-xl px-3 border">
                <MapPin className="h-5 w-5 text-muted-foreground mr-2" />
                <Input 
                  placeholder="City..." 
                  className="border-none shadow-none focus-visible:ring-0"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <Button size="lg" className="rounded-xl px-8">Find Salons</Button>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-full lg:w-2/5 opacity-10 lg:opacity-20 pointer-events-none">
           {heroImage && (
             <Image 
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
             />
           )}
        </div>
      </section>

      {/* Directory Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-headline font-bold">Recommended Salons</h2>
            <p className="text-muted-foreground">Based on your filters ({filteredSalons.length} results)</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSalons.map((salon) => (
            <SalonCard key={salon.id} salon={salon} />
          ))}
          {filteredSalons.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed">
              <p className="text-lg font-medium text-muted-foreground">No active salons found matching your criteria.</p>
              <Button variant="link" onClick={() => {setState("all"); setCity(""); setSearchQuery("");}}>Clear all filters</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SalonCard({ salon }: { salon: Salon }) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-3xl border-none bg-white">
      <div className="relative h-56 w-full">
        <Image 
          src={salon.image}
          alt={salon.name}
          fill
          className="object-cover transition-transform group-hover:scale-105 duration-500"
          data-ai-hint="salon shop"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 text-primary hover:bg-white font-semibold backdrop-blur-sm">
            <Star className="h-3 w-3 fill-primary mr-1" /> {salon.rating}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-headline font-bold">{salon.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" /> {salon.city}, {salon.state}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm bg-accent/10 text-accent font-medium p-2 rounded-lg mb-4">
          📍 {salon.landmark}
        </p>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services offered:</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {salon.services.slice(0, 3).map(service => (
              <Badge key={service.id} variant="secondary" className="font-normal">
                {service.name}
              </Badge>
            ))}
            {salon.services.length > 3 && (
              <Badge variant="outline" className="font-normal">+{salon.services.length - 3} more</Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 border-t mt-auto p-4 flex gap-2">
        <Link href={`/salon/${salon.id}`} className="flex-1">
          <Button className="w-full rounded-xl gap-2">
            <Calendar className="h-4 w-4" /> Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
