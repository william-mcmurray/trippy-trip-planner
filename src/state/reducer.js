import { restoreSession } from '../utils/session.js';

const defaultAgentState = () => ({
  output: null,
  isLoading: false,
  error: null,
  status: 'waiting',
});

const defaultAgentWithRetry = () => ({
  ...defaultAgentState(),
  retryCount: 0,
});

export function createInitialState() {
  const { userProfile, currentTrip } = restoreSession();

  let view = 'onboarding';
  if (userProfile && currentTrip) {
    view = 'planner';
  } else if (userProfile) {
    view = 'tripInput';
  }

  return {
    userProfile,
    currentTrip,
    agents: {
      localTips: defaultAgentState(),
      foodDining: defaultAgentState(),
      budget: defaultAgentState(),
      itinerary: { ...defaultAgentWithRetry(), json: null },
      orchestrator: defaultAgentWithRetry(),
    },
    view,
    activeTab: 'itinerary',
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };

    case 'SET_PROFILE':
      return {
        ...state,
        userProfile: action.payload,
        view: 'tripInput',
      };

    case 'SET_TRIP':
      return {
        ...state,
        currentTrip: action.payload,
        view: 'planner',
      };

    case 'AGENT_START':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.payload]: {
            ...state.agents[action.payload],
            isLoading: true,
            error: null,
            status: 'running',
          },
        },
      };

    case 'AGENT_SUCCESS': {
      const agentUpdate = {
        ...state.agents[action.payload.agent],
        output: action.payload.output,
        isLoading: false,
        error: null,
        status: 'complete',
      };
      if (action.payload.json !== undefined) {
        agentUpdate.json = action.payload.json;
      }
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.payload.agent]: agentUpdate,
        },
      };
    }

    case 'AGENT_FAILURE':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.payload.agent]: {
            ...state.agents[action.payload.agent],
            isLoading: false,
            error: action.payload.error,
            status: 'failed',
          },
        },
      };

    case 'AGENT_RETRY':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.payload]: {
            ...state.agents[action.payload],
            status: 'waiting',
            isLoading: false,
            error: null,
            retryCount: (state.agents[action.payload].retryCount || 0) + 1,
          },
        },
      };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'RESET_AGENTS':
      return {
        ...state,
        agents: {
          localTips: defaultAgentState(),
          foodDining: defaultAgentState(),
          budget: defaultAgentState(),
          itinerary: { ...defaultAgentWithRetry(), json: null },
          orchestrator: defaultAgentWithRetry(),
        },
      };

    default:
      return state;
  }
}
