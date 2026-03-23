import { useApp } from '../../state/AppContext';
import { formatDate, getTripDays } from '../../utils/dateUtils';

export default function TripHeader() {
  const { state } = useApp();
  const { currentTrip, userProfile } = state;

  if (!currentTrip || !userProfile) return null;

  const days = getTripDays(userProfile.startDate, userProfile.endDate);

  return (
    <div className="bg-sage-50 border-b border-sage-100 px-4 sm:px-6 py-2.5">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold text-sage-700">
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
