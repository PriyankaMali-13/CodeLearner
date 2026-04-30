'use strict';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const chatMessages    = document.getElementById('chatMessages');
const userInput       = document.getElementById('userInput');
const sendBtn         = document.getElementById('sendBtn');
const startBtn        = document.getElementById('startBtn');
const resetBtn        = document.getElementById('resetBtn');
const typingIndicator = document.getElementById('typingIndicator');
const welcomeScreen   = document.getElementById('welcomeScreen');
const reviewCodeBtn   = document.getElementById('reviewCodeBtn');
const clearCodeBtn    = document.getElementById('clearCodeBtn');
const openCodeEditor  = document.getElementById('openCodeEditor');
const solutionBtn     = document.getElementById('solutionBtn');
const codeEditor      = document.getElementById('codeEditor');
const languageSelect  = document.getElementById('languageSelect');
const modelSelect     = document.getElementById('modelSelect');
const ollamaStatus    = document.getElementById('ollamaStatus');
const stopBtn         = document.getElementById('stopBtn');
const clearInputBtn   = document.getElementById('clearInputBtn');
const saveSolutionBtn = document.getElementById('saveSolutionBtn');
const mySolutionsBtn  = document.getElementById('mySolutionsBtn');
const runBtn          = document.getElementById('runBtn');
const outputPanel     = document.getElementById('outputPanel');
const outputContent   = document.getElementById('outputContent');
const runTime         = document.getElementById('runTime');
const clearOutputBtn  = document.getElementById('clearOutputBtn');

const saveSolutionModal  = new bootstrap.Modal(document.getElementById('saveSolutionModal'));
const solutionsModal     = new bootstrap.Modal(document.getElementById('solutionsModal'));

// CodeMirror instance (set during init)
let cm = null;
function getCode()    { return cm ? cm.getValue() : codeEditor.value; }
function setCode(val) { if (cm) { cm.setValue(val); cm.clearHistory(); } else codeEditor.value = val; }

// Abort controller — lets us cancel in-flight fetch requests
let currentAbort = null;

// Stats
const statSolved   = document.getElementById('statSolved');
const statProblems = document.getElementById('statProblems');
const statHints    = document.getElementById('statHints');
const diffBadge    = document.getElementById('difficultyBadge');

// Timer
let timerInterval = null;
let timerSeconds  = 600;
const timerModal   = new bootstrap.Modal(document.getElementById('timerModal'));
const timerDisplay = document.getElementById('timerDisplay');

// Toast
const toastEl      = document.getElementById('notifToast');
const toastMessage = document.getElementById('toastMessage');
const bsToast      = new bootstrap.Toast(toastEl, { delay: 3500 });

