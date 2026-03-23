import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { checkApiHealth } from './api/healthCheck';
import NavBar from './components/layout/NavBar';
import TripHeader from './components/layout/TripHeader';
import ConfigError from './components/layout/ConfigError';
import OnboardingSurvey from './components/onboarding/OnboardingSurvey';
import TripInput from './components/trip/TripInput';
import PlannerView from './components/planner/PlannerView';

function AppContent() {
  const { state } = useApp();
  const [apiHealthy, setApiHealthy] = useState(null);

  useEffect(() => {
    checkApiHealth().then(setApiHealthy);
  }, []);

  // Still checking health
  if (apiHealthy === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-terracotta-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-warm-500 text-sm">Connecting...</p>
        </div>
      </div>
    );
  }

  if (!apiHealthy) {
    return <ConfigError onRetrySuccess={() => setApiHealthy(true)} />;
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <NavBar />
      <TripHeader />
      {state.view === 'onboarding' && <OnboardingSurvey />}
      {state.view === 'tripInput' && <TripInput />}
      {state.view === 'planner' && <PlannerView />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
