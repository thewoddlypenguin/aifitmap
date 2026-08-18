# AI Fit Map — Developer Guide

Static front-end prototype · Phase 2

---

## Project Structure

```
ai_fit_map_homepage/
├── index.html              Homepage shell
├── css/
│   ├── style.css           Global layout, nav, homepage sections
│   └── quiz.css            Quiz modal, step UI, results cards
└── js/
    ├── analytics.js        Event tracking utility
    ├── quiz-config.js      ← All content lives here
    ├── quiz-engine.js      Modal lifecycle, state, scoring, rendering
    └── main.js             Nav, scroll reveal, sponsor bar
```

---

## Where to Edit Things

### Questions

**File:** `js/quiz-config.js` → `QUIZ_CONFIG.steps[]`

Each step object:

```js
{
  id: 'my_step',          // unique string id
  step: 3,                // display number (Step 1 is homepage)
  type: 'single',         // 'single' or 'multi'
  maxSelect: 3,           // only used when type === 'multi'
  question: '...',        // question text shown to the user
  hint: '...',            // optional subtext beneath the question
  options: [
    {
      id: 'opt_a',        // unique option id (used in analytics + scoring)
      label: '...',       // main option label
      sub: '...',         // optional sublabel
      icon: '🎯',         // emoji icon
      tags: ['tag1'],     // tags matched against tool tags for scoring
      weight: 1.2,        // multiplier applied to this option's tag score
    },
  ],
}
```

### Homepage Category Chips (Step 1)

**File:** `js/quiz-config.js` → `CATEGORY_CONFIG[]`

```js
{ id: 'writing', label: 'Writing', icon: '✍️', tags: ['writing', 'editing'] }
```

The `id` must match the `data-value` on the `.quiz-option-chip` buttons in `index.html`.

### Tool Catalog

**File:** `js/quiz-config.js` → `TOOL_CATALOG[]`

Each tool object:

```js
{
  id: 'my_tool',
  name: 'Tool Name',
  provider: 'Company Name',
  tagline: 'One line description',
  description: 'Longer description shown in results.',
  tags: ['writing', 'free_ok', 'simple'],   // must overlap with option tags
  hasFree: true,
  priceFrom: 'Free / $10/month',
  ctaLabel: 'Try It Free',
  ctaUrl: '#',            // link to tool — replace '#' with real URL in Phase 3
  baseScore: 70,          // base score before tag matching (0–100)
  sponsored: false,       // set true for exactly ONE tool to make it sponsored
  sponsoredLabel: 'Featured Partner',
  matchReasonsByCategory: {
    writing: 'Reason shown when user selected the Writing category.',
    everyday: 'Reason shown when user selected Everyday Help.',
    // ...one key per CATEGORY_CONFIG id
  },
  matchReasonsByTag: {
    simple: 'Reason shown when user values simplicity.',
    free_ok: 'Reason shown when user prefers free tools.',
    // ...keyed by option tag strings
  },
}
```

**Scoring formula:**

```
score = baseScore + Σ(option.weight × 7) for each tag in common
      + 12 bonus if tool has a matchReasonsByCategory for the chosen category
```

Capped at 99. Top 3 non-sponsored tools are shown as organic results.

### Sponsored Placement

Set `sponsored: true` on **one tool only** in `TOOL_CATALOG`. That tool is excluded from organic ranking and shown separately below the top 3 with a "Featured Partner" badge. Always clearly labeled.

Change the badge label via `sponsoredLabel: 'Featured Partner'`.

### Result Match Reasons ("Why this fits you")

Each result card shows up to 3 bullet points:

1. `matchReasonsByCategory[categoryId]` — always shown first if available
2. `matchReasonsByTag[tag]` — shown for each user tag that overlaps with tool tags
3. Generic fallback from `_tagReasonMap` inside `quiz-engine.js`

To customize what a tool says for a given user priority, add or edit entries in `tool.matchReasonsByTag`.

---

## Analytics Events

**File:** `js/analytics.js`

All events are logged to the browser console during Phase 2. Open DevTools → Console to see them.

| Event | When fired | Key payload fields |
|---|---|---|
| `quiz_option_selected` | User clicks homepage chip | `step`, `question_id`, `option_ids` |
| `quiz_started` | Modal opens | `category_id`, `category_label`, UTMs |
| `quiz_step_viewed` | Each step renders | `step`, `question_id` |
| `question_answered` | User clicks Next | `step`, `question_id`, `option_ids` |
| `quiz_completed` | Last step answered | `answers`, `category_id` |
| `results_viewed` | Results screen shown | `top_tool_ids`, `category_id` |
| `tool_cta_clicked` | Organic tool CTA | `tool_id`, `tool_name`, `position` |
| `sponsored_cta_clicked` | Sponsored tool CTA | `tool_id`, `tool_name`, `sponsor_id` |
| `retake_quiz_clicked` | Retake Quiz button | `device_type` |

**To connect a real analytics provider** (GA4, Segment, Mixpanel):

```js
// Add anywhere after analytics.js loads
Analytics.addProvider(function(eventName, payload) {
  gtag('event', eventName, payload);          // GA4 example
  // analytics.track(eventName, payload);     // Segment example
});
```

UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`) are automatically captured from the URL and attached to every event payload.

---

## Quiz Flow Architecture

```
Homepage (index.html)
  └─ Category chip selected → state.category set, CTA enabled
     └─ "START YOUR AI MATCH" clicked → QuizEngine.open()
        └─ Modal opens, Step 2 renders
           └─ Back/Next navigation (answers persisted in state.answers{})
              └─ Step 6 answered → _computeResults() → results screen
                 └─ "Retake Quiz" → resets state, renders Step 2
                 └─ "Browse All Tools" → closes modal, scrolls to #explore
                 └─ "Close" → closes modal
```

**State object:**

```js
state = {
  isOpen:      boolean,
  currentStep: number,    // index into QUIZ_CONFIG.steps
  direction:   1 | -1,   // animation direction
  answers:     {},        // { questionId: [optionId, ...] }
  category:    object,    // { id, label, icon, tags[] }
  results:     array,     // scored + sorted tool results
  phase:       'quiz' | 'results',
}
```

Answers are persisted in memory while the modal is open. Reopening the quiz resets state.

---

## Adding the Quiz to Other Pages (Phase 3)

The quiz engine is self-contained. To embed on another page:

1. Include `css/style.css`, `css/quiz.css`
2. Include `js/analytics.js`, `js/quiz-config.js`, `js/quiz-engine.js`
3. Call `QuizEngine.init()` on `DOMContentLoaded`
4. Add any button with `data-action="start-quiz"` to open the modal
5. If using homepage chips, include `.quiz-option-chip` elements with `data-value` matching `CATEGORY_CONFIG` ids

---

## Phase 3 Checklist

- [ ] Replace `ctaUrl: '#'` with real affiliate/referral links in `TOOL_CATALOG`
- [ ] Wire `Analytics.addProvider()` to production analytics (GA4 / Segment)
- [ ] Implement real scoring weights based on actual tool research
- [ ] Add email capture step before results (optional gate)
- [ ] Persist selected category in `sessionStorage` so refreshing doesn't lose it
- [ ] Add tool detail pages linked from result card CTAs
- [ ] Replace mock `baseScore` values with data-driven weights
