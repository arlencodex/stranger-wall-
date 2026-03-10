// ══════════════════════════
// DATA
// ══════════════════════════

const STRANGER_POOL = [
  { name:'ghost_77',  color:'#d47a6a', flag:'🇰🇷', emoji:'👤' },
  { name:'echo_42',   color:'#6ab0d4', flag:'🇺🇸', emoji:'🌊' },
  { name:'void_x',    color:'#9b6ad4', flag:'🇯🇵', emoji:'🌀' },
  { name:'neon_55',   color:'#d46aa8', flag:'🇬🇧', emoji:'💡' },
  { name:'drift_7',   color:'#6ad4b8', flag:'🇩🇪', emoji:'🌿' },
  { name:'pixel_0',   color:'#d4d46a', flag:'🇧🇷', emoji:'🔲' },
  { name:'wave_13',   color:'#6bcf7f', flag:'🇦🇺', emoji:'🌊' },
  { name:'anon_99',   color:'#d4a96a', flag:'🇮🇳', emoji:'🎭' },
  { name:'static_4',  color:'#a06ab4', flag:'🇫🇷', emoji:'📡' },
  { name:'blur_21',   color:'#6ab4d4', flag:'🇸🇬', emoji:'🌫' },
  { name:'spark_66',  color:'#d4c46a', flag:'🇨🇦', emoji:'⚡' },
  { name:'nova_3',    color:'#e87d6e', flag:'🇲🇽', emoji:'🌟' },
];

const STRANGER_REPLIES = [
  ["hey there 👋", "what's up?", "so... who are you?"],
  ["i've been on here for like an hour lol", "no one interesting until now maybe"],
  ["where are you from?", "i'm trying to guess your timezone 😅"],
  ["do you ever feel like you know someone you've never met?", "weird thought i know"],
  ["honestly this is better than talking to people i know 😭"],
  ["so what brings you here?", "boredom? curiosity?"],
  ["i like that nobody knows who i am here", "it's freeing honestly"],
  ["ok real question", "cats or dogs? 🐱🐶"],
  ["i was literally about to skip you", "glad i didn't"],
  ["what are you doing at this hour lol"],
  ["you seem different", "most people just say hi and disappear"],
  ["this is oddly calming", "the anonymity thing"],
  ["do you think we'd be friends irl?"],
  ["i've had 3 coffees today and i feel nothing 😂"],
  ["tell me something true", "something you wouldn't tell someone you know"],
  ["what song are you listening to rn?"],
  ["i keep coming back here", "not sure why tbh"],
  ["do you think strangers can understand you better than friends?"],
];

const STRANGER_GREETINGS = [
  "hey 👋",
  "hi there",
  "hello stranger",
  "yo",
  "hey, what's up?",
  "oh hey",
  "hi! finally someone",
  "hey stranger 👀",
];

const STRANGER_UNPROMPTED = [
  "you still there?",
  "so tell me something interesting",
  "i wonder how many people are on here rn",
  "do you do this often?",
  "what's your vibe today",
  "i like the anonymity tbh",
  "this is weirdly nice",
  "are you usually this quiet? 😄",
  "say something, anything",
  "ok your turn",
];

const RANDOM_NAMES = [
  'ghost_77','echo_42','void_x','anon_99',
  'wave_13','pixel_0','drift_7','neon_55',
  'blur_21','spark_66','static_4','nova_3',
];


// ══════════════════════════
// STATE
// ══════════════════════════

let myName            = '';
let myColor           = '#d4a96a';
let chatCount         = 0;
let currentStranger   = null;
let lastStrangerName  = null;
let replySetIdx       = 0;
let timerInterval     = null;
let sessionSecs       = 0;
let replyTimeout      = null;
let unpromptedTimeout = null;
let disconnectTimeout = null;
let searchTimeout     = null;
let isConnected       = false;


// ══════════════════════════
// DOM REFERENCES
// ══════════════════════════

const messagesEl    = document.getElementById('messages');
const messagesWrap  = document.getElementById('messages-wrap');
const chatInput     = document.getElementById('chat-input');
const sendBtn       = document.getElementById('send-btn');
const skipBtn       = document.getElementById('skip-btn');
const skipOverlay   = document.getElementById('skip-overlay');
const sAvatar       = document.getElementById('s-avatar');
const sName         = document.getElementById('s-name');
const sessionTimer  = document.getElementById('session-timer');
const waitingCount  = document.getElementById('waiting-count');
const chatNumEl     = document.getElementById('chat-num');
const searchingEl   = document.getElementById('searching-state');
const startStateEl  = document.getElementById('start-state');
const searchTextEl  = document.getElementById('search-text');
const myNameInput   = document.getElementById('my-name');


// ══════════════════════════
// SCREENS
// ══════════════════════════

