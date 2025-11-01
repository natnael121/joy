import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { TimeSlot } from '../../types';

const generateTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = [
    '08:00 AM',
    '10:00 AM',
    '12:00 PM',
    '02:00 PM',
    '04:00 PM',
    '06:00 PM',
    '08:00 PM'
  ];

  times.forEach((time, index) => {
    slots.push({
      id: `${date}-${index}`,
      date,
      time,
      available: true
    });
  });

  return slots;
};

const getNextSevenDays = (): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
};

interface TimeSlotPickerProps {
  selectedSlot?: TimeSlot;
  onSelectSlot: (slot: TimeSlot) => void;
  label: string;
}

export const TimeSlotPicker = ({ selectedSlot, onSelectSlot, label }: TimeSlotPickerProps) => {
  const [selectedDate, setSelectedDate] = useState(getNextSevenDays()[0]);
  const dates = getNextSevenDays();
  const timeSlots = generateTimeSlots(selectedDate);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">{label}</h3>

      <div>
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Select Date</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedDate === date
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Select Time</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              disabled={!slot.available}
              className={`p-3 rounded-lg font-medium transition-all ${
                selectedSlot?.id === slot.id
                  ? 'bg-primary-600 text-white'
                  : slot.available
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </div>

      {selectedSlot && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-800">
            Selected: {formatDate(selectedSlot.date)} at {selectedSlot.time}
          </p>
        </div>
      )}
    </div>
  );
};
