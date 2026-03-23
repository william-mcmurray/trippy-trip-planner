import { useState } from 'react';
import ActivityRow from './ActivityRow';
import { formatDate } from '../../../utils/dateUtils';

const DAY_CARD_DATE_OPTIONS = { weekday: 'short', month: 'short', day: 'numeric' };

export default function DayCard({ day, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const dayCost = (day.activities || []).reduce(
    (sum, a) => sum + (a.estimated_cost_usd || 0),
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-warm-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-warm-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="text-sm font-bold text-terracotta-500 bg-terracotta-50 rounded-lg px-2.5 py-1">
            Day {day.day}
          </span>
          <div>
            <span className="text-sm text-warm-500">{formatDate(day.date, DAY_CARD_DATE_OPTIONS)}</span>
            {day.theme && (
              <span className="text-sm text-warm-700 font-medium ml-2">— {day.theme}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dayCost > 0 && (
            <span className="text-xs text-warm-400">${dayCost}</span>
          )}
          <svg
            className={`w-4 h-4 text-warm-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 space-y-2 border-t border-warm-100">
          {(day.activities || []).map((activity, idx) => (
            <ActivityRow key={idx} activity={activity} />
          ))}
          {(!day.activities || day.activities.length === 0) && (
            <p className="text-sm text-warm-400 py-2">No activities planned for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}