function showScreen(id) {
  document.querySelectorAll('.screen')
          .forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function goHome() {
  window.location.href = "index.html";
}


// ══════════════════════════
// INTEREST CHIPS
// ══════════════════════════

function toggleChip(el) {
  el.classList.toggle('on');
}


// ══════════════════════════
// SEARCH / MATCH
// ══════════════════════════

function startSearch() {
  // read name from input if on waiting screen
  const nameVal = myNameInput ? myNameInput.value.trim() : '';
  myName = nameVal || RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];

  // switch to searching UI
  showScreen('screen-waiting');
  startStateEl.style.display = 'none';
  searchingEl.classList.add('active');
  searchTextEl.textContent = 'Looking for a stranger…';

  // fluctuate waiting count
  startWaitingFluctuation();

  // simulate match delay: 1.5 – 3.5 seconds
  const delay = 1500 + Math.random() * 2000;
  searchTimeout = setTimeout(connectToStranger, delay);
}

function cancelSearch() {
  clearTimeout(searchTimeout);
  startStateEl.style.display = '';
  searchingEl.classList.remove('active');
}


// ══════════════════════════
// CONNECT TO STRANGER
// ══════════════════════════

function connectToStranger() {
  chatCount++;
  chatNumEl.textContent = chatCount;
  isConnected = true;

  // pick a random stranger — avoid repeating the last one
  let pool = lastStrangerName
    ? STRANGER_POOL.filter(s => s.name !== lastStrangerName)
    : STRANGER_POOL;

  currentStranger = pool[Math.floor(Math.random() * pool.length)];
  lastStrangerName = currentStranger.name;
  replySetIdx = Math.floor(Math.random() * STRANGER_REPLIES.length); // random start

  // update chat bar UI
  sAvatar.textContent = currentStranger.emoji;
  sAvatar.style.background = currentStranger.color;
  sName.textContent = currentStranger.name;

  // clear previous messages
  messagesEl.innerHTML = '';

  // hide skip overlay
  skipOverlay.classList.remove('show');

  // enable input
  setInputEnabled(true);

  // start session timer
  startTimer();

  // show chat screen
  showScreen('screen-chat');

  // connected system message
  addSys(
    `✦ You're now chatting with ${currentStranger.name} ${currentStranger.flag} ✦`,
    'connected'
  );

  // stranger sends greeting after short delay
  setTimeout(() => {
    showTyping();
    const greet = STRANGER_GREETINGS[
      Math.floor(Math.random() * STRANGER_GREETINGS.length)
    ];
    setTimeout(() => {
      removeTyping();
      addStrangerBubble(greet);
      scheduleUnprompted();   // start the idle reply loop
    }, 900 + Math.random() * 600);
  }, 600);

  // schedule a random disconnect (stranger leaves on their own)
  scheduleRandomDisconnect();
}


// ══════════════════════════
// SKIP
// ══════════════════════════

function skipStranger() {
  if (!isConnected) return;

  clearAllTimers();
  removeTyping();
  isConnected = false;

  // system message + disable input
  addSys('You skipped. Finding next stranger…', 'skipped');
  setInputEnabled(false);

  // show blur overlay
  skipOverlay.classList.add('show');

  // connect to next stranger after 1.5 – 2.5 seconds
  const delay = 1500 + Math.random() * 1000;
  searchTimeout = setTimeout(connectToStranger, delay);
}


// ══════════════════════════
// SEND MESSAGE
// ══════════════════════════

function sendMsg() {
  const text = chatInput.value.trim();
  if (!text || !isConnected) return;

  addMyBubble(text);
  chatInput.value = '';
  chatInput.focus();

  // trigger a stranger reply to what you said
  triggerReply();
}


// ══════════════════════════
// STRANGER REPLY LOGIC
// ══════════════════════════

// called when YOU send a message — stranger replies to it
function triggerReply() {
  clearTimeout(replyTimeout);
  clearTimeout(unpromptedTimeout);

  const thinkDelay = 1200 + Math.random() * 1800;

  replyTimeout = setTimeout(() => {
    if (!isConnected || !currentStranger) return;

    showTyping();

    const typeDelay = 800 + Math.random() * 700;

    setTimeout(() => {
      if (!isConnected || !currentStranger) return;
      removeTyping();

      // get next reply set
      const set = STRANGER_REPLIES[replySetIdx % STRANGER_REPLIES.length];
      replySetIdx++;

      // send each message in the set with a short gap
      set.forEach((msg, i) => {
        setTimeout(() => {
          if (!isConnected || !currentStranger) return;
          addStrangerBubble(msg);
        }, i * 750);
      });

      // after replying, schedule next unprompted message
      const resumeDelay = set.length * 750 + 500;
      setTimeout(scheduleUnprompted, resumeDelay);

    }, typeDelay);
  }, thinkDelay);
}

// stranger says something on their own if you go quiet
function scheduleUnprompted() {
  clearTimeout(unpromptedTimeout);
  if (!isConnected) return;

  const delay = 7000 + Math.random() * 10000; // 7–17 seconds of silence

  unpromptedTimeout = setTimeout(() => {
    if (!isConnected || !currentStranger) return;

    showTyping();

    setTimeout(() => {
      if (!isConnected || !currentStranger) return;
      removeTyping();

      const msg = STRANGER_UNPROMPTED[
        Math.floor(Math.random() * STRANGER_UNPROMPTED.length)
      ];
      addStrangerBubble(msg);

      // schedule another one
      scheduleUnprompted();
    }, 900 + Math.random() * 500);

  }, delay);
}

