export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export type ServiceType = 'wash' | 'dry-clean' | 'iron' | 'fold';

export interface Service {
  id: ServiceType;
  name: string;
  description: string;
  price: number;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export type OrderStatus = 'pending' | 'picked' | 'washing' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  services: ServiceType[];
  pickupTimeSlot: TimeSlot;
  deliveryTimeSlot: TimeSlot;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}
