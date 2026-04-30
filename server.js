'use strict';
require('dotenv').config();

const express        = require('express');
const session        = require('express-session');
const path           = require('path');
const fs             = require('fs');
const vm             = require('vm');
const { spawn }      = require('child_process');
const { Ollama }     = require('ollama');

const app    = express();
const PORT   = process.env.PORT   || 3000;
const MODEL  = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

const ollama = new Ollama({ host: OLLAMA_HOST });

const SOLUTIONS_DIR     = path.join(__dirname, 'solutions');
if (!fs.existsSync(SOLUTIONS_DIR)) fs.mkdirSync(SOLUTIONS_DIR);

const CONVERSATIONS_DIR = path.join(__dirname, 'conversations');
if (!fs.existsSync(CONVERSATIONS_DIR)) fs.mkdirSync(CONVERSATIONS_DIR);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'code-learner-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are CodeMentor, an expert coding tutor. Your job is to TEACH, not to solve problems for the student.

## STRICT RULES — never break these:
1. NEVER give the full solution unless the user explicitly says "give me the full solution" or "show me the answer".
2. Give hints ONE at a time, not all at once.
3. Always respond using markdown formatting.
4. Be encouraging, beginner-friendly, and concise.
5. When the user shares their approach, validate it or gently redirect — don't write code for them.

## When giving a NEW PROBLEM, always include ALL of these sections:
### 🟢 Problem: [Title]
**Difficulty:** [BEGINNER / EASY / MEDIUM / HARD] | **Topic:** #[Topic]

**Problem Statement:**
[Clear explanation in simple terms]

**Constraints:**
- [constraint 1]
- [constraint 2]

**Examples:**
- Input: [x] → Output: [y] — [brief explanation]
- Input: [x] → Output: [y] — [brief explanation]

---
🤔 How do you plan to approach this? Tell me your thinking before writing any code!

## When reviewing CODE the student submits:
- First check if the logic is correct
- Then suggest improvements: Logic → Readability → Performance
- Explain Time Complexity (Big-O) in plain English
- Explain Space Complexity in plain English
- If there's a bug, hint at WHERE it is — don't fix it for them

## When giving a HINT:
- Give ONE small hint per request
- Progress from: concept → data structure → algorithm → pseudocode
- Never give code in a hint

## When asked to QUIZ:
- Ask ONE conceptual question
- Give the answer after a separator line
- Topics: Big-O, data structures, when to use what, tradeoffs

## Difficulty progression:
- BEGINNER: basic loops, arrays, strings
- EASY: two pointers, hashing, sorting basics
- MEDIUM: recursion, sliding window, stack/queue
- HARD: trees, graphs, dynamic programming

## Always end your response with a natural next-step prompt to keep the student engaged.`;

