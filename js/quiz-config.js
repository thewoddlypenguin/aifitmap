/**
 * AI FIT MAP — Quiz Config (Phase 2)
 * ────────────────────────────────────────────────────────────
 * Central config file. Edit this to change:
 *   - Quiz questions and options         → QUIZ_CONFIG.steps[]
 *   - Tool catalog (name, desc, tags)    → TOOL_CATALOG[]
 *   - Sponsored placements               → tool.sponsored = true
 *   - Result matching reasons            → tool.matchReasonsByCategory{}
 *   - Option tags used in scoring        → option.tags[]
 *
 * Question types:
 *   'single' — radio-style, one option selected at a time
 *   'multi'  — checkbox-style, up to maxSelect options
 *
 * Option fields:
 *   id      {string}   unique identifier used in scoring and analytics
 *   label   {string}   display label
 *   sub     {string}   optional sublabel
 *   icon    {string}   emoji or icon character
 *   tags    {string[]} tags used to match against tool tags for scoring
 *   weight  {number}   multiplier applied to this option's tag matches (default 1)
 *
 * IMPORTANT: Step 1 (category selection) lives on the homepage quiz card,
 * not in QUIZ_CONFIG.steps. The homepage chip values map to CATEGORY_CONFIG.
 * ────────────────────────────────────────────────────────────
 */

/* ── Category Config (Step 1 — Homepage) ────────────────── */
var CATEGORY_CONFIG = [
  { id: 'everyday', label: 'Everyday Help',      icon: '🏠', tags: ['everyday', 'personal', 'home', 'casual'] },
  { id: 'writing',  label: 'Writing',             icon: '✍️', tags: ['writing', 'editing', 'content', 'quality_output'] },
  { id: 'planning', label: 'Planning',            icon: '🗓️', tags: ['planning', 'organizing', 'scheduling', 'productivity'] },
  { id: 'work',     label: 'Work Productivity',   icon: '💼', tags: ['work', 'professional', 'business', 'productivity', 'efficient'] },
  { id: 'learning', label: 'Learning',            icon: '📚', tags: ['learning', 'educational', 'student', 'detailed'] },
  { id: 'research', label: 'Research',            icon: '🔍', tags: ['research', 'detailed', 'sources', 'analysis'] },
];

