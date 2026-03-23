import { useApp } from '../../state/AppContext';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTripDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export default function TripHeader() {
  const { state } = useApp();
  const { currentTrip, userProfile } = state;

  if (!currentTrip || !userProfile) return null;

  const days = getTripDays(userProfile.startDate, userProfile.endDate);

  return (
    <div className="bg-terracotta-50 border-b border-terracotta-100 px-4 sm:px-6 py-2.5">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold text-terracotta-700">
          {currentTrip.destination}
        </span>
        <span className="text-warm-500">•</span>
        <span className="text-warm-600">
          {formatDate(userProfile.startDate)} – {formatDate(userProfile.endDate)}
        </span>
        <span className="text-warm-500">•</span>
        <span className="text-warm-600">
          {days} {days === 1 ? 'day' : 'days'}
        </span>
      </div>
    </div>
  );
}
