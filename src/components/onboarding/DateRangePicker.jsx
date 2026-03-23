import { MAX_TRIP_DAYS } from '../../utils/constants';

function getTripDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function DateRangePicker({ startDate, endDate, onChange, errors }) {
  const today = getTodayString();
  const tripDays = getTripDays(startDate, endDate);

  function handleStartChange(e) {
    onChange({ startDate: e.target.value, endDate });
  }

  function handleEndChange(e) {
    onChange({ startDate, endDate: e.target.value });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate || ''}
            min={today}
            onChange={handleStartChange}
            className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate || ''}
            min={startDate || today}
            onChange={handleEndChange}
            className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300"
          />
        </div>
      </div>

      {startDate && endDate && tripDays > 0 && (
        <p className="text-sm text-warm-500">
          {tripDays} {tripDays === 1 ? 'day' : 'days'}
        </p>
      )}

      {errors?.dates && (
        <p className="text-sm text-red-600">{errors.dates}</p>
      )}
      {tripDays > MAX_TRIP_DAYS && (
        <p className="text-sm text-red-600">
          Trippy supports trips of up to {MAX_TRIP_DAYS} days. Please adjust your dates.
        </p>
      )}
    </div>
  );
}
