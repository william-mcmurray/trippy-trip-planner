import { useEffect, useRef } from 'react';
import { useApp } from '../../state/AppContext';
import { runAgentPipeline } from '../../agents/pipeline';
import AgentProgressBar from './AgentProgressBar';
import TripBriefCard from './TripBriefCard';
import TabBar from './TabBar';
import ItineraryTab from './tabs/ItineraryTab';
import LocalTipsTab from './tabs/LocalTipsTab';
import FoodDiningTab from './tabs/FoodDiningTab';
import BudgetTab from './tabs/BudgetTab';

export default function PlannerView() {
  const { state, dispatch } = useApp();
  const pipelineStarted = useRef(false);

  useEffect(() => {
    const allWaiting = Object.values(state.agents).every((a) => a.status === 'waiting');
    if (allWaiting && state.currentTrip && state.userProfile && !pipelineStarted.current) {
      pipelineStarted.current = true;
      runAgentPipeline(state, dispatch);
    }
  }, []);

  const tabContent = {
    itinerary: <ItineraryTab />,
    localTips: <LocalTipsTab />,
    foodDining: <FoodDiningTab />,
    budget: <BudgetTab />,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <AgentProgressBar />
      <TripBriefCard />
      <TabBar />
      <div>{tabContent[state.activeTab]}</div>
    </div>
  );
}
