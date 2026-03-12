'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  Calendar, 
  Scissors, 
  UserCheck,
  Store,
  Plus,
  Camera,
  Trash2,
  Pencil,
  Loader2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, serverTimestamp, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OwnerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isUpdatingService, setIsUpdatingService] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<any | null>(null);

  // Form state for registration
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    imageUrl: "",
  });

  // Form state for new service
  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: "30",
  });

  // Query for the owner's salon
  const salonQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "salons"), where("ownerId", "==", user.uid));
  }, [db, user?.uid]);

  const { data: salons, isLoading: isSalonLoading } = useCollection(salonQuery);
  const salon = salons?.[0];

  // Query for services of the salon
  const servicesQuery = useMemoFirebase(() => {
    if (!db || !salon?.id) return null;
    return collection(db, "salons", salon.id, "services");
  }, [db, salon?.id]);

  const { data: services, isLoading: isServicesLoading } = useCollection(servicesQuery);

  useEffect(() => {
    setMounted(true);
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    if (!formData.imageUrl) {
      toast({
        title: "Photo Required",
        description: "Please upload a photo of your salon's front side.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
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
      imageUrl: formData.imageUrl,
      isVerifiedByAdmin: false,
      isActive: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    setDoc(salonRef, newSalon)
      .then(() => {
        toast({
          title: "Registration Successful",
          description: "Your salon is now listed and awaiting administrative verification.",
        });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: salonRef.path,
          operation: 'create',
          requestResourceData: newSalon
        }));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !salon) return;

    setIsAddingService(true);
    const serviceRef = doc(collection(db, "salons", salon.id, "services"));
    const newService = {
      id: serviceRef.id,
      salonId: salon.id,
      salonOwnerId: user.uid, // Denormalized for security rules
      name: serviceData.name,
      description: serviceData.description,
      price: Number(serviceData.price),
      durationMinutes: Number(serviceData.durationMinutes),
    };

    setDoc(serviceRef, newService)
      .then(() => {
        toast({
          title: "Service Added",
          description: `${newService.name} has been added to your menu.`,
        });
        setServiceData({ name: "", description: "", price: "", durationMinutes: "30" });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: serviceRef.path,
          operation: 'create',
          requestResourceData: newService
        }));
      })
      .finally(() => setIsAddingService(false));
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !salon || !editingService) return;

    setIsUpdatingService(true);
    const serviceRef = doc(db, "salons", salon.id, "services", editingService.id);
    const updatedData = {
      name: editingService.name,
      description: editingService.description,
      price: Number(editingService.price),
      durationMinutes: Number(editingService.durationMinutes),
    };

    updateDoc(serviceRef, updatedData)
      .then(() => {
        toast({
          title: "Service Updated",
          description: "Your service details have been saved.",
        });
        setEditingService(null);
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: serviceRef.path,
          operation: 'update',
          requestResourceData: updatedData
        }));
      })
      .finally(() => setIsUpdatingService(false));
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!db || !salon) return;
    const serviceRef = doc(db, "salons", salon.id, "services", serviceId);
    
    deleteDoc(serviceRef)
      .then(() => {
        toast({
          title: "Service Removed",
          description: "The service has been removed from your menu.",
        });
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: serviceRef.path,
          operation: 'delete'
        }));
      });
  };

  if (isUserLoading || isSalonLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Checking salon records...</p>
      </div>
    );
  }

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
                  <div className="space-y-4">
                    <Label>Salon Front-Side Photo</Label>
                    <div 
                      className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors bg-muted/10 relative overflow-hidden aspect-video"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      {imagePreview ? (
                        <Image 
                          src={imagePreview} 
                          alt="Salon Preview" 
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <>
                          <div className="bg-primary/10 p-4 rounded-2xl text-primary mb-3">
                            <Camera className="h-6 w-6" />
                          </div>
                          <p className="font-medium">Click to upload salon photo</p>
                          <p className="text-xs text-muted-foreground mt-1">Clear shot of the shop front is recommended</p>
                        </>
                      )}
                    </div>
                    <input 
                      id="photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </div>

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
            <h1 className="text-3xl font-headline font-bold">Salon Owner Dashboard</h1>
            <p className="text-muted-foreground">Managing <strong>{salon.name}</strong></p>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className={`py-1 px-4 ${salon.isActive ? 'text-green-600 bg-green-50 border-green-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
               {salon.isActive ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
               {salon.isActive ? 'Verified & Active' : 'Pending Verification'}
             </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white">
              <div className="relative aspect-video w-full">
                <Image 
                  src={salon.imageUrl || 'https://picsum.photos/seed/salon/400/300'} 
                  alt={salon.name} 
                  fill 
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-headline font-bold mb-4">Salon Identity</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Address</p>
                    <p className="text-sm leading-snug">{salon.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Landmark</p>
                    <p className="text-sm">{salon.landmark}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Location</p>
                    <p className="text-sm">{salon.city}, {salon.state}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm p-6 bg-white">
                <h3 className="text-xl font-headline font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-left">
                        <Plus className="h-4 w-4 text-primary" /> Add New Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Add New Service</DialogTitle>
                        <DialogDescription>Define a service your salon offers.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddService} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="s-name">Service Name</Label>
                          <Input 
                            id="s-name" 
                            placeholder="e.g. Haircut & Styling" 
                            required 
                            value={serviceData.name}
                            onChange={(e) => setServiceData({...serviceData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="s-desc">Description (Optional)</Label>
                          <Textarea 
                            id="s-desc" 
                            placeholder="Brief details about the service..."
                            value={serviceData.description}
                            onChange={(e) => setServiceData({...serviceData, description: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="s-price">Price (₹)</Label>
                            <Input 
                              id="s-price" 
                              type="number" 
                              required 
                              placeholder="450"
                              value={serviceData.price}
                              onChange={(e) => setServiceData({...serviceData, price: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="s-dur">Duration (Min)</Label>
                            <Input 
                              id="s-dur" 
                              type="number" 
                              required 
                              placeholder="30"
                              value={serviceData.durationMinutes}
                              onChange={(e) => setServiceData({...serviceData, durationMinutes: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" className="w-full rounded-2xl" disabled={isAddingService}>
                            {isAddingService ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Create Service
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start rounded-xl gap-3 text-left">
                        <Scissors className="h-4 w-4 text-primary" /> Manage Services
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Service Menu</DialogTitle>
                        <DialogDescription>List of services offered by {salon.name}.</DialogDescription>
                      </DialogHeader>
                      <div className="mt-4 border rounded-2xl overflow-hidden">
                        {isServicesLoading ? (
                          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading menu...</div>
                        ) : !services || services.length === 0 ? (
                          <div className="p-12 text-center text-muted-foreground">No services added yet.</div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {services.map((svc) => (
                                <TableRow key={svc.id}>
                                  <TableCell className="font-medium">{svc.name}</TableCell>
                                  <TableCell>₹{svc.price}</TableCell>
                                  <TableCell>{svc.durationMinutes} min</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Dialog open={editingService?.id === svc.id} onOpenChange={(open) => !open && setEditingService(null)}>
                                        <DialogTrigger asChild>
                                          <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-primary hover:bg-primary/5"
                                            onClick={() => setEditingService(svc)}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-3xl">
                                          <DialogHeader>
                                            <DialogTitle>Edit Service</DialogTitle>
                                            <DialogDescription>Update details for {svc.name}.</DialogDescription>
                                          </DialogHeader>
                                          <form onSubmit={handleUpdateService} className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-name">Service Name</Label>
                                              <Input 
                                                id="edit-name" 
                                                required 
                                                value={editingService?.name || ""}
                                                onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-desc">Description</Label>
                                              <Textarea 
                                                id="edit-desc" 
                                                value={editingService?.description || ""}
                                                onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                                              />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-price">Price (₹)</Label>
                                                <Input 
                                                  id="edit-price" 
                                                  type="number" 
                                                  required 
                                                  value={editingService?.price || ""}
                                                  onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                                                />
                                              </div>
                                              <div className="space-y-2">
                                                <Label htmlFor="edit-dur">Duration (Min)</Label>
                                                <Input 
                                                  id="edit-dur" 
                                                  type="number" 
                                                  required 
                                                  value={editingService?.durationMinutes || ""}
                                                  onChange={(e) => setEditingService({...editingService, durationMinutes: e.target.value})}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button type="submit" className="w-full rounded-2xl" disabled={isUpdatingService}>
                                                {isUpdatingService ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                Save Changes
                                              </Button>
                                            </DialogFooter>
                                          </form>
                                        </DialogContent>
                                      </Dialog>

                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:bg-red-50"
                                        onClick={() => handleDeleteService(svc.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
             </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Pending Requests", value: "0", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                { label: "Bookings Today", value: "0", icon: Calendar, color: "text-primary", bg: "bg-primary/5" },
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

            <div className="space-y-6">
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
          </div>
        </div>
      </main>
    </div>
  );
}