/* ── Quiz Config (Steps 2–6 — Modal) ───────────────────── */
var QUIZ_CONFIG = {
  steps: [
    /* ── Step 2: Tech Comfort ─────────────────────────── */
    {
      id: 'experience',
      step: 2,
      type: 'single',
      question: 'How comfortable are you with technology in general?',
      hint: 'Be honest — there\'s no wrong answer. This helps us find tools that match your comfort level.',
      options: [
        {
          id: 'exp_basic',
          label: 'Not very comfortable',
          sub: 'I stick to the basics',
          icon: '🌱',
          tags: ['beginner', 'easy_required', 'simple'],
          weight: 1.5,
        },
        {
          id: 'exp_some',
          label: 'Somewhat comfortable',
          sub: 'I use apps every day',
          icon: '🌿',
          tags: ['intermediate', 'easy_preferred', 'simple'],
          weight: 1.2,
        },
        {
          id: 'exp_good',
          label: 'Pretty comfortable',
          sub: 'I figure most things out',
          icon: '🌳',
          tags: ['comfortable', 'feature_rich_ok'],
          weight: 1.0,
        },
        {
          id: 'exp_very',
          label: 'Very comfortable',
          sub: 'I\'m tech-savvy',
          icon: '🚀',
          tags: ['advanced', 'power_user', 'feature_rich_ok'],
          weight: 1.0,
        },
      ],
    },

    /* ── Step 3: Usage Frequency ──────────────────────── */
    {
      id: 'frequency',
      step: 3,
      type: 'single',
      question: 'How often do you expect to use an AI tool?',
      hint: 'This helps us decide whether a free plan suits you — or if a paid tool is worth it.',
      options: [
        {
          id: 'freq_occasional',
          label: 'Occasionally',
          sub: 'When I need it',
          icon: '☁️',
          tags: ['casual', 'free_ok'],
          weight: 1.0,
        },
        {
          id: 'freq_weekly',
          label: 'A few times a week',
          sub: 'Fairly regularly',
          icon: '📆',
          tags: ['regular', 'free_ok', 'paid_maybe'],
          weight: 1.0,
        },
        {
          id: 'freq_daily',
          label: 'Every day',
          sub: 'Part of my routine',
          icon: '⚡',
          tags: ['daily', 'paid_maybe', 'power_ok'],
          weight: 1.2,
        },
        {
          id: 'freq_many',
          label: 'Multiple times a day',
          sub: 'Constantly using it',
          icon: '🔥',
          tags: ['heavy', 'paid_worth_it', 'power_ok'],
          weight: 1.3,
        },
      ],
    },

    /* ── Step 4: Priorities (multi-select) ────────────── */
    {
      id: 'priorities',
      step: 4,
      type: 'multi',
      maxSelect: 3,
      question: 'What matters most to you in an AI tool?',
      hint: 'Pick up to 3 things that are most important to you.',
      options: [
        {
          id: 'pri_easy',
          label: 'Easy to use',
          sub: 'Simple interface, no learning curve',
          icon: '😊',
          tags: ['simple', 'beginner_friendly'],
          weight: 1.5,
        },
        {
          id: 'pri_free',
          label: 'Free or low cost',
          sub: 'Value for money matters',
          icon: '💰',
          tags: ['free_ok', 'budget_conscious'],
          weight: 1.5,
        },
        {
          id: 'pri_mobile',
          label: 'Works great on mobile',
          sub: 'I\'m often on my phone',
          icon: '📱',
          tags: ['mobile', 'on_the_go'],
          weight: 1.2,
        },
        {
          id: 'pri_time',
          label: 'Saves me time',
          sub: 'Speed and efficiency',
          icon: '⏱️',
          tags: ['efficient', 'saves_time'],
          weight: 1.2,
        },
        {
          id: 'pri_writing',
          label: 'Helps me write better',
          sub: 'Quality output matters',
          icon: '✍️',
          tags: ['writing', 'quality_output'],
          weight: 1.3,
        },
        {
          id: 'pri_privacy',
          label: 'Keeps my data private',
          sub: 'I care about security',
          icon: '🔒',
          tags: ['privacy', 'secure'],
          weight: 1.2,
        },
        {
          id: 'pri_integrations',
          label: 'Works with my other apps',
          sub: 'Fits into my workflow',
          icon: '🔗',
          tags: ['integrations', 'workflow'],
          weight: 1.0,
        },
        {
          id: 'pri_detail',
          label: 'Gives detailed explanations',
          sub: 'I want to understand, not just get answers',
          icon: '🧠',
          tags: ['educational', 'detailed'],
          weight: 1.0,
        },
      ],
    },

    /* ── Step 5: Budget ───────────────────────────────── */
    {
      id: 'budget',
      step: 5,
      type: 'single',
      question: 'What\'s your budget for AI tools?',
      hint: 'Most great AI tools have a free tier — paid plans unlock more features and usage.',
      options: [
        {
          id: 'budget_free',
          label: 'Free only',
          sub: 'Not ready to pay right now',
          icon: '🎁',
          tags: ['free_only', 'free_ok', 'budget_conscious'],
          weight: 1.0,
        },
        {
          id: 'budget_low',
          label: 'Up to $10/month',
          sub: 'A small investment is fine',
          icon: '💵',
          tags: ['low_budget', 'free_ok', 'paid_maybe'],
          weight: 1.0,
        },
        {
          id: 'budget_mid',
          label: '$10–$30/month',
          sub: 'Happy to pay if it\'s worth it',
          icon: '💳',
          tags: ['mid_budget', 'paid_maybe', 'paid_ok'],
          weight: 1.0,
        },
        {
          id: 'budget_any',
          label: 'Whatever the right tool costs',
          sub: 'I\'ll invest in quality',
          icon: '⭐',
          tags: ['any_budget', 'paid_ok', 'paid_worth_it'],
          weight: 1.0,
        },
      ],
    },

    /* ── Step 6: Context ──────────────────────────────── */
    {
      id: 'context',
      step: 6,
      type: 'single',
      question: 'Where would you mainly use this AI tool?',
      hint: 'Different settings call for different tools — this helps us refine your match.',
      options: [
        {
          id: 'ctx_home',
          label: 'At home — personal use',
          sub: 'Hobbies, family, daily life',
          icon: '🏠',
          tags: ['personal', 'home', 'casual'],
          weight: 1.0,
        },
        {
          id: 'ctx_work',
          label: 'At work or for my business',
          sub: 'Professional tasks',
          icon: '💼',
          tags: ['professional', 'work', 'business'],
          weight: 1.0,
        },
        {
          id: 'ctx_school',
          label: 'School or learning',
          sub: 'Students and lifelong learners',
          icon: '🎓',
          tags: ['student', 'learning', 'educational'],
          weight: 1.0,
        },
        {
          id: 'ctx_mobile',
          label: 'On the go',
          sub: 'Quick tasks on my phone',
          icon: '📱',
          tags: ['mobile', 'on_the_go', 'casual'],
          weight: 1.0,
        },
      ],
    },
  ],
};

