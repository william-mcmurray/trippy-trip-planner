import { useApp } from '../../state/AppContext';
import { AGENT_KEYS, AGENT_LABELS } from '../../utils/constants';
import { retryAgent } from '../../agents/pipeline';
import RetryButton from './RetryButton';

function StatusIcon({ status }) {
  if (status === 'waiting') {
    return <div className="w-5 h-5 rounded-full bg-warm-200" />;
  }
  if (status === 'running') {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-terracotta-500 border-t-transparent animate-spin" />
    );
  }
  if (status === 'complete') {
    return (
      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
        <span className="text-white text-xs font-bold">!</span>
      </div>
    );
  }
  return null;
}

function ConnectorLine({ status }) {
  return (
    <div className={`flex-1 h-0.5 mx-1 ${
      status === 'complete' ? 'bg-green-300' : 'bg-warm-200'
    }`} />
  );
}

export default function AgentProgressBar() {
  const { state, dispatch } = useApp();

  function handleRetry(agentKey) {
    retryAgent(agentKey, state, dispatch);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-4 mb-4">
      {/* Icons + connector lines row */}
      <div className="flex items-center mb-2">
        {AGENT_KEYS.map((key, idx) => {
          const agent = state.agents[key];
          const isLast = idx === AGENT_KEYS.length - 1;
          return (
            <div key={key} className="contents">
              <div className="flex-shrink-0">
                <StatusIcon status={agent.status} />
              </div>
              {!isLast && <ConnectorLine status={agent.status} />}
            </div>
          );
        })}
      </div>
      {/* Labels + retry buttons row */}
      <div className="flex items-start">
        {AGENT_KEYS.map((key) => {
          const agent = state.agents[key];
          return (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-warm-600 font-medium text-center leading-tight">
                {AGENT_LABELS[key]}
              </span>
              {agent.status === 'failed' && (
                <RetryButton onClick={() => handleRetry(key)} small label="Retry" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
