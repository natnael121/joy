import { Droplets, Wind, Zap, FoldVertical } from 'lucide-react';
import { Service, ServiceType } from '../../types';

const services: Service[] = [
  {
    id: 'wash',
    name: 'Wash & Dry',
    description: 'Complete washing and drying service',
    price: 15
  },
  {
    id: 'dry-clean',
    name: 'Dry Clean',
    description: 'Professional dry cleaning',
    price: 25
  },
  {
    id: 'iron',
    name: 'Iron & Press',
    description: 'Crisp ironing and pressing',
    price: 10
  },
  {
    id: 'fold',
    name: 'Fold & Pack',
    description: 'Neat folding and packaging',
    price: 8
  }
];

const getServiceIcon = (id: ServiceType) => {
  switch (id) {
    case 'wash':
      return Droplets;
    case 'dry-clean':
      return Wind;
    case 'iron':
      return Zap;
    case 'fold':
      return FoldVertical;
  }
};

interface ServiceSelectorProps {
  selectedServices: ServiceType[];
  onToggleService: (serviceId: ServiceType) => void;
}

export const ServiceSelector = ({
  selectedServices,
  onToggleService
}: ServiceSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Select Services</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((service) => {
          const Icon = getServiceIcon(service.id);
          const isSelected = selectedServices.includes(service.id);

          return (
            <button
              key={service.id}
              onClick={() => onToggleService(service.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </div>
                    <p className="font-semibold text-blue-600">${service.price}</p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedServices.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Total estimated cost:</p>
            <p className="text-xl font-bold text-gray-900">
              $
              {services
                .filter((s) => selectedServices.includes(s.id))
                .reduce((sum, s) => sum + s.price, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
