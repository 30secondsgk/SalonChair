'use client';
import { useState, useEffect } from 'react';
import { db } from '@/firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  price: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Load services from Firestore
  const fetchServices = async () => {
    const querySnapshot = await getDocs(collection(db, "services"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    setServices(data);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setAdding(true);
    await addDoc(collection(db, "services"), { name, price });
    setName(''); setPrice('');
    await fetchServices();
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "services", id));
    await fetchServices();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Salon Services</h1>
      
      {/* Add Service Form */}
      <form onSubmit={handleAddService} className="flex gap-4 mb-8">
        <Input placeholder="Service Name (e.g. Fade)" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Price (e.g. 30)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Button type="submit" disabled={adding}>
          {adding ? <Loader2 className="animate-spin" /> : <Plus className="mr-2" />} Add
        </Button>
      </form>

      {/* Services List */}
      {loading ? <Loader2 className="animate-spin mx-auto" /> : (
        <div className="space-y-4">
          {services.map(service => (
            <Card key={service.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <p className="font-bold text-lg">{service.name}</p>
                  <p className="text-muted-foreground">${service.price}</p>
                </div>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(service.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}