import { useApp } from '../../state/AppContext';
import { retryAgent } from '../../agents/pipeline';
import AlpacaLogo from '../AlpacaLogo';
import RetryButton from './RetryButton';

export default function TripBriefCard() {
  const { state, dispatch } = useApp();
  const orchestrator = state.agents.orchestrator;

  // Don't show anything until orchestrator has at least started
  if (orchestrator.status === 'waiting') return null;

  if (orchestrator.status === 'running') {
    return (
      <div className="bg-warm-100 rounded-xl shadow-sm border border-warm-200 p-6 mb-4 flex flex-col items-center justify-center py-12">
        <AlpacaLogo className="w-16 h-16 animate-pulse" />
        <p className="text-warm-500 text-sm mt-3 italic">Putting your trip brief together...</p>
      </div>
    );
  }

  if (orchestrator.status === 'failed') {
    return (
      <div className="bg-warm-100 rounded-xl shadow-sm border border-warm-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-warm-800 mb-2">Trip Brief</h2>
        <p className="text-warm-600 mb-4">
          We hit a snag pulling your trip brief together — no stress, check out the tabs below!
        </p>
        <RetryButton onClick={() => retryAgent('orchestrator', state, dispatch)} />
      </div>
    );
  }

  // Complete — check if output is structured JSON or raw text (graceful degradation)
  const output = orchestrator.output;
  const isStructured = output && typeof output === 'object' && output.tripSummary;

  if (!isStructured) {
    // Graceful degradation — show raw text
    return (
      <div className="bg-warm-100 rounded-xl shadow-sm border border-warm-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-warm-800 mb-3">Trip Brief</h2>
        <p className="text-warm-700 whitespace-pre-wrap">{typeof output === 'string' ? output : JSON.stringify(output, null, 2)}</p>
      </div>
    );
  }

  return (
    <div className="bg-warm-100 rounded-xl shadow-sm border border-warm-200 p-6 mb-4">
      <h2 className="text-lg font-semibold text-warm-800 mb-3">Trip Brief</h2>

      <p className="text-warm-700 leading-relaxed mb-4">{output.tripSummary}</p>

      {output.highlights?.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-sage-600 uppercase tracking-wide mb-2">Highlights</h3>
          <ul className="space-y-1">
            {output.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                <span className="text-sage-400 mt-0.5">•</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {output.warnings?.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#E8C547] uppercase tracking-wide mb-2">Watch Out For</h3>
          <ul className="space-y-1">
            {output.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-warm-700">
                <span className="text-[#E8C547] mt-0.5">⚠</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {output.dailyBudgetReality && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-sage-600 uppercase tracking-wide mb-1">Budget Reality</h3>
          <p className="text-sm text-warm-700">{output.dailyBudgetReality}</p>
        </div>
      )}

      {output.orchestratorNotes && (
        <div>
          <h3 className="text-sm font-semibold text-warm-500 uppercase tracking-wide mb-1">Notes</h3>
          <p className="text-sm text-warm-600 italic">{output.orchestratorNotes}</p>
        </div>
      )}
    </div>
  );
}