// ── Conversation persistence ───────────────────────────────────────────────────
function loadConversationFile(sessionId) {
  try {
    const filepath = path.join(CONVERSATIONS_DIR, `${sessionId}.json`);
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch { return null; }
}

function saveConversation(req) {
  try {
    const sessionId = req.session.id;
    const existing  = loadConversationFile(sessionId);
    const startedAt = existing?.startedAt || new Date().toISOString();

    let title = 'Coding Session';
    const firstAI = req.session.messages.find(m => m.role === 'assistant');
    if (firstAI) {
      const m = firstAI.content.match(/###?\s*(?:🟢\s*)?Problem:\s*(.+)/);
      if (m) title = m[1].replace(/\*+/g, '').trim();
    }

    const data = {
      sessionId,
      title,
      messages:     req.session.messages,
      difficulty:   req.session.difficulty   || 'BEGINNER',
      solvedCount:  req.session.solvedCount  || 0,
      problemCount: req.session.problemCount || 0,
      hintCount:    req.session.hintCount    || 0,
      model:        req.session.model        || MODEL,
      startedAt,
      lastActiveAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(CONVERSATIONS_DIR, `${sessionId}.json`),
      JSON.stringify(data, null, 2),
      'utf8',
    );
  } catch (err) {
    console.error('Failed to save conversation:', err.message);
  }
}

// ── Session helpers ────────────────────────────────────────────────────────────
function initSession(req) {
  if (!req.session.initialized) {
    const saved = loadConversationFile(req.session.id);
    if (saved && saved.messages && saved.messages.length > 0) {
      req.session.initialized  = true;
      req.session.messages     = saved.messages;
      req.session.difficulty   = saved.difficulty   || 'BEGINNER';
      req.session.solvedCount  = saved.solvedCount  || 0;
      req.session.problemCount = saved.problemCount || 0;
      req.session.hintCount    = saved.hintCount    || 0;
      req.session.weakAreas    = {};
      req.session.model        = saved.model        || MODEL;
    } else {
      req.session.initialized  = true;
      req.session.messages     = [];
      req.session.difficulty   = 'BEGINNER';
      req.session.solvedCount  = 0;
      req.session.problemCount = 0;
      req.session.hintCount    = 0;
      req.session.weakAreas    = {};
      req.session.model        = MODEL;
    }
  }
}

function getStats(req) {
  return {
    difficulty:   req.session.difficulty   || 'BEGINNER',
    solvedCount:  req.session.solvedCount  || 0,
    problemCount: req.session.problemCount || 0,
    hintCount:    req.session.hintCount    || 0,
    model:        req.session.model        || MODEL,
  };
}

// ── Call Ollama ────────────────────────────────────────────────────────────────
async function chat(req, userMessage) {
  const model = req.session.model || MODEL;

  req.session.messages.push({ role: 'user', content: userMessage });

  // Keep last 30 messages to avoid huge context (but always keep system intent)
  const recentMessages = req.session.messages.slice(-30);

  const response = await ollama.chat({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages,
    ],
    options: {
      temperature: 0.7,
      num_predict: 2048,
    },
  });

  const assistantMsg = response.message.content;
  req.session.messages.push({ role: 'assistant', content: assistantMsg });

  return assistantMsg;
}

// ── Track intent for stats ─────────────────────────────────────────────────────
function trackIntent(req, msg) {
  const lc = msg.toLowerCase();
  if (/\bhint\b/.test(lc)) req.session.hintCount++;
  if (/\bnext\b.*\bproblem\b|\bnext one\b/.test(lc)) req.session.problemCount++;
  if (/\bi (solved|did it|got it)|it works|all test|passed/.test(lc)) {
    req.session.solvedCount++;
    // Level up after every 2 solved
    if (req.session.solvedCount % 2 === 0) {
      const levels = ['BEGINNER', 'EASY', 'MEDIUM', 'HARD'];
      const idx = levels.indexOf(req.session.difficulty);
      if (idx < levels.length - 1) req.session.difficulty = levels[idx + 1];
    }
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────────

// Check Ollama connection & list models
app.get('/api/models', async (req, res) => {
  try {
    const list = await ollama.list();
    const models = list.models.map(m => m.name);
    res.json({ ok: true, models, current: MODEL });
  } catch {
    res.json({ ok: false, models: [], error: 'Ollama not running. Start it with: ollama serve' });
  }
});

// Start session
app.post('/api/start', async (req, res) => {
  // Fresh session
  req.session.initialized  = true;
  req.session.messages     = [];
  req.session.difficulty   = 'BEGINNER';
  req.session.solvedCount  = 0;
  req.session.problemCount = 1;
  req.session.hintCount    = 0;
  req.session.weakAreas    = {};
  req.session.model        = req.body.model || MODEL;

  const prompt = `Start my coding session. Give me my very first BEGINNER level problem. Follow your teaching methodology strictly — present the full problem with constraints and examples, then ask me how I plan to approach it. Do NOT give any hints or solutions yet.`;

  try {
    const reply = await chat(req, prompt);
    saveConversation(req);
    res.json({ message: reply, stats: getStats(req) });
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: ollamaError(err) });
  }
});

// Main chat
app.post('/api/chat', async (req, res) => {
  initSession(req);
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'Empty message.' });

  trackIntent(req, message);

  try {
    const reply = await chat(req, message);
    saveConversation(req);
    res.json({ message: reply, stats: getStats(req) });
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: ollamaError(err) });
  }
});

// Quick action buttons
app.post('/api/action', async (req, res) => {
  initSession(req);
  const { action } = req.body;

  const prompts = {
    hint:      'Give me ONE hint for the current problem. Just one — don\'t reveal too much.',
    next:      `Give me the next problem. I am currently at ${req.session.difficulty} level. Present a fresh problem with constraints and examples, then ask for my approach.`,
    quiz:      'Quiz me! Ask me ONE conceptual question about data structures, algorithms, or Big-O complexity. Give the answer after a separator.',
    timed:     `Give me a timed challenge problem at ${req.session.difficulty} level. Tell me to solve it in 10 minutes. Present the full problem.`,
    weakAreas: 'Based on our conversation so far, what topics do you think I should focus on? Give me specific advice and suggest what to practice next.',
    solution:  'The student has explicitly asked for the full solution. Please provide the complete solution with step-by-step explanation, time complexity, and space complexity.',
  };

  const prompt = prompts[action];
  if (!prompt) return res.status(400).json({ error: 'Unknown action.' });

  if (action === 'hint') req.session.hintCount++;
  if (action === 'next') req.session.problemCount++;

  try {
    const reply = await chat(req, prompt);
    saveConversation(req);
    res.json({ message: reply, stats: getStats(req) });
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: ollamaError(err) });
  }
});

