// ─── PAGE NAVIGATION ───
function goToWall() {
  document.getElementById('page-dashboard').classList.remove('active');
  document.getElementById('page-wall').classList.add('active');
  document.getElementById('wall-input').focus();
  startOnlineCounter();
}

function goToDashboard() {
  document.getElementById('page-wall').classList.remove('active');
  document.getElementById('page-dashboard').classList.add('active');
}

// ─── ONLINE COUNTER SIMULATION ───
let onlineInterval = null;

function startOnlineCounter() {
  if (onlineInterval) return;
  onlineInterval = setInterval(() => {
    const el = document.getElementById('online-num');
    if (!el) return;
    let n = parseInt(el.textContent.replace(/,/g, ''));
    n += Math.floor(Math.random() * 5) - 2;
    n = Math.max(800, Math.min(1200, n));
    el.textContent = n.toLocaleString();
  }, 3000);
}

// ─── DOM REFERENCES ───
const input      = document.getElementById('wall-input');
const charCount  = document.getElementById('char-count');
const messagesDiv = document.getElementById('messages');
const wrap       = document.getElementById('messages-wrap');

// ─── SEED DATA ───
const seedMessages = [
  { text: "is anyone actually real here?",              side: "left"  },
  { text: "just needed somewhere to say — today was hard 😮‍💨", side: "right" },
  { text: "this wall feels like a dream",               side: "left"  },
  { text: "stranger, keep going ✦",                    side: "right" },
];

// ─── STRANGER REPLIES ───
const replies = [
  "i hear you, stranger 🌒",
  "same honestly",
  "the wall remembers",
  "keep going ✦",
  "who are you?",
  "this is oddly comforting",
  "you're not alone here",
  "📡 received",
  "felt that",
  "the wall listens 🧱",
  "you okay?",
  "same time, different world",
  "i see you stranger",
  "we're all just echoes here",
];

// ─── SEED WALL ON FIRST LOAD ───
function seedWall() {
  // don't seed if messages already exist
  if (messagesDiv.querySelector('.msg')) return;

  const es = document.getElementById('empty-state');
  if (es) es.remove();

  seedMessages.forEach((m, i) => {
    setTimeout(() => {
      addBubble(m.text, m.side, timeAgo(seedMessages.length - i));
    }, i * 140);
  });
}

// ─── TIME LABEL HELPER ───
function timeAgo(mins) {
  if (mins === 0) return 'now';
  return mins + 'm ago';
}

// ─── ADD MESSAGE BUBBLE ───
function addBubble(text, side, timeLabel = 'now') {
  // remove empty state if present
  const es = document.getElementById('empty-state');
  if (es) es.remove();

  const div = document.createElement('div');
  div.className = `msg ${side}`;

  // sanitize text
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  div.innerHTML = `${escaped}<small>${timeLabel}</small>`;
  messagesDiv.appendChild(div);

  // scroll to bottom smoothly
  setTimeout(() => {
    wrap.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' });
  }, 30);
}

// ─── SEND MESSAGE ───
function sendMessage() {
  const val = input.value.trim();
  if (!val) {
    input.focus();
    return;
  }

  // random side — the "stranger" effect
  const side = Math.random() > 0.5 ? 'right' : 'left';
  addBubble(val, side);

  // reset input
  input.value = '';
  charCount.textContent = '280';
  charCount.classList.remove('warn');
  input.focus();

  // simulate a stranger reply ~60% of the time
  if (Math.random() > 0.4) {
    const delay = 1800 + Math.random() * 1500;

    setTimeout(() => {
      // show typing indicator
      const typing = document.createElement('div');
      typing.className = 'sys-msg';
      typing.id = 'typing-indicator';
      typing.textContent = '— a stranger is typing —';
      messagesDiv.appendChild(typing);
      wrap.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' });

      // show reply after short pause
      setTimeout(() => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();

        const reply = replies[Math.floor(Math.random() * replies.length)];
        const replySide = side === 'right' ? 'left' : 'right';
        addBubble(reply, replySide);
      }, 1200);

    }, delay);
  }
}

// ─── CLEAR WALL ───
function clearMessages() {
  messagesDiv.innerHTML = '';

  const es = document.createElement('div');
  es.id = 'empty-state';
  es.className = 'empty-state';
  es.innerHTML = `
    <div class="big">🧱</div>
    <h3>The wall is quiet.</h3>
    <p>Be the first stranger to write something.</p>
  `;
  messagesDiv.appendChild(es);
}

// ─── CHARACTER COUNTER ───
input.addEventListener('input', () => {
  const remaining = 280 - input.value.length;
  charCount.textContent = remaining;
  charCount.classList.toggle('warn', remaining < 30);
});

// ─── ENTER KEY TO SEND ───
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ─── WATCH FOR WALL PAGE BECOMING ACTIVE ───
// seeds messages the first time the wall page is shown
const wallPage = document.getElementById('page-wall');

const observer = new MutationObserver(() => {
  if (wallPage.classList.contains('active')) {
    seedWall();
  }
});

observer.observe(wallPage, {
  attributes: true,
  attributeFilter: ['class'],
});
