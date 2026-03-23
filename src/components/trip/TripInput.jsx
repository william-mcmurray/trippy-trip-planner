import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { sanitiseUserInput } from '../../utils/sanitise';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TripInput() {
  const { state, dispatch } = useApp();
  const { userProfile } = state;
  const existing = state.currentTrip;

  const [destination, setDestination] = useState(existing?.destination || '');
  const [mustSees, setMustSees] = useState(existing?.mustSees || '');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!destination.trim()) {
      setError('Please enter a destination');
      return;
    }
    const trip = {
      destination: sanitiseUserInput(destination, 300),
      mustSees: sanitiseUserInput(mustSees, 1000),
    };
    dispatch({ type: 'RESET_AGENTS' });
    dispatch({ type: 'SET_TRIP', payload: trip });
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-terracotta-500 mb-2">
            Where to, {userProfile?.name || 'traveller'}?
          </h1>
          <p className="text-warm-500">Tell us about your destination and we'll do the rest.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6">
          {/* Read-only trip dates */}
          <div className="bg-terracotta-50 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-terracotta-700">
              <span className="font-medium">Your dates:</span>{' '}
              {formatDate(userProfile?.startDate)} – {formatDate(userProfile?.endDate)}{' '}
              <span className="text-terracotta-500">({userProfile?.tripDays} days)</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setError('');
                }}
                maxLength={300}
                placeholder="e.g. Tokyo, Japan — focused on traditional culture and street food"
                className="w-full border border-warm-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300"
              />
              <p className="text-xs text-warm-400 mt-1">
                Be descriptive — more than just a city name helps us plan better.
              </p>
              {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">
                Must-See Experiences <span className="text-warm-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={mustSees}
                onChange={(e) => setMustSees(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Any specific places, experiences, or activities you don't want to miss?"
                className="w-full border border-warm-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-terracotta-500 text-white py-2.5 rounded-lg font-medium hover:bg-terracotta-600 transition-colors cursor-pointer"
            >
              Plan My Trip
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
