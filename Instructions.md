Build a React single-page web application called "Trippy" — a multi-agent AI travel
itinerary builder that acts as a well-travelled friend, not a booking service.

---

## Tech Stack
- React with hooks (useState, useReducer, useContext)
- Vite as the build tool (required for Netlify deployment)
- Tailwind CSS for styling
- Anthropic API (/v1/messages) via Netlify serverless proxy — never called
  directly from the browser (see Security section)
- No routing library needed — manage views in state

---

## Security

This section must be implemented before any other feature. All API keys are
server-side only. No secret value of any kind should ever appear in the
client-side JavaScript bundle.

### Principle: No API Keys in the Browser

The VITE_ prefix causes Vite to embed environment variable values directly
into the JavaScript bundle served to every user's browser. Anyone can open
DevTools and read these values in plain text. For this reason:

- The VITE_ prefix must NEVER be used for any API key or secret
- The Anthropic API key must not be a client-side variable
- All calls to the Anthropic API must go through a Netlify serverless
  function that runs server-side

The React frontend makes no direct calls to api.anthropic.com.
It only calls its own /api/* endpoints.

---

### Netlify Serverless Function — Anthropic Proxy

Agent responses — particularly the Itinerary Planner on long trips — can take
30–60 seconds. Standard Netlify functions time out at 10 seconds on the free
tier and 26 seconds on paid plans. To avoid silent 502 timeouts mid-pipeline,
the Anthropic proxy must be implemented as a Netlify Background Function, which
supports execution up to 15 minutes.

Background functions are invoked asynchronously: the client POSTs to the
function, receives an immediate 202 Accepted, then polls a status endpoint
until the result is ready. Implement this polling pattern for all five agent
calls.

Create /netlify/functions/anthropic-proxy-background.js:

```javascript
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const MAX_BODY_SIZE = 512 * 1024; // 512KB — accommodates Orchestrator context

exports.handler = async (event) => {
  // Method check
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Origin validation — reject requests not from the app's own domain
  const origin = event.headers['origin'] || event.headers['referer'] || '';
  if (ALLOWED_ORIGIN && !origin.startsWith(ALLOWED_ORIGIN)) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  // Body size check
  const bodySize = Buffer.byteLength(event.body || '', 'utf8');
  if (bodySize > MAX_BODY_SIZE) {
    return { statusCode: 413, body: 'Request too large' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not configured');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: event.body,
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Anthropic proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Request failed. Please try again.' }),
    };
  }
};
```

Note on body size: the 512KB limit accommodates the Orchestrator's request,
which contains the user profile plus the full text outputs of all four
preceding agents. For reference, a detailed 28-day itinerary in JSON is
approximately 60–100KB; four verbose agents combined are unlikely to exceed
300KB. 512KB provides meaningful headroom without being unreasonably permissive.

The React frontend calls /api/anthropic-proxy-background for all agent
requests and implements the polling pattern described above.

---

### Input Sanitisation — Prompt Injection Defence

All user-supplied free text (destination, must-see experiences, traveller name)
is injected into agent system prompts. Before interpolating any user input into
a prompt, pass it through a sanitisation function that:

- Trims leading and trailing whitespace
- Strips null bytes and non-printable control characters
- Truncates to a maximum length (destination: 300 chars, must-sees: 1000 chars,
  name: 100 chars)
- Removes sequences commonly used in prompt injection attempts

Implement this as a shared utility used by all five agents:

```javascript
function sanitiseUserInput(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .replace(/```/g, '')                                  // code fences
    .replace(/\bignore\s+(all\s+)?(previous|prior|above)\s+instructions?\b/gi, '')
    .replace(/\b(system|assistant|user)\s*:/gi, '')
    .slice(0, maxLength);
}
```

---

## Netlify Deployment Configuration

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[functions."anthropic-proxy-background"]
  timeout = 900  # 15 minutes — background function maximum

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self';"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

Notes on this configuration:

- node_bundler = "esbuild" pins the functions to a modern Node.js runtime
  that supports native fetch without requiring a polyfill. Without this,
  the runtime version is determined by Netlify's default, which may vary.

- The timeout = 900 override applies only to the background function.
  Standard helper functions (health check etc.) retain the default timeout.

- unsafe-inline has been removed from both script-src and style-src.
  Vite compiles Tailwind to a static CSS file at build time — styles are
  not injected at runtime and do not require unsafe-inline. Removing it
  meaningfully tightens the Content Security Policy.

---

## Local Development

Install the Netlify CLI as a dev dependency so that the React app and
serverless functions run together locally, exactly as they behave in
production:

  npm install --save-dev netlify-cli

Update package.json to use netlify dev as the dev script:

```json
"scripts": {
  "dev": "netlify dev",
  "build": "vite build",
  "preview": "vite preview"
}
```

The Netlify CLI reads netlify.toml automatically. It starts the Vite dev
server and the functions runtime on a single port (default:
http://localhost:8888). The /api/* redirect routes proxy calls to the local
functions runtime identically to how they behave on Netlify's servers.

### Local Environment Variables

Create a .env file in the project root before running netlify dev:

```
ANTHROPIC_API_KEY=your-anthropic-key-here
ALLOWED_ORIGIN=http://localhost:8888
```

ALLOWED_ORIGIN must be set to http://localhost:8888 for local development.
The proxy function validates the origin of every incoming request. If
ALLOWED_ORIGIN is set to the production URL during local testing, every
proxy call will return a 403 Forbidden error and no agents will run.

When deploying to Netlify, set ALLOWED_ORIGIN to the production URL
(e.g. https://trippy.netlify.app) in the Netlify environment variables
dashboard.

### Starting Local Development

  npm run dev

Then open http://localhost:8888. Test the complete agent pipeline locally
before deploying.

### Verifying the Local Setup

1. App loads at http://localhost:8888 without a configuration error
2. DevTools → Network shows agent requests going to /api/anthropic-proxy-background
3. No API key strings are visible in DevTools → Sources

If proxy calls return 403, ALLOWED_ORIGIN in .env does not match the
browser URL including port. If proxy calls return 500, check that
ANTHROPIC_API_KEY is present and that the Netlify CLI loaded .env on startup.

---

## Environment Variables

### Required Variables

All variables are server-side only. None use the VITE_ prefix.
The React frontend requires no environment variables — it calls relative
/api/* URLs that work in both local development and production without
any configuration.

- ANTHROPIC_API_KEY — used only inside anthropic-proxy-background.js
- ALLOWED_ORIGIN — the deployed app URL (e.g. https://trippy.netlify.app),
  used by the proxy function to validate request origin

### Where to Set Variables
- Local development: .env file in project root, loaded automatically by
  the Netlify CLI
- Production: Netlify → Site Configuration → Environment Variables.
  After adding variables, trigger a manual redeploy.

### On Application Load
On startup, make a lightweight HEAD or OPTIONS request to
/api/anthropic-proxy-background to confirm the function is reachable.
If it returns an unexpected error, show a full-screen configuration error
state rather than silently failing when the first agent runs.

---

## .gitignore Considerations

Create a .gitignore file in the project root before the first git commit.

```
# Environment variables — never commit secrets
.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
.env.staging

# Dependencies
node_modules/

# Vite build output
dist/
dist-ssr/

# Netlify local state
.netlify/

# Editor and OS files
.DS_Store
.vscode/*
!.vscode/extensions.json
.idea/
Thumbs.db

# Logs
*.log
npm-debug.log*
```

Also create a .env.example file and commit it to GitHub:

```
# Server-side only — no VITE_ prefix
ANTHROPIC_API_KEY=
ALLOWED_ORIGIN=https://your-app-name.netlify.app
```

### Pre-Deployment Security Checklist
Complete all of the following before sharing the app with any user:

1. Run `git status` — confirm no .env files appear as tracked
2. Run `npm audit` — fix any high or critical vulnerability findings
3. Search the repository for "sk-ant" (Anthropic key prefix) — must return
   zero results
4. Open the built app in a browser, open DevTools → Sources, confirm no
   API key strings appear anywhere in the JavaScript bundle
5. Confirm all agent calls go to /api/anthropic-proxy-background and not
   to api.anthropic.com directly

---

## Input Validation — Trip Length and Budget

### Trip Length
Enforce the following constraints on the trip date inputs in the onboarding
survey, before the form can be submitted:

- Minimum trip length: 1 day
- Maximum trip length: 28 days
- Start date must not be in the past
- End date must be after start date

If the user selects dates that produce a trip longer than 28 days, show an
inline validation error: "Trippy supports trips of up to 28 days. Please
adjust your dates."

This constraint prevents the Itinerary Planner from attempting to generate
itineraries that would exceed Claude's output token limit and return
truncated, unparseable JSON. Note that at 28 days, the Itinerary Agent's
JSON output will be substantially larger than at 14 days — ensure max_tokens
is set to at least 8192 for the Itinerary Planner call to accommodate a
full four-week plan without truncation.

### Budget Tier Midpoints
The daily budget is collected as a discrete tier selection. When calculating
the estimated total trip cost display and when passing budget context to
agents, use the following fixed midpoint values:

- "Under $50" → $35/day
- "$50–$150" → $100/day
- "$150–$300" → $225/day
- "$300+" → $400/day

Pass the midpoint value, not the tier label, to agents so they can reason
about specific cost figures rather than vague ranges.

---

## Session Persistence

The user profile and current trip must survive a page refresh. Store both
in sessionStorage immediately after each update so that a refresh restores
the user to where they were rather than resetting to the onboarding survey.

Implement a persistence utility that is called by the useReducer after every
state change:

```javascript
function persistSession(state) {
  try {
    sessionStorage.setItem('trippy_profile', JSON.stringify(state.userProfile));
    sessionStorage.setItem('trippy_trip', JSON.stringify(state.currentTrip));
  } catch (e) {
    // sessionStorage unavailable — continue without persistence
  }
}

function restoreSession() {
  try {
    const profile = sessionStorage.getItem('trippy_profile');
    const trip = sessionStorage.getItem('trippy_trip');
    return {
      userProfile: profile ? JSON.parse(profile) : null,
      currentTrip: trip ? JSON.parse(trip) : null,
    };
  } catch (e) {
    return { userProfile: null, currentTrip: null };
  }
}
```

On application load, call restoreSession(). If a profile exists, skip
the onboarding survey and navigate directly to the planner view. Agent
outputs are not persisted — they are regenerated when the user returns.

Note: sessionStorage is scoped to the browser tab and is cleared when the
tab is closed. This is intentional — itineraries are ephemeral by design.

---

## User Profile (Onboarding Survey)
Build a multi-step onboarding form (not a chat) that collects the following,
stored as a single JSON object in state:

- Name
- Age range (18–24, 25–34, 35–44, 45–54, 55+)
- Travel style (Backpacker / Budget, Mid-range explorer, Luxury traveller)
- Pace preference (Packed schedule, Balanced mix, Slow and relaxed)
- Primary interests (multi-select: Food & Drink, History & Culture, Nature &
  Outdoors, Nightlife, Art & Museums, Adventure Sports, Shopping, Wellness)
- Dietary requirements (multi-select: None, Vegetarian, Vegan, Halal, Kosher,
  Gluten-free, Nut allergy)
- Trip start date and end date — enforcing the constraints defined in the
  Input Validation section above
- Daily budget tier selection ($35 / $100 / $225 / $400 per day midpoints
  as defined in the Input Validation section), with a read-only field showing
  the estimated total trip cost (midpoint × number of trip days)
- Solo or group travel — if group, collect group size; if solo, set group
  size to 1 automatically

Once completed, store the profile and never show the survey again in the
session. Allow editing via a nav button labelled "Edit Trip Configuration".
Persist the profile to sessionStorage as described in Session Persistence.

---

## Trip Input
After onboarding, show a simple trip creation form. Trip dates are already
captured in the user profile and should be displayed here as read-only
context, not re-collected:

- Destination (free text, max 300 chars) — prompt the user to describe more
  than a city name, e.g. "Tokyo, Japan — focused on traditional culture and
  street food"
- Any specific must-see locations or experiences (optional free text, max
  1000 chars)

All text entered here must be passed through sanitiseUserInput before being
injected into any agent prompt.

---

## Agent Architecture

Build five AI agents. Use claude-sonnet-4-6 as the model for all agents.
All agent API calls go to /api/anthropic-proxy-background.

### Execution Order
Agents run sequentially. Each agent that receives prior outputs does so via
the messages array of its API call — the prior agent's text is passed as an
additional user message so Claude receives it as part of the conversation
context, not as a system prompt modification.

1. Research Agent 1 — Local Tips
2. Research Agent 2 — Food & Dining Guide
3. Research Agent 3 — Budget Planner
4. Itinerary Agent 4 — Itinerary Planner (receives outputs of agents 1–3)
5. Orchestrator Agent 5 (receives outputs of all four agents above)

### API Call Structure for Context Threading

Each agent that receives prior outputs structures its API call as follows.
The system prompt contains only the agent's role and the cached user profile.
Prior agent outputs are passed as the final user message, clearly labelled:

```javascript
// Example: Itinerary Planner call structure
{
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  system: [
    {
      type: 'text',
      text: '<userProfile>' + JSON.stringify(userProfile) + '</userProfile>\n\n' +
            agentSystemPrompt,
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [
    {
      role: 'user',
      content:
        'Here are the outputs of the three research agents:\n\n' +
        '<localTipsOutput>\n' + agents.localTips.output + '\n</localTipsOutput>\n\n' +
        '<foodDiningOutput>\n' + agents.foodDining.output + '\n</foodDiningOutput>\n\n' +
        '<budgetOutput>\n' + agents.budget.output + '\n</budgetOutput>\n\n' +
        'Using these outputs and the traveller profile in the system prompt, ' +
        'produce the itinerary JSON now.'
    }
  ]
}
```

Use XML-style tags to clearly delimit each agent's output when passing it to
a subsequent agent. This reduces the risk of the receiving agent confusing one
agent's output with another's.

The Orchestrator follows the same pattern, receiving all four agent outputs
as labelled sections within a single user message.

Show a progress indicator for each agent communicating one of three states:
waiting | running | complete | failed.

---

### JSON Response Handling

The Itinerary Planner and Orchestrator are both instructed to return only
valid JSON. Claude will occasionally wrap JSON in markdown code fences
(```json ... ```) despite instruction to the contrary, or may return a
partial response if it approaches a token limit.

Implement a shared JSON extraction utility that is used whenever a JSON
response is expected:

```javascript
function extractJSON(rawText) {
  // Strip markdown code fences if present
  const stripped = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return { ok: true, data: JSON.parse(stripped) };
  } catch (e) {
    // Attempt to find a JSON object or array within the text
    const match = stripped.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return { ok: true, data: JSON.parse(match[1]) };
      } catch (e2) {
        // fall through
      }
    }
    return { ok: false, error: 'Response was not valid JSON', raw: stripped };
  }
}
```

If extractJSON returns ok: false for the Itinerary Planner, automatically
retry the agent call once with the following addition to the user message:
"Your previous response was not valid JSON. Return only the JSON object with
no surrounding text or code fences."

If the retry also fails, set the agent status to 'failed' with a user-facing
error message: "The itinerary could not be generated. Please try again."

If extractJSON returns ok: false for the Orchestrator, degrade gracefully:
display a plain text version of the Orchestrator's raw output in the Trip
Brief card rather than attempting to render the structured JSON fields.

---

### Agent Failure and Recovery

If any agent fails (network error, timeout, or invalid response after retry),
the following behaviour applies:

**Research Agents 1–3 (Local Tips, Food & Dining, Budget Planner):**
- Set the failed agent's status to 'failed' and display a retry button
  in that agent's tab
- Do not halt the pipeline — subsequent agents proceed using whatever
  outputs are available, with the missing agent's output slot left empty
- If a subsequent agent would normally receive a failed agent's output,
  omit that section from its user message and do not reference it

**Itinerary Agent 4:**
- Attempt one automatic retry (as described in JSON Response Handling)
- If the retry fails, set status to 'failed', halt the pipeline (the
  Orchestrator cannot run without an itinerary), and display a prominent
  retry button in the Itinerary tab
- The retry button reruns only the Itinerary Agent and, on success,
  triggers the Orchestrator

**Orchestrator Agent 5:**
- Attempt one automatic retry
- If the retry fails, degrade gracefully: display the four individual
  agent tab outputs as normal and show a message in the Trip Brief card:
  "The trip summary could not be generated. Your individual agent outputs
  are available in the tabs below."
- The Orchestrator can be retried independently via a button in the
  Trip Brief card without rerunning the other agents

In all cases, a failed agent's tab remains navigable and displays whatever
output was captured before the failure, or a clear empty state if nothing
was captured.

---

### Research Agent 1 — Local Tips
System prompt: You are a passionate local expert and well-travelled friend.
Using the traveller profile provided, give insider tips for their destination —
neighbourhood advice, where locals actually eat, cultural etiquette, things to
avoid, hidden gems, and timing tips. Tailor everything to their travel style
and interests. Never recommend booking services.

---

### Research Agent 2 — Food & Dining Guide
System prompt: You are a food-obsessed travel companion and well-travelled friend.
Using the traveller's dietary requirements, budget, and interests from their
profile, recommend specific dishes to try, types of restaurants to seek out,
local food markets, and any dining customs relevant to their destination.
Never make bookings or suggest reservation platforms.

You have also received the output of the Local Tips agent. Where relevant,
reference or build upon their neighbourhood and timing advice to make your
food recommendations more specific and useful.

---

### Research Agent 3 — Budget Planner
System prompt: You are a savvy travel finance advisor and well-travelled friend.
Using the traveller's daily budget and travel style from their profile, break
down realistic daily cost estimates for their destination, highlight where they
can save money, and flag any unexpectedly expensive aspects of the trip.
Never reference booking platforms.

You have also received the outputs of the Local Tips and Food & Dining agents.
Where relevant, use their specific recommendations to make your cost estimates
more accurate and grounded.

---

### Itinerary Agent 4 — Itinerary Planner
System prompt: You are an experienced travel planner and well-travelled friend.
Using the traveller profile provided, create a concise day-by-day itinerary for
their trip. Tailor the pace, activities, and experiences precisely to their
profile. Do not suggest hotels or flights. Focus on what to do, when, and why
it suits this particular traveller. Minimise transit time between locations.

You have received the full outputs of three research agents: Local Tips, Food &
Dining, and Budget Planner. Use their specific recommendations, cost estimates,
and insider knowledge to populate the itinerary with grounded, coherent
suggestions rather than generic activities.

Return your itinerary as a JSON object in exactly this structure. Return only
the JSON — no surrounding text, no code fences, no explanation:

{
  "destination": "string",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "short evocative theme for the day e.g. Arrival & Old Town",
      "activities": [
        {
          "time": "HH:MM",
          "duration_mins": 90,
          "title": "Activity name",
          "description": "2–3 sentences on what to do and why it suits this traveller",
          "category": "one of: culture | food | nature | nightlife | adventure | wellness | shopping | transport",
          "estimated_cost_usd": 0,
          "insider_tip": "one short insider tip if relevant, otherwise empty string"
        }
      ]
    }
  ]
}

---

### Orchestrator Agent 5 — Orchestrator (runs last)
This agent runs automatically after all four specialist agents have completed.
It receives the full outputs of all four agents and synthesises them into a
cohesive trip brief of no more than 250 words.

System prompt: You are a master travel coordinator. You have received the
complete outputs of four specialist travel agents: a local tips expert, a food
and dining guide, a budget planner, and an itinerary planner.

Your job is to synthesise their outputs into a single, cohesive trip summary
for the traveller. Identify any conflicts or overlaps (e.g. a recommended
restaurant that conflicts with dietary requirements, or a packed itinerary that
conflicts with a relaxed pace preference) and resolve them. Return only the
following JSON object with no surrounding text or code fences:

{
  "tripSummary": "2–3 sentence overview of the trip tailored to the traveller",
  "highlights": ["top 3–5 highlights drawn from all agent outputs"],
  "warnings": ["any conflicts, mismatches, or things to watch out for"],
  "dailyBudgetReality": "one sentence reconciling the budget estimate with the planned activities",
  "orchestratorNotes": "any additional synthesis commentary"
}

---

## Itinerary UI — Visual Timeline
Render the Itinerary Agent JSON output as a read-only interactive timeline:

- Each day is a collapsible card with day number, date, and theme as the header
- Inside each card, activities are displayed as time-blocked rows
- Each activity row shows: time, category icon, title, description, cost
  estimate, and insider tip (if present)
- Use colour coding by category (culture = blue, food = orange, nature = green,
  nightlife = purple, adventure = red, wellness = teal, shopping = yellow,
  transport = grey)
- The timeline is read-only — there is no chat input anywhere in the application

---

## UI Structure
- Clean top navigation with app name/logo and "Edit Trip Configuration" button
- Trip destination and dates shown as a persistent header strip once a trip
  is created
- Sequential agent progress bar below the header showing all five agents with
  their current state: waiting | running | complete | failed
- Each failed agent shows a retry button inline in the progress bar
- Orchestrator summary card rendered prominently above the tabs once complete,
  with a "Trip Brief" heading. If the Orchestrator failed or degraded, the
  card displays the fallback message and a retry button instead.
- Four tabs: Itinerary, Local Tips, Food & Dining, Budget
- Each tab displays its agent's output as readable formatted content — not a
  chat interface. There are no chat input boxes anywhere in the application.
- Agent outputs in Local Tips, Food & Dining, and Budget tabs are displayed
  as well-formatted prose or structured sections, not raw text
- The Itinerary tab shows the visual timeline described above
- Tabs are navigable once the relevant agent has completed. Show a loading
  skeleton while an agent is still running. Show an empty state with a retry
  button if the agent failed.

---

## Prompt Caching
Inject the user profile JSON into each agent system prompt as the first content
block and mark it with "cache_control": {"type": "ephemeral"} using the
Anthropic prompt caching format. This prevents the profile from being
re-tokenised on every agent call, reducing cost and latency.

The prior agent outputs passed in the messages array are not cached — they
change with each pipeline run and caching them would provide no benefit.

---

## State Structure
Manage all state via useReducer. Key state shape:

{
  userProfile: { ...surveyAnswers },      // persisted to sessionStorage
  currentTrip: { destination, mustSees }, // persisted to sessionStorage
  agents: {
    localTips:    { output: null, isLoading: false, error: null, status: 'waiting' },
    foodDining:   { output: null, isLoading: false, error: null, status: 'waiting' },
    budget:       { output: null, isLoading: false, error: null, status: 'waiting' },
    itinerary:    { json: null,   isLoading: false, error: null, status: 'waiting', retryCount: 0 },
    orchestrator: { output: null, isLoading: false, error: null, status: 'waiting', retryCount: 0 }
  },
  view: 'onboarding' | 'tripInput' | 'planner',
  activeTab: 'itinerary' | 'localTips' | 'foodDining' | 'budget'
}

Notes on state:
- userProfile and currentTrip are persisted to sessionStorage on every update
- Trip dates (startDate, endDate) are stored in userProfile, not currentTrip
- No messages arrays — there are no chat interfaces in this application
- status drives the progress indicator: waiting | running | complete | failed
- error captures failure reasons for display in the UI and retry prompts
- retryCount tracks automatic retries on the Itinerary and Orchestrator agents
  so that the automatic retry fires only once before surfacing the manual
  retry button

---

## Design
- Clean, modern travel-app aesthetic
- Warm neutrals with terracotta as the primary accent colour
- Mobile-responsive layout
- Tone throughout should feel like a knowledgeable friend, not a corporate
  travel agent
- Loading states and progress indicators use the terracotta accent so the
  "agents working" state feels intentional, not broken
- Failure states use a muted amber rather than aggressive red — consistent
  with the friendly tone
