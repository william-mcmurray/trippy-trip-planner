import { useApp } from '../../../state/AppContext';
import { retryAgent } from '../../../agents/pipeline';
import MarkdownRenderer from '../MarkdownRenderer';
import LoadingSkeleton from '../LoadingSkeleton';
import RetryButton from '../RetryButton';

export default function BudgetTab() {
  const { state, dispatch } = useApp();
  const agent = state.agents.budget;

  if (agent.status === 'waiting') {
    return <p className="text-sm text-warm-400 py-4">Waiting...</p>;
  }

  if (agent.status === 'running') {
    return (
      <div className="bg-white rounded-xl border border-warm-100 p-6">
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  if (agent.status === 'failed') {
    return (
      <div className="text-center py-8">
        <p className="text-warm-600 mb-4">{agent.error || 'Budget planner could not be generated.'}</p>
        <RetryButton onClick={() => retryAgent('budget', state, dispatch)} label="Retry Budget" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-warm-100 p-6">
      <MarkdownRenderer text={agent.output} />
    </div>
  );
}
