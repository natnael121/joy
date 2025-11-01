import { useState, useEffect } from 'react';
import { MapPin, Plus, Navigation } from 'lucide-react';
import { Address } from '../../types';

interface AddressSelectorProps {
  onSelect: (address: Address) => void;
  selectedAddress?: Address;
  savedAddresses: Address[];
  onAddNew: () => void;
}

export const AddressSelector = ({
  onSelect,
  selectedAddress,
  savedAddresses,
  onAddNew
}: AddressSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Select Address</h3>
        <button
          onClick={onAddNew}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      <div className="space-y-2">
        {savedAddresses.map((address) => (
          <button
            key={address.id}
            onClick={() => onSelect(address)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedAddress?.id === address.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{address.label}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {address.street}, {address.city}, {address.state} {address.zipCode}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

interface AddressFormProps {
  onSave: (address: Omit<Address, 'id'>) => void;
  onCancel: () => void;
}

export const AddressForm = ({ onSave, onCancel }: AddressFormProps) => {
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          if (data.address) {
            setStreet(data.address.road || '');
            setCity(data.address.city || data.address.town || '');
            setState(data.address.state || '');
            setZipCode(data.address.postcode || '');
          }
        } catch (error) {
          alert('Failed to get address from location');
        } finally {
          setGettingLocation(false);
        }
      },
      () => {
        alert('Unable to retrieve your location');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ label, street, city, state, zipCode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Add New Address</h3>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          {gettingLocation ? 'Getting...' : 'Use GPS'}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label (e.g., Home, Office)
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Home"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="123 Main St"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="New York"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="NY"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ZIP Code
        </label>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="10001"
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Save Address
        </button>
      </div>
    </form>
  );
};
