import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Address, ServiceType, TimeSlot } from '../../types';
import { AddressSelector, AddressForm } from '../Address/AddressSelector';
import { ServiceSelector } from '../Services/ServiceSelector';
import { TimeSlotPicker } from '../TimeSlot/TimeSlotPicker';

interface NewOrderFlowProps {
  onComplete: (orderData: {
    pickupAddress: Address;
    deliveryAddress: Address;
    services: ServiceType[];
    pickupTimeSlot: TimeSlot;
    deliveryTimeSlot: TimeSlot;
  }) => void;
  onCancel: () => void;
  savedAddresses: Address[];
  onAddAddress: (address: Omit<Address, 'id'>) => Promise<string>;
}

type Step = 'pickup' | 'delivery' | 'services' | 'pickup-time' | 'delivery-time' | 'review';

export const NewOrderFlow = ({
  onComplete,
  onCancel,
  savedAddresses,
  onAddAddress
}: NewOrderFlowProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('pickup');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormType, setAddressFormType] = useState<'pickup' | 'delivery'>('pickup');

  const [pickupAddress, setPickupAddress] = useState<Address | undefined>();
  const [deliveryAddress, setDeliveryAddress] = useState<Address | undefined>();
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [pickupTimeSlot, setPickupTimeSlot] = useState<TimeSlot | undefined>();
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<TimeSlot | undefined>();

  const handleAddAddress = async (addressData: Omit<Address, 'id'>) => {
    const newId = await onAddAddress(addressData);
    const newAddress: Address = { ...addressData, id: newId };

    if (addressFormType === 'pickup') {
      setPickupAddress(newAddress);
    } else {
      setDeliveryAddress(newAddress);
    }

    setShowAddressForm(false);
    handleNext();
  };

  const handleNext = () => {
    const steps: Step[] = ['pickup', 'delivery', 'services', 'pickup-time', 'delivery-time', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['pickup', 'delivery', 'services', 'pickup-time', 'delivery-time', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'pickup':
        return !!pickupAddress;
      case 'delivery':
        return !!deliveryAddress;
      case 'services':
        return selectedServices.length > 0;
      case 'pickup-time':
        return !!pickupTimeSlot;
      case 'delivery-time':
        return !!deliveryTimeSlot;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    if (pickupAddress && deliveryAddress && pickupTimeSlot && deliveryTimeSlot) {
      onComplete({
        pickupAddress,
        deliveryAddress,
        services: selectedServices,
        pickupTimeSlot,
        deliveryTimeSlot
      });
    }
  };

  const toggleService = (serviceId: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const renderStepContent = () => {
    if (showAddressForm) {
      return (
        <AddressForm
          onSave={handleAddAddress}
          onCancel={() => setShowAddressForm(false)}
        />
      );
    }

    switch (currentStep) {
      case 'pickup':
        return (
          <AddressSelector
            selectedAddress={pickupAddress}
            onSelect={setPickupAddress}
            savedAddresses={savedAddresses}
            onAddNew={() => {
              setAddressFormType('pickup');
              setShowAddressForm(true);
            }}
          />
        );

      case 'delivery':
        return (
          <AddressSelector
            selectedAddress={deliveryAddress}
            onSelect={setDeliveryAddress}
            savedAddresses={savedAddresses}
            onAddNew={() => {
              setAddressFormType('delivery');
              setShowAddressForm(true);
            }}
          />
        );

      case 'services':
        return (
          <ServiceSelector
            selectedServices={selectedServices}
            onToggleService={toggleService}
          />
        );

      case 'pickup-time':
        return (
          <TimeSlotPicker
            selectedSlot={pickupTimeSlot}
            onSelectSlot={setPickupTimeSlot}
            label="Pickup Time"
          />
        );

      case 'delivery-time':
        return (
          <TimeSlotPicker
            selectedSlot={deliveryTimeSlot}
            onSelectSlot={setDeliveryTimeSlot}
            label="Delivery Time"
          />
        );

      case 'review':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Review Your Order</h3>

            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Pickup Address</p>
                <p className="font-medium text-gray-900">{pickupAddress?.label}</p>
                <p className="text-sm text-gray-600">
                  {pickupTimeSlot?.date} at {pickupTimeSlot?.time}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                <p className="font-medium text-gray-900">{deliveryAddress?.label}</p>
                <p className="text-sm text-gray-600">
                  {deliveryTimeSlot?.date} at {deliveryTimeSlot?.time}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Services</p>
                <p className="font-medium text-gray-900">
                  {selectedServices.map(s => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')).join(', ')}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'pickup':
        return 'Pickup Address';
      case 'delivery':
        return 'Delivery Address';
      case 'services':
        return 'Select Services';
      case 'pickup-time':
        return 'Pickup Time';
      case 'delivery-time':
        return 'Delivery Time';
      case 'review':
        return 'Review Order';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <div className="flex gap-2">
            {['pickup', 'delivery', 'services', 'pickup-time', 'delivery-time', 'review'].map((step, index) => (
              <div
                key={step}
                className={`flex-1 h-1 rounded ${
                  ['pickup', 'delivery', 'services', 'pickup-time', 'delivery-time', 'review'].indexOf(currentStep) >= index
                    ? 'bg-primary-600'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">{renderStepContent()}</div>

        {!showAddressForm && (
          <div className="flex gap-3">
            {currentStep !== 'pickup' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            {currentStep !== 'review' ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent-600 text-white rounded-lg font-medium hover:bg-accent-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
