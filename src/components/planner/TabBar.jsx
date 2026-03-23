import { useApp } from '../../state/AppContext';

const TABS = [
  { key: 'itinerary', label: 'Itinerary', agentKey: 'itinerary' },
  { key: 'localTips', label: 'Local Tips', agentKey: 'localTips' },
  { key: 'foodDining', label: 'Food & Dining', agentKey: 'foodDining' },
  { key: 'budget', label: 'Budget', agentKey: 'budget' },
];

function TabStatusIcon({ status }) {
  if (status === 'running') {
    return <div className="w-2 h-2 rounded-full border border-terracotta-400 border-t-transparent animate-spin" />;
  }
  if (status === 'complete') {
    return <div className="w-2 h-2 rounded-full bg-green-400" />;
  }
  if (status === 'failed') {
    return <div className="w-2 h-2 rounded-full bg-amber-400" />;
  }
  return null;
}

export default function TabBar() {
  const { state, dispatch } = useApp();

  return (
    <div className="flex border-b border-warm-200 mb-4 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = state.activeTab === tab.key;
        const agent = state.agents[tab.agentKey];

        return (
          <button
            key={tab.key}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.key })}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              isActive
                ? 'border-terracotta-500 text-terracotta-600'
                : 'border-transparent text-warm-500 hover:text-warm-700 hover:border-warm-300'
            }`}
          >
            {tab.label}
            <TabStatusIcon status={agent.status} />
          </button>
        );
      })}
    </div>
  );
}
