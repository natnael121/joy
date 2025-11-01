import { Calendar, MapPin, Package } from 'lucide-react';
import { Order } from '../../types';

interface OrderHistoryProps {
  orders: Order[];
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'delivering':
      return 'bg-blue-100 text-blue-800';
    case 'washing':
      return 'bg-yellow-100 text-yellow-800';
    case 'picked':
      return 'bg-cyan-100 text-cyan-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const OrderHistory = ({ orders }: OrderHistoryProps) => {
  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">Start by creating your first order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${order.totalPrice}</p>
                <p className="text-sm text-gray-600">{order.services.length} services</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pickup</p>
                    <p className="text-sm text-gray-600">{order.pickupAddress.label}</p>
                    <p className="text-xs text-gray-500">
                      {order.pickupTimeSlot.date} at {order.pickupTimeSlot.time}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Delivery</p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress.label}</p>
                    <p className="text-xs text-gray-500">
                      {order.deliveryTimeSlot.date} at {order.deliveryTimeSlot.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-gray-900 mb-2">Services:</p>
              <div className="flex flex-wrap gap-2">
                {order.services.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {service.charAt(0).toUpperCase() + service.slice(1).replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
