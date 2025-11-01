import { useState, useEffect } from 'react';
import { Plus, Package, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, Address } from '../../types';
import { NewOrderFlow } from '../Order/NewOrderFlow';
import { OrderTracking } from '../Order/OrderTracking';
import { OrderHistory } from '../Order/OrderHistory';

type View = 'home' | 'new-order' | 'orders' | 'profile';

export const HomePage = () => {
  const { currentUser, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;

    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.id)
      );
      const ordersSnap = await getDocs(ordersQuery);
      const ordersData = ordersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      setOrders(ordersData.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));

      const active = ordersData.find(
        (order) => !['completed', 'cancelled'].includes(order.status)
      );
      setActiveOrder(active || null);

      const addressesQuery = query(
        collection(db, 'addresses'),
        where('userId', '==', currentUser.id)
      );
      const addressesSnap = await getDocs(addressesQuery);
      const addressesData = addressesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];

      setAddresses(addressesData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (addressData: Omit<Address, 'id'>): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    const docRef = await addDoc(collection(db, 'addresses'), {
      ...addressData,
      userId: currentUser.id
    });

    setAddresses([...addresses, { ...addressData, id: docRef.id }]);
    return docRef.id;
  };

  const handleCreateOrder = async (orderData: {
    pickupAddress: Address;
    deliveryAddress: Address;
    services: string[];
    pickupTimeSlot: { id: string; date: string; time: string };
    deliveryTimeSlot: { id: string; date: string; time: string };
  }) => {
    if (!currentUser) return;

    const newOrder: Omit<Order, 'id'> = {
      userId: currentUser.id,
      pickupAddress: orderData.pickupAddress,
      deliveryAddress: orderData.deliveryAddress,
      services: orderData.services as Order['services'],
      pickupTimeSlot: orderData.pickupTimeSlot,
      deliveryTimeSlot: orderData.deliveryTimeSlot,
      status: 'pending',
      totalPrice: orderData.services.length * 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);
    const createdOrder = { ...newOrder, id: docRef.id };

    setOrders([createdOrder, ...orders]);
    setActiveOrder(createdOrder);
    setCurrentView('home');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'new-order':
        return (
          <NewOrderFlow
            onComplete={handleCreateOrder}
            onCancel={() => setCurrentView('home')}
            savedAddresses={addresses}
            onAddAddress={handleAddAddress}
          />
        );

      case 'orders':
        return <OrderHistory orders={orders} />;

      case 'profile':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-accent-100 flex items-center justify-center">
                      <User className="w-10 h-10 text-accent-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{currentUser?.name}</h3>
                    <p className="text-gray-600">{currentUser?.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Saved Addresses</h4>
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <div key={address.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{address.label}</p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome, {currentUser?.name}!</h1>
              <p className="text-primary-100">Your laundry, delivered fresh and clean</p>
            </div>

            {activeOrder && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Active Order</h2>
                <OrderTracking order={activeOrder} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentView('new-order')}
                className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group"
              >
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-600 transition-colors">
                  <Plus className="w-6 h-6 text-accent-600 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">New Order</h3>
                <p className="text-gray-600 text-sm">Schedule a new pickup</p>
              </button>

              <button
                onClick={() => setCurrentView('orders')}
                className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-left group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                  <Package className="w-6 h-6 text-primary-600 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">My Orders</h3>
                <p className="text-gray-600 text-sm">View order history</p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setCurrentView('home')}
              className="text-xl font-bold text-primary-700"
            >
              Joyful
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'home'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('orders')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'orders'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'profile'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};
