import { callAgent } from '../api/anthropicClient.js';
import { extractJSON } from '../utils/extractJSON.js';
import {
  buildLocalTipsPrompt,
  buildFoodDiningPrompt,
  buildBudgetPrompt,
  buildItineraryPrompt,
  buildOrchestratorPrompt,
} from './prompts.js';
import {
  buildAgentRequest,
  buildLocalTipsUserMessage,
  buildFoodDiningUserMessage,
  buildBudgetUserMessage,
  buildItineraryUserMessage,
  buildItineraryRetryUserMessage,
  buildOrchestratorUserMessage,
} from './requestBuilders.js';

function getTextFromResponse(response) {
  if (!response?.content) return '';
  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

export async function runAgentPipeline(state, dispatch) {
  const { userProfile, currentTrip } = state;
  const priorOutputs = {};

  // --- Agent 1: Local Tips ---
  dispatch({ type: 'AGENT_START', payload: 'localTips' });
  try {
    const system = buildLocalTipsPrompt(userProfile, currentTrip);
    const userMsg = buildLocalTipsUserMessage(currentTrip);
    const request = buildAgentRequest('localTips', system, userMsg);
    const response = await callAgent(request);
    const text = getTextFromResponse(response);
    priorOutputs.localTips = text;
    dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'localTips', output: text } });
  } catch (error) {
    dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'localTips', error: error.message } });
  }

  // --- Agent 2: Food & Dining ---
  dispatch({ type: 'AGENT_START', payload: 'foodDining' });
  try {
    const system = buildFoodDiningPrompt(userProfile, currentTrip);
    const userMsg = buildFoodDiningUserMessage(currentTrip, priorOutputs);
    const request = buildAgentRequest('foodDining', system, userMsg);
    const response = await callAgent(request);
    const text = getTextFromResponse(response);
    priorOutputs.foodDining = text;
    dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'foodDining', output: text } });
  } catch (error) {
    dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'foodDining', error: error.message } });
  }

  // --- Agent 3: Budget Planner ---
  dispatch({ type: 'AGENT_START', payload: 'budget' });
  try {
    const system = buildBudgetPrompt(userProfile, currentTrip);
    const userMsg = buildBudgetUserMessage(currentTrip, priorOutputs);
    const request = buildAgentRequest('budget', system, userMsg);
    const response = await callAgent(request);
    const text = getTextFromResponse(response);
    priorOutputs.budget = text;
    dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'budget', output: text } });
  } catch (error) {
    dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'budget', error: error.message } });
  }

  // --- Agent 4: Itinerary Planner ---
  dispatch({ type: 'AGENT_START', payload: 'itinerary' });
  let itinerarySuccess = false;
  try {
    const system = buildItineraryPrompt(userProfile, currentTrip);
    const userMsg = buildItineraryUserMessage(currentTrip, priorOutputs);
    const request = buildAgentRequest('itinerary', system, userMsg);
    const response = await callAgent(request);
    const text = getTextFromResponse(response);
    const parsed = extractJSON(text);

    if (parsed.ok) {
      priorOutputs.itinerary = text;
      dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'itinerary', output: text, json: parsed.data } });
      itinerarySuccess = true;
    } else {
      // Auto-retry once with JSON reminder
      dispatch({ type: 'AGENT_RETRY', payload: 'itinerary' });
      dispatch({ type: 'AGENT_START', payload: 'itinerary' });

      const retryMsg = buildItineraryRetryUserMessage(currentTrip, priorOutputs);
      const retryRequest = buildAgentRequest('itinerary', system, retryMsg);
      const retryResponse = await callAgent(retryRequest);
      const retryText = getTextFromResponse(retryResponse);
      const retryParsed = extractJSON(retryText);

      if (retryParsed.ok) {
        priorOutputs.itinerary = retryText;
        dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'itinerary', output: retryText, json: retryParsed.data } });
        itinerarySuccess = true;
      } else {
        dispatch({
          type: 'AGENT_FAILURE',
          payload: { agent: 'itinerary', error: 'The itinerary could not be generated. Please try again.' },
        });
      }
    }
  } catch (error) {
    dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'itinerary', error: error.message } });
  }

  // --- Agent 5: Orchestrator (only runs if itinerary succeeded) ---
  if (!itinerarySuccess) return;

  dispatch({ type: 'AGENT_START', payload: 'orchestrator' });
  try {
    const system = buildOrchestratorPrompt(userProfile, currentTrip);
    const userMsg = buildOrchestratorUserMessage(currentTrip, priorOutputs);
    const request = buildAgentRequest('orchestrator', system, userMsg);
    const response = await callAgent(request);
    const text = getTextFromResponse(response);
    const parsed = extractJSON(text);

    if (parsed.ok) {
      dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'orchestrator', output: parsed.data } });
    } else {
      // Auto-retry once
      dispatch({ type: 'AGENT_RETRY', payload: 'orchestrator' });
      dispatch({ type: 'AGENT_START', payload: 'orchestrator' });

      const retryRequest = buildAgentRequest('orchestrator', system, userMsg +
        '\n\nYour previous response was not valid JSON. Return only the JSON object with no surrounding text or code fences.');
      const retryResponse = await callAgent(retryRequest);
      const retryText = getTextFromResponse(retryResponse);
      const retryParsed = extractJSON(retryText);

      if (retryParsed.ok) {
        dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'orchestrator', output: retryParsed.data } });
      } else {
        // Graceful degradation — store raw text
        dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'orchestrator', output: retryText } });
      }
    }
  } catch (error) {
    dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'orchestrator', error: error.message } });
  }
}

