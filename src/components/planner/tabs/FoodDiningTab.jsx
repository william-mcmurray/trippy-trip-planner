import { useApp } from '../../../state/AppContext';
import { retryAgent } from '../../../agents/pipeline';
import MarkdownRenderer from '../MarkdownRenderer';
import LoadingSkeleton from '../LoadingSkeleton';
import RetryButton from '../RetryButton';

export default function FoodDiningTab() {
  const { state, dispatch } = useApp();
  const agent = state.agents.foodDining;

  if (agent.status === 'waiting') {
    return <p className="text-sm text-warm-400 py-4">Waiting...</p>;
  }

  if (agent.status === 'running') {
    return (
      <div className="bg-warm-100 rounded-xl border border-warm-100 p-6">
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  if (agent.status === 'failed') {
    return (
      <div className="text-center py-8">
        <p className="text-warm-600 mb-4">{agent.error || "The food guide got lost in transit — want to try again?"}</p>
        <RetryButton onClick={() => retryAgent('foodDining', state, dispatch)} label="Retry Food & Dining" />
      </div>
    );
  }

  return (
    <div className="bg-warm-100 rounded-xl border border-warm-100 p-6">
      <MarkdownRenderer text={agent.output} />
    </div>
  );
}
