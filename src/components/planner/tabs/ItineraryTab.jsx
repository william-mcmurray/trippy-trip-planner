import { useApp } from '../../../state/AppContext';
import { retryAgent } from '../../../agents/pipeline';
import DayCard from './DayCard';
import LoadingSkeleton from '../LoadingSkeleton';
import RetryButton from '../RetryButton';

export default function ItineraryTab() {
  const { state, dispatch } = useApp();
  const agent = state.agents.itinerary;

  if (agent.status === 'waiting') {
    return <p className="text-sm text-warm-400 py-4">Waiting for research agents to finish...</p>;
  }

  if (agent.status === 'running') {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-warm-100 rounded-xl border border-warm-100 p-5">
            <LoadingSkeleton lines={4} />
          </div>
        ))}
      </div>
    );
  }

  if (agent.status === 'failed') {
    return (
      <div className="text-center py-8">
        <p className="text-warm-600 mb-4">{agent.error || "Your itinerary needs another go — no worries, we've got this."}</p>
        <RetryButton onClick={() => retryAgent('itinerary', state, dispatch)} label="Retry Itinerary" />
      </div>
    );
  }

  // Complete
  const itinerary = agent.json;
  if (!itinerary || !itinerary.days) {
    return <p className="text-sm text-warm-400 py-4">No itinerary data available.</p>;
  }

  return (
    <div className="space-y-3">
      {itinerary.days.map((day, idx) => (
        <DayCard key={day.day || idx} day={day} defaultExpanded={idx === 0} />
      ))}
    </div>
  );
}