// Code review
app.post('/api/review', async (req, res) => {
  initSession(req);
  const { code, language } = req.body;
  if (!code || !code.trim()) return res.status(400).json({ error: 'No code provided.' });

  const prompt = `The student has submitted their code for review. Language: ${language || 'unknown'}.

\`\`\`${language || ''}
${code}
\`\`\`

Review this code:
1. Is the logic correct for the current problem?
2. Suggest improvements in: Logic → Readability → Performance
3. Explain the Time Complexity (Big-O) in simple terms
4. Explain the Space Complexity in simple terms
5. If there are bugs, hint at WHERE they are — do NOT fix them directly`;

  try {
    const reply = await chat(req, prompt);
    saveConversation(req);
    res.json({ message: reply, stats: getStats(req) });
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: ollamaError(err) });
  }
});

// Change model mid-session
app.post('/api/model', (req, res) => {
  initSession(req);
  const { model } = req.body;
  if (!model) return res.status(400).json({ error: 'No model provided.' });
  req.session.model = model;
  res.json({ ok: true, model, stats: getStats(req) });
});

// Reset
app.post('/api/reset', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Stats
app.get('/api/stats', (req, res) => {
  initSession(req);
  res.json(getStats(req));
});

// Current session — used by frontend to restore chat after page refresh / server restart
app.get('/api/session', (req, res) => {
  initSession(req);
  res.json({
    hasSession: req.session.messages.length > 0,
    messages:   req.session.messages,
    stats:      getStats(req),
  });
});

// List all saved conversation sessions
app.get('/api/conversations', (req, res) => {
  try {
    const files = fs.readdirSync(CONVERSATIONS_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const d = JSON.parse(fs.readFileSync(path.join(CONVERSATIONS_DIR, f), 'utf8'));
          return {
            id:           d.sessionId,
            title:        d.title        || 'Coding Session',
            difficulty:   d.difficulty   || 'BEGINNER',
            messageCount: d.messages     ? d.messages.length : 0,
            solvedCount:  d.solvedCount  || 0,
            model:        d.model        || '',
            startedAt:    d.startedAt,
            lastActiveAt: d.lastActiveAt,
          };
        } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt));
    res.json({ conversations: files });
  } catch {
    res.json({ conversations: [] });
  }
});

// Resume a saved conversation into the current session
app.post('/api/conversations/:id/resume', (req, res) => {
  const id    = req.params.id.replace(/[^a-zA-Z0-9_\-]/g, '');
  const saved = loadConversationFile(id);
  if (!saved) return res.status(404).json({ error: 'Conversation not found.' });

  req.session.initialized  = true;
  req.session.messages     = saved.messages;
  req.session.difficulty   = saved.difficulty   || 'BEGINNER';
  req.session.solvedCount  = saved.solvedCount  || 0;
  req.session.problemCount = saved.problemCount || 0;
  req.session.hintCount    = saved.hintCount    || 0;
  req.session.weakAreas    = {};
  req.session.model        = saved.model        || MODEL;

  res.json({ messages: saved.messages, stats: getStats(req) });
});

