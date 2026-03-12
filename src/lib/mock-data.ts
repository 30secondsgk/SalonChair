
export type Service = {
  id: string;
  name: string;
  price: number;
  duration: string;
};

export type Salon = {
  id: string;
  name: string;
  ownerId: string;
  city: string;
  state: string;
  landmark: string;
  address: string;
  services: Service[];
  status: 'pending' | 'active' | 'hidden';
  subscriptionExpiry: Date;
  rating: number;
  image: string;
};

export type Booking = {
  id: string;
  salonId: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected' | 'noshow';
  createdAt: Date;
};

export const MOCK_SALONS: Salon[] = [
  {
    id: 's1',
    name: 'Elite Cuts',
    ownerId: 'o1',
    city: 'Mumbai',
    state: 'Maharashtra',
    landmark: 'Opposite Gateway Mall',
    address: '123 Marine Drive, Mumbai',
    services: [
      { id: 'sv1', name: 'Premium Haircut', price: 450, duration: '30 min' },
      { id: 'sv2', name: 'Shave & Trim', price: 200, duration: '20 min' },
      { id: 'sv3', name: 'Face Clean-up', price: 600, duration: '45 min' }
    ],
    status: 'active',
    subscriptionExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    rating: 4.8,
    image: 'https://picsum.photos/seed/salon1/600/400'
  },
  {
    id: 's2',
    name: 'Royal Barber Shop',
    ownerId: 'o2',
    city: 'Pune',
    state: 'Maharashtra',
    landmark: 'Near Central Railway Station',
    address: '45 Station Road, Pune',
    services: [
      { id: 'sv4', name: 'Classic Haircut', price: 150, duration: '20 min' },
      { id: 'sv5', name: 'Hot Towel Shave', price: 120, duration: '25 min' }
    ],
    status: 'active',
    subscriptionExpiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    rating: 4.5,
    image: 'https://picsum.photos/seed/salon2/600/400'
  },
  {
    id: 's3',
    name: 'Glow Up Studio',
    ownerId: 'o3',
    city: 'Mumbai',
    state: 'Maharashtra',
    landmark: 'Behind Phoenix Marketcity',
    address: '78 LBS Marg, Mumbai',
    services: [
      { id: 'sv6', name: 'Hair Coloring', price: 1200, duration: '90 min' },
      { id: 'sv7', name: 'Facial Spa', price: 800, duration: '60 min' }
    ],
    status: 'pending',
    subscriptionExpiry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    rating: 4.2,
    image: 'https://picsum.photos/seed/salon3/600/400'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    salonId: 's1',
    userId: 'u1',
    userName: 'John Doe',
    userPhone: '+919876543210',
    serviceId: 'sv1',
    date: '2024-06-20',
    time: '14:30',
    status: 'pending',
    createdAt: new Date()
  }
];