export async function retryAgent(agentKey, state, dispatch) {
  const { userProfile, currentTrip, agents } = state;
  const priorOutputs = {
    localTips: agents.localTips.output || '',
    foodDining: agents.foodDining.output || '',
    budget: agents.budget.output || '',
    itinerary: agents.itinerary.output || '',
  };

  if (agentKey === 'localTips') {
    dispatch({ type: 'AGENT_START', payload: 'localTips' });
    try {
      const system = buildLocalTipsPrompt(userProfile, currentTrip);
      const userMsg = buildLocalTipsUserMessage(currentTrip);
      const request = buildAgentRequest('localTips', system, userMsg);
      const response = await callAgent(request);
      const text = getTextFromResponse(response);
      dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'localTips', output: text } });
    } catch (error) {
      dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'localTips', error: error.message } });
    }
  } else if (agentKey === 'foodDining') {
    dispatch({ type: 'AGENT_START', payload: 'foodDining' });
    try {
      const system = buildFoodDiningPrompt(userProfile, currentTrip);
      const userMsg = buildFoodDiningUserMessage(currentTrip, priorOutputs);
      const request = buildAgentRequest('foodDining', system, userMsg);
      const response = await callAgent(request);
      const text = getTextFromResponse(response);
      dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'foodDining', output: text } });
    } catch (error) {
      dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'foodDining', error: error.message } });
    }
  } else if (agentKey === 'budget') {
    dispatch({ type: 'AGENT_START', payload: 'budget' });
    try {
      const system = buildBudgetPrompt(userProfile, currentTrip);
      const userMsg = buildBudgetUserMessage(currentTrip, priorOutputs);
      const request = buildAgentRequest('budget', system, userMsg);
      const response = await callAgent(request);
      const text = getTextFromResponse(response);
      dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'budget', output: text } });
    } catch (error) {
      dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'budget', error: error.message } });
    }
  } else if (agentKey === 'itinerary') {
    dispatch({ type: 'AGENT_START', payload: 'itinerary' });
    try {
      const system = buildItineraryPrompt(userProfile, currentTrip);
      const userMsg = buildItineraryUserMessage(currentTrip, priorOutputs);
      const request = buildAgentRequest('itinerary', system, userMsg);
      const response = await callAgent(request);
      const text = getTextFromResponse(response);
      const parsed = extractJSON(text);

      if (parsed.ok) {
        dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'itinerary', output: text, json: parsed.data } });
        // Trigger orchestrator after successful itinerary retry
        await retryAgent('orchestrator', { ...state, agents: { ...state.agents, itinerary: { output: text, json: parsed.data, status: 'complete' } } }, dispatch);
      } else {
        dispatch({
          type: 'AGENT_FAILURE',
          payload: { agent: 'itinerary', error: 'The itinerary could not be generated. Please try again.' },
        });
      }
    } catch (error) {
      dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'itinerary', error: error.message } });
    }
  } else if (agentKey === 'orchestrator') {
    dispatch({ type: 'AGENT_START', payload: 'orchestrator' });
    try {
      const system = buildOrchestratorPrompt(userProfile, currentTrip);
      const userMsg = buildOrchestratorUserMessage(currentTrip, priorOutputs);
      const request = buildAgentRequest('orchestrator', system, userMsg);
      const response = await callAgent(request);
      const text = getTextFromResponse(response);
      const parsed = extractJSON(text);

      if (parsed.ok) {
        dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'orchestrator', output: parsed.data } });
      } else {
        // Graceful degradation
        dispatch({ type: 'AGENT_SUCCESS', payload: { agent: 'orchestrator', output: text } });
      }
    } catch (error) {
      dispatch({ type: 'AGENT_FAILURE', payload: { agent: 'orchestrator', error: error.message } });
    }
  }
}