// Delete a saved conversation
app.delete('/api/conversations/:id', (req, res) => {
  const id       = req.params.id.replace(/[^a-zA-Z0-9_\-]/g, '');
  const filepath = path.join(CONVERSATIONS_DIR, `${id}.json`);
  try {
    if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Not found.' });
    fs.unlinkSync(filepath);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save solution to file
app.post('/api/save-solution', (req, res) => {
  const { filename, code, problemTitle, difficulty, language } = req.body;
  if (!filename || !code) return res.status(400).json({ error: 'filename and code are required.' });

  const safe = filename.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_{2,}/g, '_').replace(/^_|_$/g, '') || 'solution';
  const filepath = path.join(SOLUTIONS_DIR, `${safe}.js`);

  const header = [
    `// Problem: ${problemTitle || safe}`,
    `// Difficulty: ${difficulty || 'unknown'}`,
    `// Language: ${language || 'javascript'}`,
    `// Saved: ${new Date().toLocaleString()}`,
    '',
    '',
  ].join('\n');

  try {
    fs.writeFileSync(filepath, header + code, 'utf8');
    res.json({ ok: true, filename: `${safe}.js` });
  } catch (err) {
    res.status(500).json({ error: `Failed to save: ${err.message}` });
  }
});

// List saved solutions
app.get('/api/solutions', (req, res) => {
  try {
    const files = fs.readdirSync(SOLUTIONS_DIR)
      .filter(f => f.endsWith('.js'))
      .map(f => {
        const stat = fs.statSync(path.join(SOLUTIONS_DIR, f));
        return { name: f, size: stat.size, modified: stat.mtime };
      })
      .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    res.json({ files });
  } catch {
    res.json({ files: [] });
  }
});

// Get a solution's content
app.get('/api/solutions/:filename', (req, res) => {
  const safe = path.basename(req.params.filename);
  if (!safe.endsWith('.js')) return res.status(400).json({ error: 'Invalid filename.' });
  const filepath = path.join(SOLUTIONS_DIR, safe);
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    res.json({ content });
  } catch {
    res.status(404).json({ error: 'Solution not found.' });
  }
});

// Delete a saved solution
app.delete('/api/solutions/:filename', (req, res) => {
  const safe = path.basename(req.params.filename);
  if (!safe.endsWith('.js')) return res.status(400).json({ error: 'Invalid filename.' });
  const filepath = path.join(SOLUTIONS_DIR, safe);
  try {
    fs.unlinkSync(filepath);
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: 'Solution not found.' });
  }
});

// Run code
app.post('/api/run', (req, res) => {
  const { code, language } = req.body;
  if (!code || !code.trim()) return res.json({ output: '', error: null });

  if (language === 'javascript') {
    const logs = [];
    const fmt  = (...a) => a.map(v => (typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v))).join(' ');
    const sandbox = {
      console: {
        log:   (...a) => logs.push(fmt(...a)),
        error: (...a) => logs.push('[error] ' + fmt(...a)),
        warn:  (...a) => logs.push('[warn] '  + fmt(...a)),
        info:  (...a) => logs.push('[info] '  + fmt(...a)),
      },
      Math, JSON, Array, Object, String, Number, Boolean, Date, RegExp, Map, Set,
      parseInt, parseFloat, isNaN, isFinite,
      encodeURIComponent, decodeURIComponent,
      // neutralise timers — they can't work synchronously anyway
      setTimeout: () => {}, clearTimeout: () => {},
      setInterval: () => {}, clearInterval: () => {},
    };
    try {
      vm.runInNewContext(code, sandbox, { timeout: 5000 });
      res.json({ output: logs.join('\n'), error: null });
    } catch (err) {
      res.json({ output: logs.join('\n'), error: err.message });
    }
    return;
  }

  if (language === 'python') {
    const cmd = process.platform === 'win32' ? 'python' : 'python3';
    runProcess(res, cmd, ['-u', '-c', code]);
    return;
  }

  res.json({ output: '', error: `Run is supported for JavaScript and Python only. For ${language}, use an online compiler.` });
});

function runProcess(res, cmd, args) {
  let out = '', err = '', done = false;
  const proc = spawn(cmd, args);
  const guard = setTimeout(() => { if (!done) { proc.kill(); err = 'Timed out after 5 seconds.'; } }, 5000);

  proc.stdout.on('data', d => out += d.toString());
  proc.stderr.on('data', d => err += d.toString());
  proc.on('close', () => {
    done = true; clearTimeout(guard);
    res.json({ output: out.trim(), error: err.trim() || null });
  });
  proc.on('error', e => {
    done = true; clearTimeout(guard);
    res.json({ output: '', error: `Could not start process: ${e.message}` });
  });
}

// ── Error helper ───────────────────────────────────────────────────────────────
function ollamaError(err) {
  const msg = err.message || '';
  if (msg.includes('ECONNREFUSED') || msg.includes('fetch'))
    return 'Cannot reach Ollama. Make sure it is running: open a terminal and run **ollama serve**';
  if (msg.includes('model'))
    return `Model not found. Pull it first: **ollama pull ${MODEL}**`;
  return `Ollama error: ${msg}`;
}

app.listen(PORT, () => {
  console.log(`\n🚀 Code Learner  →  http://localhost:${PORT}`);
  console.log(`   Ollama host   →  ${OLLAMA_HOST}`);
  console.log(`   Default model →  ${MODEL}`);
  console.log(`\n   Make sure Ollama is running: ollama serve`);
  console.log(`   Pull a model if needed:      ollama pull ${MODEL}\n`);
});
