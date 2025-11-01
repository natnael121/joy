import { Package, Truck, Droplets, CheckCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

const statusSteps: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: 'picked', label: 'Picked Up', icon: Package },
  { status: 'washing', label: 'Washing', icon: Droplets },
  { status: 'delivering', label: 'Delivering', icon: Truck },
  { status: 'completed', label: 'Completed', icon: CheckCircle }
];

const getStatusIndex = (status: OrderStatus): number => {
  if (status === 'cancelled' || status === 'pending') return -1;
  return statusSteps.findIndex((step) => step.status === status);
};

interface OrderTrackingProps {
  order: Order;
}

export const OrderTracking = ({ order }: OrderTrackingProps) => {
  const currentIndex = getStatusIndex(order.status);

  if (order.status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Order Cancelled</p>
      </div>
    );
  }

  if (order.status === 'pending') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium">Order Pending Confirmation</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>

      <div className="relative">
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${currentIndex >= 0 ? (currentIndex / (statusSteps.length - 1)) * 100 : 0}%`
            }}
          />
        </div>

        <div className="relative grid grid-cols-4 gap-4">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.status} className="flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <p
                  className={`mt-3 text-sm font-medium text-center ${
                    isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Order ID</p>
            <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium text-blue-600 capitalize">{order.status}</p>
          </div>
          <div>
            <p className="text-gray-600">Pickup Address</p>
            <p className="font-medium text-gray-900">{order.pickupAddress.label}</p>
          </div>
          <div>
            <p className="text-gray-600">Delivery Address</p>
            <p className="font-medium text-gray-900">{order.deliveryAddress.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
