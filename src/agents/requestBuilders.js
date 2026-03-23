const MODEL = 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 4096;
const ITINERARY_MAX_TOKENS = 8192;

export function buildAgentRequest(agentKey, systemPrompt, userMessageContent) {
  return {
    model: MODEL,
    max_tokens: agentKey === 'itinerary' ? ITINERARY_MAX_TOKENS : DEFAULT_MAX_TOKENS,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessageContent,
      },
    ],
  };
}

export function buildLocalTipsUserMessage(trip) {
  return `Please provide your local insider tips for my trip to ${trip.destination}.`;
}

export function buildFoodDiningUserMessage(trip, priorOutputs) {
  let message = '';
  if (priorOutputs.localTips) {
    message += `Here is the output of the Local Tips agent:\n\n<localTipsOutput>\n${priorOutputs.localTips}\n</localTipsOutput>\n\n`;
  }
  message += `Using the traveller profile and any research above, provide your food and dining recommendations for ${trip.destination}.`;
  return message;
}

export function buildBudgetUserMessage(trip, priorOutputs) {
  let message = '';
  if (priorOutputs.localTips) {
    message += `<localTipsOutput>\n${priorOutputs.localTips}\n</localTipsOutput>\n\n`;
  }
  if (priorOutputs.foodDining) {
    message += `<foodDiningOutput>\n${priorOutputs.foodDining}\n</foodDiningOutput>\n\n`;
  }
  if (priorOutputs.localTips || priorOutputs.foodDining) {
    message += `Using the traveller profile and the research agent outputs above, `;
  } else {
    message += `Using the traveller profile, `;
  }
  message += `provide your budget breakdown for ${trip.destination}.`;
  return message;
}

export function buildItineraryUserMessage(trip, priorOutputs) {
  let message = 'Here are the outputs of the research agents:\n\n';
  if (priorOutputs.localTips) {
    message += `<localTipsOutput>\n${priorOutputs.localTips}\n</localTipsOutput>\n\n`;
  }
  if (priorOutputs.foodDining) {
    message += `<foodDiningOutput>\n${priorOutputs.foodDining}\n</foodDiningOutput>\n\n`;
  }
  if (priorOutputs.budget) {
    message += `<budgetOutput>\n${priorOutputs.budget}\n</budgetOutput>\n\n`;
  }
  message += 'Using these outputs and the traveller profile in the system prompt, produce the itinerary JSON now.';
  return message;
}

export function buildItineraryRetryUserMessage(trip, priorOutputs) {
  return buildItineraryUserMessage(trip, priorOutputs) +
    '\n\nYour previous response was not valid JSON. Return only the JSON object with no surrounding text or code fences.';
}

export function buildOrchestratorUserMessage(trip, priorOutputs) {
  let message = 'Here are the complete outputs of all four specialist agents:\n\n';
  if (priorOutputs.localTips) {
    message += `<localTipsOutput>\n${priorOutputs.localTips}\n</localTipsOutput>\n\n`;
  }
  if (priorOutputs.foodDining) {
    message += `<foodDiningOutput>\n${priorOutputs.foodDining}\n</foodDiningOutput>\n\n`;
  }
  if (priorOutputs.budget) {
    message += `<budgetOutput>\n${priorOutputs.budget}\n</budgetOutput>\n\n`;
  }
  if (priorOutputs.itinerary) {
    message += `<itineraryOutput>\n${priorOutputs.itinerary}\n</itineraryOutput>\n\n`;
  }
  message += 'Synthesise these into the trip brief JSON now.';
  return message;
}
