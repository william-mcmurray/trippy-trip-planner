const GENERAL_MESSAGES = [
  "Asking around for the best spots...",
  "Working on it, chill... 🦙",
  "Okay wait, this trip is actually sick...",
  "Your itinerary is taking shape 🦙",
  "Oh now THAT will be fun...",
  "Tapping into the local knowledge...",
  "Almost there, good things take time...",
];

const AGENT_MESSAGES = {
  localTips: [
    "Chatting with the locals for you...",
    "Digging up the hidden gems...",
    "Finding the spots tourists miss...",
    "Getting the real insider scoop...",
  ],
  foodDining: [
    "Sniffing out the tastiest spots...",
    "Making reservations in my head...",
    "Your taste buds are gonna thank me...",
    "Finding where the locals actually eat...",
  ],
  budget: [
    "Crunching numbers so you don't have to...",
    "Making your wallet happy...",
    "Balancing vibes and budget...",
    "Finding the best bang for your buck...",
  ],
  itinerary: [
    "Mapping out your perfect days...",
    "Fitting all the good stuff in...",
    "Building something special here...",
    "Okay this itinerary is going to slap...",
  ],
  orchestrator: [
    "Putting it all together...",
    "Adding the finishing touches...",
    "Making sure everything flows...",
    "Almost ready to hand this off to you...",
  ],
};

export function getLoadingMessage(agentKey, tick = 0) {
  const messages = AGENT_MESSAGES[agentKey] || GENERAL_MESSAGES;
  return messages[tick % messages.length];
}

export { GENERAL_MESSAGES, AGENT_MESSAGES };