// ── Marked.js config ──────────────────────────────────────────────────────────
marked.setOptions({
  breaks: true,
  gfm: true,
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  toastMessage.textContent = msg;
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  bsToast.show();
}

function scrollBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setLoading(on) {
  sendBtn.disabled = on;
  // ✅ textarea stays ALWAYS editable — user can clear/edit anytime
  typingIndicator.classList.toggle('d-none', !on);
  if (on) scrollBottom();
}

function updateStats(stats) {
  if (!stats) return;
  statSolved.textContent   = stats.solvedCount   ?? 0;
  statProblems.textContent = stats.problemCount  ?? 0;
  statHints.textContent    = stats.hintCount     ?? 0;

  const diff = stats.difficulty || 'BEGINNER';
  diffBadge.textContent = diff;
  diffBadge.setAttribute('data-difficulty', diff);

  // Sync model selector if stats carry model info
  if (stats.model && modelSelect.value !== stats.model) {
    for (const opt of modelSelect.options) {
      if (opt.value === stats.model) { modelSelect.value = stats.model; break; }
    }
  }
}

function renderMarkdown(text) {
  const html = marked.parse(text || '');
  // Syntax-highlight code blocks after rendering
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
  return tmp.innerHTML;
}

function appendMessage(role, content, isError = false) {
  const isUser = role === 'user';

  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${isUser ? 'user-wrapper' : ''}`;

  const avatar = document.createElement('div');
  avatar.className = `msg-avatar ${isUser ? 'usr-avatar' : 'ai-avatar'}`;
  avatar.innerHTML = isUser
    ? '<i class="bi bi-person-fill"></i>'
    : '<i class="bi bi-robot"></i>';

  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${isUser ? 'user-bubble' : 'ai-bubble'} ${isError ? 'error-bubble' : ''}`;

  if (isUser) {
    bubble.textContent = content;
  } else {
    bubble.innerHTML = renderMarkdown(content);
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  scrollBottom();
}

// ── Ollama status & model list ────────────────────────────────────────────────
async function checkOllama() {
  try {
    const res  = await fetch('/api/models');
    const data = await res.json();

    if (data.ok && data.models.length > 0) {
      // Connected — populate model dropdown
      ollamaStatus.className = 'badge rounded-pill bg-success ms-1';
      ollamaStatus.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>Ollama Online';

      modelSelect.innerHTML = data.models
        .map(m => `<option value="${m}" ${m === data.current || m.startsWith(data.current) ? 'selected' : ''}>${m}</option>`)
        .join('');
      modelSelect.disabled = false;
    } else if (data.ok && data.models.length === 0) {
      ollamaStatus.className = 'badge rounded-pill bg-warning ms-1';
      ollamaStatus.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>No models';
      modelSelect.innerHTML  = '<option>No models pulled</option>';
      modelSelect.disabled   = true;
      showToast('Ollama running but no models found. Run: ollama pull llama3.2', 'warning');
    } else {
      setOllamaOffline(data.error);
    }
  } catch {
    setOllamaOffline('Cannot reach server.');
  }
}

function setOllamaOffline(msg) {
  ollamaStatus.className = 'badge rounded-pill bg-danger ms-1';
  ollamaStatus.innerHTML = '<i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>Ollama Offline';
  modelSelect.innerHTML  = '<option>Ollama not running</option>';
  modelSelect.disabled   = true;
  showToast(msg || 'Ollama offline. Run: ollama serve', 'danger');
}

// ── API calls ─────────────────────────────────────────────────────────────────
async function apiPost(endpoint, body) {
  // Cancel any previous in-flight request
  if (currentAbort) currentAbort.abort();
  currentAbort = new AbortController();

  const res  = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
    signal:  currentAbort.signal,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function startSession() {
  if (welcomeScreen) welcomeScreen.remove();
  setLoading(true);

  const model = modelSelect.value;

  try {
    const data = await apiPost('/api/start', { model });
    appendMessage('assistant', data.message);
    updateStats(data.stats);
    showToast(`Session started with ${data.stats.model || model}`, 'success');
  } catch (e) {
    appendMessage('assistant',
      `**Could not start session.**\n\n${e.message}\n\n**Quick fix:**\n- Open a terminal\n- Run: \`ollama serve\`\n- Then run: \`ollama pull llama3.2\`\n- Refresh this page`, true);
  } finally {
    setLoading(false);
    userInput.focus();
  }
}

async function sendMessage(text) {
  if (!text.trim()) return;
  appendMessage('user', text);
  userInput.value = '';
  userInput.style.height = 'auto';
  clearInputBtn.classList.add('d-none');
  setLoading(true);
  try {
    const data = await apiPost('/api/chat', { message: text });
    appendMessage('assistant', data.message);
    updateStats(data.stats);
  } catch (e) {
    if (e.name === 'AbortError') {
      // User cancelled — silently ignore
    } else {
      appendMessage('assistant', `**Error:** ${e.message}`, true);
    }
  } finally {
    setLoading(false);
    userInput.focus();
  }
}

async function doAction(action) {
  setLoading(true);
  try {
    const data = await apiPost('/api/action', { action });
    appendMessage('assistant', data.message);
    updateStats(data.stats);
    if (action === 'timed') { resetTimer(); timerModal.show(); }
  } catch (e) {
    if (e.name !== 'AbortError') appendMessage('assistant', `**Error:** ${e.message}`, true);
  } finally {
    setLoading(false);
    userInput.focus();
  }
}

async function reviewCode() {
  const code = getCode().trim();
  if (!code) { showToast('Write some code in the editor first!', 'warning'); return; }

  const lang = languageSelect.value;
  appendMessage('user', `[Code review request — ${lang}]\n${code}`);
  setLoading(true);
  try {
    const data = await apiPost('/api/review', { code, language: lang });
    appendMessage('assistant', data.message);
    updateStats(data.stats);
  } catch (e) {
    if (e.name !== 'AbortError') appendMessage('assistant', `**Error:** ${e.message}`, true);
  } finally {
    setLoading(false);
    userInput.focus();
  }
}

async function resetSession() {
  if (!confirm('Reset your session? All progress will be lost.')) return;
  try {
    await fetch('/api/reset', { method: 'POST' });
    chatMessages.innerHTML = '';
    updateStats({ solvedCount: 0, problemCount: 0, hintCount: 0, difficulty: 'BEGINNER' });
    setCode('');

    // Re-add welcome screen
    const div = document.createElement('div');
    div.id = 'welcomeScreen';
    div.className = 'text-center py-5';
    div.innerHTML = `
      <i class="bi bi-code-slash display-1 text-success"></i>
      <h3 class="mt-3 fw-bold">Ready for another session?</h3>
      <p class="text-secondary">Pick a model above and click Start.</p>
      <button class="btn btn-success btn-lg mt-2" id="startBtn2">
        <i class="bi bi-play-fill me-2"></i>Start Learning
      </button>`;
    chatMessages.appendChild(div);
    document.getElementById('startBtn2').addEventListener('click', startSession);
    showToast('Session reset.');
  } catch {
    showToast('Reset failed.', 'danger');
  }
}

// ── Model change ───────────────────────────────────────────────────────────────
modelSelect.addEventListener('change', async () => {
  const model = modelSelect.value;
  if (!model || model === 'Ollama not running' || model === 'No models pulled') return;
  try {
    await apiPost('/api/model', { model });
    showToast(`Model switched to ${model}`);
  } catch (e) {
    showToast(`Failed to switch model: ${e.message}`, 'danger');
  }
});

// ── Timer ─────────────────────────────────────────────────────────────────────
function resetTimer() {
  clearInterval(timerInterval);
  timerSeconds = 600;
  renderTimer();
}

function renderTimer() {
  const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const s = String(timerSeconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${m}:${s}`;
}

document.getElementById('startTimerBtn').addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds--;
    renderTimer();
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = '00:00';
      showToast("Time's up! Submit your code for review.", 'warning');
    }
  }, 1000);
});

document.getElementById('stopTimerBtn').addEventListener('click', () => {
  clearInterval(timerInterval);
  timerModal.hide();
});

// ── Event listeners ───────────────────────────────────────────────────────────
startBtn.addEventListener('click', startSession);

sendBtn.addEventListener('click', () => sendMessage(userInput.value));

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(userInput.value);
  }
});

userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
  // Show ✕ clear button only when there's text
  clearInputBtn.classList.toggle('d-none', !userInput.value.trim());
});

// ✕ Clear the textarea instantly — always works even while AI is thinking
clearInputBtn.addEventListener('click', () => {
  userInput.value = '';
  userInput.style.height = 'auto';
  clearInputBtn.classList.add('d-none');
  userInput.focus();
});

// Stop / cancel the in-flight Ollama request
stopBtn.addEventListener('click', () => {
  if (currentAbort) {
    currentAbort.abort();
    currentAbort = null;
  }
  setLoading(false);
  showToast('Request cancelled.', 'warning');
});

document.querySelectorAll('.shortcut-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    userInput.value = btn.dataset.text || '';
    userInput.focus();
    userInput.setSelectionRange(userInput.value.length, userInput.value.length);
  });
});

openCodeEditor.addEventListener('click', () => {
  document.getElementById('codePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  codeEditor.focus();
});

// ── CodeMirror — snippets + hints + lint ──────────────────────────────────────

const CM_MODE = {
  javascript: { name: 'javascript', esVersion: 11 },
  python:     'python',
  java:       'text/x-java',
  cpp:        'text/x-c++src',
  c:          'text/x-csrc',
};

const JS_SNIPPETS = [
  { t: 'fn',      label: 'function declaration',   body: 'function name(params) {\n  \n}' },
  { t: 'afn',     label: 'arrow function',          body: 'const name = (params) => {\n  \n};' },
  { t: 'async',   label: 'async function',          body: 'async function name(params) {\n  \n}' },
  { t: 'cls',     label: 'class',                   body: 'class Name {\n  constructor() {\n    \n  }\n}' },
  { t: 'fori',    label: 'for loop (index)',         body: 'for (let i = 0; i < arr.length; i++) {\n  \n}' },
  { t: 'fore',    label: 'for...of',                body: 'for (const item of arr) {\n  \n}' },
  { t: 'forin',   label: 'for...in',                body: 'for (const key in obj) {\n  \n}' },
  { t: 'wh',      label: 'while loop',              body: 'while (condition) {\n  \n}' },
  { t: 'ife',     label: 'if / else',               body: 'if (condition) {\n  \n} else {\n  \n}' },
  { t: 'sw',      label: 'switch / case',           body: 'switch (expr) {\n  case value:\n    break;\n  default:\n    break;\n}' },
  { t: 'tc',      label: 'try / catch',             body: 'try {\n  \n} catch (err) {\n  console.error(err);\n}' },
  { t: 'cl',      label: 'console.log()',           body: 'console.log()' },
  { t: 'ce',      label: 'console.error()',         body: 'console.error()' },
  { t: 'pr',      label: 'new Promise',             body: 'new Promise((resolve, reject) => {\n  \n})' },
  { t: 'map',     label: 'Array.map()',             body: 'arr.map((item) => item)' },
  { t: 'fil',     label: 'Array.filter()',          body: 'arr.filter((item) => condition)' },
  { t: 'red',     label: 'Array.reduce()',          body: 'arr.reduce((acc, item) => acc, initial)' },
  { t: 'find',    label: 'Array.find()',            body: 'arr.find((item) => condition)' },
  { t: 'imp',     label: 'import',                  body: "import { name } from 'module';" },
  { t: 'expd',    label: 'export default',          body: 'export default ' },
  { t: 'obj',     label: 'object literal',          body: 'const obj = {\n  key: value,\n};' },
  { t: 'destruct',label: 'destructuring',           body: 'const { key1, key2 } = obj;' },
  { t: 'spread',  label: 'spread',                  body: 'const copy = { ...original };' },
  { t: 'iife',    label: 'IIFE',                    body: '(function () {\n  \n})();' },
];

function snippetHint(editor) {
  const cur   = editor.getCursor();
  const token = editor.getTokenAt(cur);
  const word  = token.string.toLowerCase();
  const from  = CodeMirror.Pos(cur.line, token.start);
  const to    = CodeMirror.Pos(cur.line, token.end);

  const snippets = word.length > 0
    ? JS_SNIPPETS.filter(s => s.t.startsWith(word))
    : [];

  const snippetItems = snippets.map(s => ({
    text:        s.body,
    displayText: `⚡ ${s.t}  →  ${s.label}`,
    className:   'cm-snippet-item',
    hint(cm) {
      cm.replaceRange(s.body, from, to);
      // Move cursor inside the first block if it has a newline
      if (s.body.includes('\n')) {
        const lines = s.body.split('\n');
        cm.setCursor({ line: cur.line + 1, ch: lines[1].length });
      }
    },
  }));

  let builtins = [];
  try {
    const b = CodeMirror.hint.javascript(editor);
    if (b) builtins = b.list || [];
  } catch (_) {}

  const list = [...snippetItems, ...builtins];
  if (!list.length) return null;
  return { list, from, to };
}

function initCodeMirror() {
  cm = CodeMirror.fromTextArea(codeEditor, {
    mode:             CM_MODE[languageSelect.value] || CM_MODE.javascript,
    theme:            'eclipse',
    lineNumbers:      true,
    autoCloseBrackets:true,
    matchBrackets:    true,
    indentUnit:       2,
    tabSize:          2,
    indentWithTabs:   false,
    lineWrapping:     false,
    lint:             { esversion: 11, undef: false, unused: false },
    gutters:          ['CodeMirror-lint-markers'],
    extraKeys: {
      'Ctrl-Space': 'autocomplete',
      Tab(editor) {
        if (editor.somethingSelected()) editor.indentSelection('add');
        else editor.replaceSelection('  ');
      },
    },
    hintOptions: { hint: snippetHint, completeSingle: false, alignWithWord: true },
  });

  // Auto-suggest only on word characters and dot (not ; ) , { } etc.)
  cm.on('inputRead', (editor, change) => {
    if (cm.state.completionActive) return;
    const ch = change.text[0];
    if (ch && /[\w$.]/.test(ch)) {
      CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });
    }
  });

  // Language switcher → change CM mode + toggle lint
  languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value;
    cm.setOption('mode', CM_MODE[lang] || lang);
    const isJS = lang === 'javascript';
    cm.setOption('lint',    isJS ? { esversion: 11, undef: false, unused: false } : false);
    cm.setOption('gutters', isJS ? ['CodeMirror-lint-markers'] : []);
  });
}

reviewCodeBtn.addEventListener('click', reviewCode);

clearCodeBtn.addEventListener('click', () => {
  if (getCode().trim() && confirm('Clear the code editor?')) {
    setCode('');
    showToast('Editor cleared.');
  }
});

solutionBtn.addEventListener('click', () => {
  if (confirm('Show the full solution? Try harder first — you\'ve got this!')) {
    doAction('solution');
  }
});

resetBtn.addEventListener('click', resetSession);

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => doAction(btn.dataset.action));
});

// ── Run Code ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function runCode() {
  const code = getCode().trim();
  if (!code) { showToast('Write some code first!', 'warning'); return; }

  outputPanel.classList.remove('d-none');
  outputContent.innerHTML = '<span class="output-running"><span class="dot"></span><span class="dot"></span><span class="dot"></span> Running…</span>';
  runTime.textContent = '';
  runBtn.disabled = true;

  const t0 = Date.now();
  try {
    const res  = await fetch('/api/run', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, language: languageSelect.value }),
    });
    const data = await res.json();
    const ms   = Date.now() - t0;
    runTime.textContent = `${ms}ms`;

    let html = '';
    if (data.output) {
      html += data.output.split('\n').map(line =>
        `<div class="output-line">${escapeHtml(line)}</div>`
      ).join('');
    }
    if (data.error) {
      html += data.error.split('\n').map(line =>
        `<div class="output-error">${escapeHtml(line)}</div>`
      ).join('');
    }
    if (!html) {
      html = '<span class="output-empty">No output</span>';
    }
    outputContent.innerHTML = html;
  } catch (e) {
    outputContent.innerHTML = `<div class="output-error">${escapeHtml(e.message)}</div>`;
  } finally {
    runBtn.disabled = false;
  }
}

runBtn.addEventListener('click', runCode);
clearOutputBtn.addEventListener('click', () => {
  outputPanel.classList.add('d-none');
  outputContent.innerHTML = '';
  runTime.textContent = '';
});

// ── Save & Browse Solutions ───────────────────────────────────────────────────

function openSaveModal() {
  const code = getCode().trim();
  if (!code) { showToast('Write some code in the editor first!', 'warning'); return; }

  const lang = languageSelect.value;
  const ts   = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  document.getElementById('solutionFilename').value  = `solution_${ts}`;
  document.getElementById('solutionLangDisplay').value = lang;
  updateFilenamePreview();
  saveSolutionModal.show();
}

function updateFilenamePreview() {
  const raw     = document.getElementById('solutionFilename').value.trim();
  const safe    = raw.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_{2,}/g, '_').replace(/^_|_$/g, '') || 'solution';
  document.getElementById('solutionFilenamePreview').textContent = `${safe}.js`;
}

async function confirmSaveSolution() {
  const raw      = document.getElementById('solutionFilename').value.trim();
  const language = languageSelect.value;
  const code     = getCode().trim();

  try {
    const res  = await fetch('/api/save-solution', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ filename: raw, code, language }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Save failed');
    saveSolutionModal.hide();
    showToast(`Saved as ${data.filename}`, 'success');
  } catch (e) {
    showToast(`Save failed: ${e.message}`, 'danger');
  }
}

async function openSolutionsModal() {
  solutionsModal.show();
  const body = document.getElementById('solutionsListBody');
  body.innerHTML = '<p class="text-secondary text-center py-3">Loading...</p>';

  try {
    const res   = await fetch('/api/solutions');
    const data  = await res.json();

    if (!data.files || data.files.length === 0) {
      body.innerHTML = '<p class="text-secondary text-center py-4"><i class="bi bi-folder2 me-2"></i>No saved solutions yet.</p>';
      return;
    }

    body.innerHTML = `
      <div class="table-responsive">
        <table class="table table-dark table-hover table-sm mb-0">
          <thead><tr>
            <th>Filename</th>
            <th>Saved</th>
            <th>Size</th>
            <th class="text-end">Actions</th>
          </tr></thead>
          <tbody>
            ${data.files.map(f => `
              <tr>
                <td class="text-success font-monospace">${f.name}</td>
                <td class="text-secondary small">${new Date(f.modified).toLocaleString()}</td>
                <td class="text-secondary small">${(f.size / 1024).toFixed(1)} KB</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-success me-1 load-sol-btn" data-name="${f.name}" title="Load into editor">
                    <i class="bi bi-upload"></i> Load
                  </button>
                  <button class="btn btn-sm btn-outline-danger del-sol-btn" data-name="${f.name}" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    body.querySelectorAll('.load-sol-btn').forEach(btn => {
      btn.addEventListener('click', () => loadSolutionIntoEditor(btn.dataset.name));
    });
    body.querySelectorAll('.del-sol-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteSolution(btn.dataset.name));
    });
  } catch (e) {
    body.innerHTML = `<p class="text-danger text-center py-3">Failed to load: ${e.message}</p>`;
  }
}

async function loadSolutionIntoEditor(filename) {
  try {
    const res  = await fetch(`/api/solutions/${encodeURIComponent(filename)}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setCode(data.content);
    solutionsModal.hide();
    document.getElementById('codePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (cm) cm.focus(); else codeEditor.focus();
    showToast(`Loaded: ${filename}`, 'success');
  } catch (e) {
    showToast(`Load failed: ${e.message}`, 'danger');
  }
}

async function deleteSolution(filename) {
  if (!confirm(`Delete ${filename}? This cannot be undone.`)) return;
  try {
    const res = await fetch(`/api/solutions/${encodeURIComponent(filename)}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showToast(`Deleted ${filename}`, 'success');
    openSolutionsModal(); // refresh list
  } catch (e) {
    showToast(`Delete failed: ${e.message}`, 'danger');
  }
}

saveSolutionBtn.addEventListener('click', openSaveModal);
mySolutionsBtn.addEventListener('click', openSolutionsModal);
document.getElementById('confirmSaveBtn').addEventListener('click', confirmSaveSolution);
document.getElementById('solutionFilename').addEventListener('input', updateFilenamePreview);


// ── Init: check Ollama on page load ───────────────────────────────────────────
(async () => {
  initCodeMirror();
  initResize();
  modelSelect.disabled = true;
  await checkOllama();

  try {
    const res   = await fetch('/api/stats');
    const stats = await res.json();
    updateStats(stats);
  } catch { /* ignore */ }
})();