/* ── Tool Catalog ────────────────────────────────────────── */
/*
 * To add a new tool: copy one entry below and fill in all fields.
 * To sponsor a tool: set sponsored: true on ONE tool only.
 *   The sponsored tool will appear in a clearly labeled section
 *   in the results, separate from organic recommendations.
 *
 * tags[]  — must overlap with option tags above for scoring to work.
 * matchReasonsByCategory{} — keys should match CATEGORY_CONFIG ids.
 * matchReasonsByTag{}      — keys should match option tags for match bullets.
 */
var TOOL_CATALOG = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    tagline: 'The all-purpose AI assistant',
    description: 'Ask anything, write anything, explore any idea. The most versatile AI tool for everyday people.',
    tags: [
      'everyday', 'writing', 'research', 'learning', 'planning',
      'simple', 'beginner_friendly', 'free_ok', 'paid_ok', 'mobile',
      'efficient', 'saves_time', 'quality_output', 'educational', 'detailed',
      'personal', 'home', 'work', 'student',
    ],
    hasFree: true,
    priceFrom: 'Free / $20/month',
    ctaLabel: 'Try ChatGPT Free',
    ctaUrl: '#',
    baseScore: 78,
    sponsored: false,
    matchReasonsByCategory: {
      everyday: 'Handles virtually any everyday question or task you throw at it',
      writing:  'Writes, edits, and improves any text in any tone or format',
      research: 'Explains complex topics in plain, easy-to-understand language',
      learning: 'Acts like a patient tutor — explains until it clicks',
      planning: 'Helps you think through plans, schedules, and big decisions step by step',
      work:     'Drafts emails, summarizes documents, and supercharges workplace tasks',
    },
    matchReasonsByTag: {
      simple:            'Clean, conversational interface that feels like texting a knowledgeable friend',
      beginner_friendly: 'No setup needed — just type and go',
      free_ok:           'Generous free tier covers most everyday needs',
      mobile:            'Native iOS and Android apps with full functionality',
      quality_output:    'Industry-leading quality for writing and analysis tasks',
      educational:       'Explains its reasoning so you actually understand, not just get an answer',
    },
  },

  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    tagline: 'Thoughtful, nuanced AI for careful thinkers',
    description: 'Known for careful, balanced, and nuanced responses. Excels at writing, analysis, and anything needing depth.',
    tags: [
      'writing', 'research', 'learning', 'quality_output', 'detailed',
      'educational', 'privacy', 'professional', 'work', 'student',
      'free_ok', 'paid_ok', 'efficient', 'secure',
    ],
    hasFree: true,
    priceFrom: 'Free / $20/month',
    ctaLabel: 'Try Claude Free',
    ctaUrl: '#',
    baseScore: 74,
    sponsored: false,
    matchReasonsByCategory: {
      writing:  'Produces exceptionally clear, polished writing with nuance and care',
      research: 'Goes deeper than most — ideal for analysis and complex questions',
      learning: 'Explains things carefully and thoroughly for genuine understanding',
      everyday: 'Handles everyday tasks with a thoughtful, measured approach',
      planning: 'Helps you think through decisions with structured, balanced reasoning',
      work:     'Excellent for professional communication, reports, and summaries',
    },
    matchReasonsByTag: {
      quality_output:    'Consistently produces thoughtful, high-quality responses',
      educational:       'Takes time to explain concepts, not just give answers',
      privacy:           'Built with privacy-first principles by Anthropic',
      secure:            'Strong safety and privacy focus — no data sold or shared',
      detailed:          'Known for thorough, well-reasoned responses on complex topics',
      professional:      'Popular with professionals for its polished communication style',
    },
  },

  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    tagline: 'Google\'s AI — inside the apps you already use',
    description: 'Seamlessly integrated with Gmail, Docs, and Google Search. Ideal if you\'re in the Google ecosystem.',
    tags: [
      'everyday', 'writing', 'productivity', 'integrations', 'workflow',
      'mobile', 'on_the_go', 'free_ok', 'personal', 'home', 'work',
      'simple', 'beginner_friendly', 'efficient', 'saves_time',
    ],
    hasFree: true,
    priceFrom: 'Free / included with Google One',
    ctaLabel: 'Try Gemini Free',
    ctaUrl: '#',
    baseScore: 69,
    sponsored: false,
    matchReasonsByCategory: {
      everyday: 'Answers everyday questions and works inside Google apps you already use',
      writing:  'Drafts emails and documents directly inside Gmail and Google Docs',
      work:     'Fits naturally into Google Workspace — Docs, Sheets, Gmail and more',
      planning: 'Organizes your Google Calendar, Docs, and tasks in one place',
      research: 'Backed by real-time Google Search for current, sourced answers',
      learning: 'Explains topics clearly with links to authoritative sources',
    },
    matchReasonsByTag: {
      integrations:      'Deep integration with Gmail, Docs, Drive, Calendar, and Search',
      workflow:          'Fits directly into the Google apps you use every day',
      mobile:            'Built into Google\'s Android and iOS apps',
      beginner_friendly: 'Familiar Google interface — no new app to learn',
      free_ok:           'Free tier is generous and included with your Google account',
    },
  },

  {
    id: 'notion_ai',
    name: 'Notion AI',
    provider: 'Notion',
    tagline: 'Plan, write, and organize — all in one place',
    description: 'Keep notes, tasks, projects, and AI writing in one organized workspace. Best-in-class for planners.',
    tags: [
      'planning', 'writing', 'work', 'productivity', 'integrations',
      'workflow', 'professional', 'business', 'organizing', 'scheduling',
      'paid_maybe', 'paid_ok', 'efficient', 'saves_time',
    ],
    hasFree: false,
    priceFrom: 'From $10/month',
    ctaLabel: 'Try Notion AI',
    ctaUrl: '#',
    baseScore: 63,
    sponsored: true,           // ← This is the sponsored/partner placement
    sponsoredLabel: 'Featured Partner',
    matchReasonsByCategory: {
      planning: 'Best-in-class for organizing projects, goals, and daily plans in one workspace',
      writing:  'Write and edit documents, notes, and content all inside a powerful organizer',
      work:     'Perfect for teams and professionals who want structured, organized workflows',
      everyday: 'Keep your whole life organized — notes, reminders, ideas — with AI built in',
      learning: 'Create study notes, summaries, and organized knowledge bases effortlessly',
      research: 'Collect, organize, and summarize research in one structured workspace',
    },
    matchReasonsByTag: {
      workflow:      'Connects your notes, tasks, databases, and documents in one place',
      integrations:  'Integrates with Slack, GitHub, Google Drive, and hundreds more',
      organizing:    'The most powerful organizational AI tool available today',
      efficient:     'Cuts hours of admin work per week for most users',
      professional:  'Widely used by product teams, writers, and business owners',
    },
  },

  {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'Perplexity AI',
    tagline: 'Real answers with real sources — instantly',
    description: 'Like a search engine that actually answers your question, with sources you can click and verify.',
    tags: [
      'research', 'learning', 'detailed', 'educational', 'free_ok',
      'simple', 'beginner_friendly', 'personal', 'home', 'student',
      'quality_output', 'efficient', 'sources', 'analysis',
    ],
    hasFree: true,
    priceFrom: 'Free / $20/month',
    ctaLabel: 'Try Perplexity Free',
    ctaUrl: '#',
    baseScore: 66,
    sponsored: false,
    matchReasonsByCategory: {
      research: 'Gives cited, sourced answers — perfect for verifying facts and exploring topics',
      learning: 'Explains any topic clearly with links so you can go as deep as you want',
      everyday: 'Faster than a regular search — gives direct answers with context',
      writing:  'Research facts and find trusted sources before you write',
      planning: 'Research options, compare choices, and make well-informed decisions',
      work:     'Quickly research industry topics, competitor info, and market data',
    },
    matchReasonsByTag: {
      detailed:          'Always shows its sources so you can dig deeper yourself',
      educational:       'Built for people who want to actually understand, not just get answers',
      beginner_friendly: 'Works exactly like a search bar — type a question, get a real answer',
      free_ok:           'Free tier is very capable for regular research use',
      quality_output:    'Known for accurate, sourced, up-to-date responses',
    },
  },

  {
    id: 'grammarly',
    name: 'Grammarly',
    provider: 'Grammarly Inc.',
    tagline: 'Write with confidence — everywhere you type',
    description: 'The world\'s most-used writing assistant. Fixes grammar, improves tone, and now includes full AI writing features.',
    tags: [
      'writing', 'editing', 'professional', 'work', 'business',
      'quality_output', 'simple', 'beginner_friendly', 'mobile',
      'integrations', 'workflow', 'free_ok', 'paid_maybe',
    ],
    hasFree: true,
    priceFrom: 'Free / $12/month',
    ctaLabel: 'Try Grammarly Free',
    ctaUrl: '#',
    baseScore: 71,
    sponsored: false,
    matchReasonsByCategory: {
      writing:  'The gold standard for improving your writing quality — anywhere you type',
      work:     'Makes every email, report, and document sound more professional',
      everyday: 'Works in the background so every message you write comes out polished',
      learning: 'Explains why it makes suggestions — helping you improve your actual skills',
      planning: 'Helps you write clearer, more professional plans and proposals',
      research: 'Helps communicate research findings clearly and professionally',
    },
    matchReasonsByTag: {
      simple:            'Works invisibly inside Gmail, Docs, Word, and your browser',
      beginner_friendly: 'No setup — install once and it just works everywhere',
      mobile:            'iOS and Android keyboard integration for on-the-go writing',
      integrations:      'Works inside Gmail, Google Docs, Microsoft Word, and most browsers',
      quality_output:    'Trusted by millions of professionals for polished, confident writing',
    },
  },

  {
    id: 'otter',
    name: 'Otter.ai',
    provider: 'Otter.ai',
    tagline: 'Never miss what was said in a meeting again',
    description: 'Automatically records, transcribes, and summarizes meetings and conversations in real time.',
    tags: [
      'work', 'productivity', 'professional', 'business', 'efficient',
      'saves_time', 'mobile', 'on_the_go', 'paid_maybe', 'integrations', 'workflow',
    ],
    hasFree: true,
    priceFrom: 'Free / $10/month',
    ctaLabel: 'Try Otter.ai Free',
    ctaUrl: '#',
    baseScore: 58,
    sponsored: false,
    matchReasonsByCategory: {
      work:     'Saves hours by automatically transcribing and summarizing your meetings',
      everyday: 'Captures conversations, lectures, or voice notes on the go',
      planning: 'Turns meeting discussions into structured action items automatically',
      research: 'Record and transcribe interviews, talks, or sessions instantly',
      learning: 'Perfect for capturing lectures and webinars word-for-word',
      writing:  'Turns spoken ideas into text you can then edit and develop',
    },
    matchReasonsByTag: {
      efficient:  'Eliminates the need for manual note-taking in meetings',
      saves_time: 'Saves hours per week on meeting follow-up and note organization',
      mobile:     'Records and transcribes directly from your phone',
      workflow:   'Integrates with Zoom, Google Meet, and Microsoft Teams',
    },
  },
];