// stranger randomly disconnects after 40–120 seconds
function scheduleRandomDisconnect() {
  const delay = 40000 + Math.random() * 80000;
  disconnectTimeout = setTimeout(() => {
    if (!isConnected || !currentStranger) return;
    strangerLeft();
  }, delay);
}

function strangerLeft() {
  clearAllTimers();
  removeTyping();
  isConnected = false;

  const name = currentStranger ? currentStranger.name : 'Stranger';
  addSys(`${name} has disconnected.`, 'skipped');
  currentStranger = null;

  setInputEnabled(false);

  // go to disconnected screen after short pause
  setTimeout(() => showScreen('screen-disc'), 1200);
}


// ══════════════════════════
// DOM BUBBLE HELPERS
// ══════════════════════════

function addMyBubble(text) {
  const initial = myName.charAt(0).toUpperCase();

  const row = document.createElement('div');
  row.className = 'msg-row own';
  row.innerHTML = `
    <div class="bubble bubble-own">
      ${escHtml(text)}
      <small>${getTime()}</small>
    </div>
    <div class="msg-avatar" style="background:${myColor}">${initial}</div>
  `;
  messagesEl.appendChild(row);
  autoScroll();
}

function addStrangerBubble(text) {
  if (!currentStranger) return;

  const row = document.createElement('div');
  row.className = 'msg-row';
  row.innerHTML = `
    <div class="msg-avatar" style="background:${currentStranger.color}">
      ${currentStranger.emoji}
    </div>
    <div class="bubble bubble-stranger">
      ${escHtml(text)}
      <small>${getTime()}</small>
    </div>
  `;
  messagesEl.appendChild(row);
  autoScroll();
}

function addSys(text, type = '') {
  const div = document.createElement('div');
  div.className = 'sys' + (type ? ' ' + type : '');
  div.textContent = text;
  messagesEl.appendChild(div);
  autoScroll();
}

function showTyping() {
  removeTyping(); // prevent duplicates
  if (!currentStranger) return;

  const row = document.createElement('div');
  row.className = 'typing-row';
  row.id = 'typing-row';
  row.innerHTML = `
    <div class="msg-avatar" style="background:${currentStranger.color}">
      ${currentStranger.emoji}
    </div>
    <div class="typing-bubble">
      <div class="td"></div>
      <div class="td"></div>
      <div class="td"></div>
    </div>
  `;
  messagesEl.appendChild(row);
  autoScroll();
}

function removeTyping() {
  const t = document.getElementById('typing-row');
  if (t) t.remove();
}


// ══════════════════════════
// SESSION TIMER
// ══════════════════════════

function startTimer() {
  sessionSecs = 0;
  updateTimer();
  timerInterval = setInterval(() => {
    sessionSecs++;
    updateTimer();
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(sessionSecs / 60);
  const s = (sessionSecs % 60).toString().padStart(2, '0');
  sessionTimer.textContent = `${m}:${s}`;
}


// ══════════════════════════
// WAITING COUNT FLUCTUATION
// ══════════════════════════

let waitingInterval = null;

function startWaitingFluctuation() {
  if (waitingInterval) return; // only start once
  waitingInterval = setInterval(() => {
    let n = parseInt(waitingCount.textContent.replace(/,/g, ''));
    n += Math.floor(Math.random() * 7) - 3;
    n = Math.max(1800, Math.min(4200, n));
    waitingCount.textContent = n.toLocaleString();
  }, 4000);
}


// ══════════════════════════
// INPUT HELPERS
// ══════════════════════════

function setInputEnabled(enabled) {
  chatInput.disabled  = !enabled;
  sendBtn.disabled    = !enabled;
  chatInput.placeholder = enabled
    ? 'Say something…'
    : 'Connecting…';
}

function autoScroll() {
  setTimeout(() => {
    messagesWrap.scrollTo({ top: messagesWrap.scrollHeight, behavior: 'smooth' });
  }, 30);
}


// ══════════════════════════
// CLEAR ALL TIMERS
// ══════════════════════════

function clearAllTimers() {
  clearInterval(timerInterval);
  clearTimeout(replyTimeout);
  clearTimeout(unpromptedTimeout);
  clearTimeout(disconnectTimeout);
  clearTimeout(searchTimeout);
  timerInterval     = null;
  replyTimeout      = null;
  unpromptedTimeout = null;
  disconnectTimeout = null;
  searchTimeout     = null;
}


// ══════════════════════════
// UTILITY HELPERS
// ══════════════════════════

function getTime() {
  const d = new Date();
  return d.getHours().toString().padStart(2, '0')
       + ':'
       + d.getMinutes().toString().padStart(2, '0');
}

function escHtml(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}


// ══════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════

document.addEventListener('keydown', e => {
  // Esc = skip current stranger
  if (e.key === 'Escape') {
    const chatActive = document
      .getElementById('screen-chat')
      .classList.contains('active');
    if (chatActive && isConnected) skipStranger();
  }
});

// Enter to send in chat
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
});

// Enter to start on waiting screen
myNameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') startSearch();
});
