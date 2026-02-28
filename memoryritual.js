/* ═══════════════════════════════════════════════════════
   memoryRitual.js — 10 PM Memory Ritual Add-On
   ScrapDig / Memory Digger
   -------------------------------------------------------
   HOW IT WORKS:
   1. Checks if user is signed in (uses existing isSignedIn)
   2. Calculates day number from personal start date
   3. Shows countdown OR today's card depending on time
   4. Supports 3 activity types: Selfie, Text Card, Drawing
   5. All images exported locally — nothing uploaded
   6. Progress tracked in localStorage only
   ═══════════════════════════════════════════════════════ */

'use strict';

// ── CONFIG (change RITUAL_TEST_DAY to 1-30 to force a day during testing) ──
const RITUAL_TEST_DAY   = null;   // e.g. set to 5 to test Day 5. null = live mode
const RITUAL_WATERMARK  = 'ScrapDig • 10 PM Memory Ritual';
const RITUAL_HOUR_START = 22;     // 10 PM
const RITUAL_HOUR_END   = 23;     // unlock lasts till 11 PM (relaxed window)

// ── 30-DAY CALENDAR ──────────────────────────────────────────────────────────
// Each entry: { title, week, voiceText, prompt, activityType }
// activityType: 'selfie' | 'textcard' | 'drawing'
const memoryCalendar = {

  /* ═══ WEEK 1 — Childhood ═══ */
  1: {
    title: 'Prime Time Face 😊',
    week: 'Week 1 — Childhood',
    voiceText: 'Meeru ippatiki childhood innocent face lo unnara? Oka selfie teesukoni chudandi — aa small kid abhi kuda eyes lo kanipisthadu.',
    prompt: 'Today\'s you has yesterday\'s child inside. Take a selfie & feel it. 📸',
    activityType: 'selfie',
    overlayText: 'Still that kid inside 💛',
    cardBg: 'linear-gradient(135deg,#1a0a2e,#2d1254)'
  },
  2: {
    title: 'Food You Miss 🍱',
    week: 'Week 1 — Childhood',
    voiceText: 'Amma cheti vanta... aa smell, aa taste... edi ekkuva miss avutunnaru? Write it out tonight.',
    prompt: 'Type the one food / dish you deeply miss from childhood. Describe the smell, the taste, who made it.',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#2a1205,#6b3d1e)'
  },
  3: {
    title: 'Childhood Nickname 🏷️',
    week: 'Week 1 — Childhood',
    voiceText: 'Mee nickname enti? Family pettina name, friends pettina name... aa name lo oka chinna story untundi.',
    prompt: 'Write your childhood nickname & who gave it to you. What did it feel like when someone called you by it?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#1a3a1a,#2a6030)'
  },
  4: {
    title: 'Cartoon Era 📺',
    week: 'Week 1 — Childhood',
    voiceText: '6 PM Cartoon Network... aa bell sound vintene mana heart happy aipoyedi. Mee favorite cartoon edi? Draw cheyyandi.',
    prompt: 'Draw your favorite cartoon character or that iconic TV moment. Stick figures are totally fine! 🎨',
    activityType: 'drawing',
    cardBg: 'linear-gradient(135deg,#c83200,#dd0000)'
  },
  5: {
    title: 'Lost Toy 🧸',
    week: 'Week 1 — Childhood',
    voiceText: 'Oka chinna toy undedi — adi poyindi. Kaani aa memory poyaledu. Aadi gurinchi raayandi.',
    prompt: 'Write about a toy, book or object from childhood that\'s gone now. What made it so special?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#2a1a38,#4a2060)'
  },
  6: {
    title: 'Draw Your Old House 🏠',
    week: 'Week 1 — Childhood',
    voiceText: 'Meeru penchina illu... aa gate, aa terrace, aa kitchen smell... draw chesthu remember cheyyandi.',
    prompt: 'Draw the floor plan or outside view of the house you grew up in. Label the rooms you loved most. 🖍️',
    activityType: 'drawing',
    cardBg: 'linear-gradient(135deg,#1e3a5a,#2980b9)'
  },
  7: {
    title: 'First Hostel Cry 🌙',
    week: 'Week 1 — Childhood',
    voiceText: 'Amma lekapothe... first night darkness lo... real ga edichinattu anipinchindi. Write that night tonight.',
    prompt: 'Write about the first time you truly felt alone — whether it was hostel, exam, or any big change.',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#0a0a1e,#1a1a40)'
  },

  /* ═══ WEEK 2 — School Era ═══ */
  8: {
    title: 'First Crush Initials 💕',
    week: 'Week 2 — School Era',
    voiceText: 'Aa peru... notebook lo rasina aa initials... heart beat fast ayedi. Write it — it\'s safe here.',
    prompt: 'Write about that first crush feeling — no names needed, just the emotion. What made your heart race?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#3a0a2a,#8e1c6a)'
  },
  9: {
    title: 'Front or Back Bencher? 🎓',
    week: 'Week 2 — School Era',
    voiceText: 'Front bench — topper feel. Back bench — freedom feel. Meeru ekkada kurchunevalaru? Draw mee classroom!',
    prompt: 'Draw your classroom from above — where you sat, your best friend\'s seat, the teacher\'s desk. 🖍️',
    activityType: 'drawing',
    cardBg: 'linear-gradient(135deg,#1a2a3a,#2e4060)'
  },
  10: {
    title: 'Exam Stress Face 😰',
    week: 'Week 2 — School Era',
    voiceText: 'Night 11 PM... books open... nidra vasthundi... formula remember kaadu... aa face — take a selfie.',
    prompt: 'Make your best "studying at 11 PM the night before exam" face and capture it! 😅📸',
    activityType: 'selfie',
    overlayText: 'Night before exam survivor 📚',
    cardBg: 'linear-gradient(135deg,#2a1a0a,#5a3010)'
  },
  11: {
    title: 'Best Friend Tribute 💛',
    week: 'Week 2 — School Era',
    voiceText: 'Oka friend undadhey mana childhood ki full meaning ichindi. Aa person ki oka letter raayyandi tonight.',
    prompt: 'Write a short letter to your childhood best friend. Say what you never got to say properly.',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#1a3a10,#27ae60)'
  },
  12: {
    title: 'Uniform Memory 👔',
    week: 'Week 2 — School Era',
    voiceText: 'School uniform vesukoni ready avvadam... adi oka identity laga feel ayyedi. Draw your uniform tonight.',
    prompt: 'Draw your school uniform — the colors, badge, tie. Add any funny memory about it! 🎨',
    activityType: 'drawing',
    cardBg: 'linear-gradient(135deg,#1a2050,#2a3080)'
  },
  13: {
    title: 'Secret Diary Entry 📖',
    week: 'Week 2 — School Era',
    voiceText: 'Oka diary lo rasukune vaallam... chinna secrets, chinna dreams. Tonight — write like that kid again.',
    prompt: 'Write a diary entry AS your 12-year-old self. What was worrying you? What were you excited about?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#1a0a04,#3d1f0a)'
  },
  14: {
    title: 'Festival You Miss 🪔',
    week: 'Week 2 — School Era',
    voiceText: 'Diwali, Holi, Eid, Christmas... oka festival untundi — adhi ippudu same ga feel avvadam ledu. Draw that memory.',
    prompt: 'Draw the festival scene you miss most — the lights, the people, the feeling of that night. 🎇',
    activityType: 'drawing',
    cardBg: 'linear-gradient(135deg,#1a0500,#4a1500)'
  },

  /* ═══ WEEK 3 — Hostel Emotional ═══ */
  15: {
    title: 'First Hostel Night Selfie 🏠',
    week: 'Week 3 — Hostel Feelings',
    voiceText: 'Aa roju night lo mee face eppudu aa expression lo unte... take that expression tonight. The brave lost look.',
    prompt: 'Recreate that "first night away from home" face. The brave one hiding sadness. Capture it tonight. 📸',
    activityType: 'selfie',
    overlayText: 'Brave. Always was. 🌙',
    cardBg: 'linear-gradient(135deg,#0a0a1e,#1e1e3a)'
  },
  16: {
    title: '"I Said I\'m Fine" Card 🤍',
    week: 'Week 3 — Hostel Feelings',
    voiceText: '"Fine" antam... kaani fine kaadu ani telusu. Aa roju lo exactly em jarigindi — write it tonight.',
    prompt: 'Write about a time you said "I\'m fine" but really weren\'t. What was actually happening inside?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#1a1a2e,#2a2a4a)'
  },
  17: {
    title: 'Roommate Fight Story 😤',
    week: 'Week 3 — Hostel Feelings',
    voiceText: 'Roommate tho fight... silly reason... kaani adi oka bonding part. Aa funny/painful story raayandi.',
    prompt: 'Write about your most memorable roommate fight or misunderstanding. How did it resolve?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#2a0a0a,#5a1a1a)'
  },
  18: {
    title: 'Mess Food Reality 🍛',
    week: 'Week 3 — Hostel Feelings',
    voiceText: 'Mess food... sometimes okay... sometimes impossible. Draw what the tray looked like on a bad day!',
    prompt: 'Draw the hostel mess food tray on its worst day — label each compartment with what it actually was! 😂',
    activityType: 'drawing',
    cardBg: 'linear-gradient(135deg,#2a1a08,#5a3010)'
  },
  19: {
    title: 'Safe Friend Name ⭐',
    week: 'Week 3 — Hostel Feelings',
    voiceText: 'Oka person undadhey — mana worst days lo kuda safe ga feel ayye vaallam. Vaallaki oka tribute raayandi.',
    prompt: 'Write about your "safe person" — the one you called when things got hard. What made them special?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#0a2a1a,#1a5a38)'
  },
  20: {
    title: 'Strength Card 💪',
    week: 'Week 3 — Hostel Feelings',
    voiceText: 'Meeru thought chesina kaadu survive cheyagalanu ani... kaani chesaru. Take a strong selfie tonight.',
    prompt: 'Take a strong, confident selfie. YOU survived every hard moment till now. Own that. 💪📸',
    activityType: 'selfie',
    overlayText: 'Survived every hard night 💪',
    cardBg: 'linear-gradient(135deg,#1a0a2e,#3a1060)'
  },
  21: {
    title: 'Strongest Night 🌙',
    week: 'Week 3 — Hostel Feelings',
    voiceText: 'Aa oka night gurthu undaa — meeru almost break ayyaru... kaani kaaladhu. Adhi raayandi tonight.',
    prompt: 'Describe your hardest night — the one where you almost gave up but didn\'t. What kept you going?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#030310,#0a0a28)'
  },

  /* ═══ WEEK 4 — Present Self ═══ */
  22: {
    title: 'What Changed ✨',
    week: 'Week 4 — Present You',
    voiceText: 'Childhood meeru vs ippatiki meeru — chala marindi. Aa changes draw cheyyandi... good and hard ones both.',
    prompt: 'Draw a "then vs now" comparison. What changed about you? What stayed the same? 🎨',
    activityType: 'drawing',
    cardBg: 'linear-gradient(135deg,#1a1a1a,#2a2a40)'
  },
  23: {
    title: 'What You\'re Tired Of 😮‍💨',
    week: 'Week 4 — Present You',
    voiceText: 'Honestly... ippatiki em tho most tired ga unnaru? No filter. Just write it. It\'s 10 PM and it\'s safe.',
    prompt: 'Write honestly about what exhausts you most right now. No judgement. Just get it out on paper.',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#1a1010,#3a1818)'
  },
  24: {
    title: 'What You\'re Proud Of 🏆',
    week: 'Week 4 — Present You',
    voiceText: 'Meeru evvarikii cheyyaledhu ani anukunnaru... kaani chesaru. Aa achievement gurinchi raayandi. Proud ga.',
    prompt: 'Write about something you\'re quietly proud of — something you never got to celebrate properly.',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#0a2a0a,#1a5a1a)'
  },
  25: {
    title: 'Smile Proof 😄',
    week: 'Week 4 — Present You',
    voiceText: 'Real ga smile vachina roju... recent lo... aa smile chupandi. Take a real selfie tonight.',
    prompt: 'Take a REAL smile selfie — not posed, not perfect. The messy, genuine, unfiltered one. 😄📸',
    activityType: 'selfie',
    overlayText: 'Real smiles are the best ones 😄',
    cardBg: 'linear-gradient(135deg,#2a1a08,#f39c1230)'
  },
  26: {
    title: 'Hidden Version 🎭',
    week: 'Week 4 — Present You',
    voiceText: 'Bayata oka version, lopala oka version... aa hidden part gurinchi raayandi. Real meeru evaru?',
    prompt: 'Write about the version of yourself that most people don\'t see. What\'s hidden behind the everyday face?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#1a0a2e,#38104a)'
  },
  27: {
    title: 'What You Still Miss 💔',
    week: 'Week 4 — Present You',
    voiceText: 'Childhood poyindi... kaani oka feeling, oka smell, oka moment... adi inka miss avuthunna. Draw it.',
    prompt: 'Draw the one thing from your past you still deeply miss — a place, a feeling, a person, a time. 🎨',
    activityType: 'drawing',
    cardBg: 'linear-gradient(135deg,#1a0810,#381020)'
  },

  /* ═══ FINAL 3 — Time Capsule ═══ */
  28: {
    title: 'Letter to Future Me 📝',
    week: 'Time Capsule — Final 3',
    voiceText: 'Future lo mee 5 years later version ki oka letter raayandi. Em cheppali? Em wish chestunnaru?',
    prompt: 'Write a letter to yourself 5 years from now. What do you want them to remember? What do you hope they\'ve found?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#0a1a2a,#1a3050)'
  },
  29: {
    title: 'This Version of You 🤳',
    week: 'Time Capsule — Final 3',
    voiceText: '2026 lo meeru... ippudu... exactly ila unnaru. Adi preserve cheyyadaniki oka selfie teesukundi.',
    prompt: 'Take a selfie that captures exactly who you are RIGHT NOW in this moment. This is for your archive. 📸',
    activityType: 'selfie',
    overlayText: 'Memory Digger Archive — 2026 🗂️',
    cardBg: 'linear-gradient(135deg,#101030,#202050)'
  },
  30: {
    title: 'Final Archive Card 🏺',
    week: 'Time Capsule — Final 3',
    voiceText: '30 days complete chesaru. Meeru digger kaadu, archaeologist ayinaru. Mee story raayandi — the whole journey.',
    prompt: 'Write your final reflection: What did this 30-day journey teach you? What will you carry forward?',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#1a0a04,#f5c84218)'
  }
};

// ── WEEK NAMES FOR DISPLAY ───────────────────────────────────────────────────
const WEEK_NAMES = [
  '', // index 0 unused
  'Week 1 — Childhood',
  'Week 2 — School Era',
  'Week 3 — Hostel Feelings',
  'Week 4 — Present You',
  'Time Capsule'
];

// ── STATE ────────────────────────────────────────────────────────────────────
let ritualCurrentDay    = 1;
let ritualCompletedDays = [];
let ritualStartDate     = null;
let drawingCtx          = null;
let drawingIsActive     = false;
let drawLastX           = 0;
let drawLastY           = 0;
let drawColor           = '#1e0e05';
let drawSize            = 4;
let selfieStream        = null;
let countdownInterval   = null;

// ── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
function ritualLS(key, val) {
  const email = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : 'guest';
  const fullKey = 'ritual_' + email + '_' + key;
  if (val === undefined) {
    try { return localStorage.getItem(fullKey); } catch(e) { return null; }
  }
  try { localStorage.setItem(fullKey, val); } catch(e) {}
}

// ── SHOW TOAST ───────────────────────────────────────────────────────────────
function showRitualToast(msg) {
  const t = document.getElementById('ritual-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── DAY CALCULATION ──────────────────────────────────────────────────────────
function getRitualDay() {
  // Developer override
  if (RITUAL_TEST_DAY && RITUAL_TEST_DAY >= 1 && RITUAL_TEST_DAY <= 30) {
    return RITUAL_TEST_DAY;
  }
  const startStr = ritualLS('start_date');
  if (!startStr) return 1; // hasn't started yet
  const start = new Date(startStr);
  const now   = new Date();
  // Reset time to midnight for clean day diff
  start.setHours(0,0,0,0);
  const today = new Date(now); today.setHours(0,0,0,0);
  const diff  = Math.floor((today - start) / 86400000);
  return Math.min(Math.max(diff + 1, 1), 30);
}

// ── IS RITUAL TIME? ──────────────────────────────────────────────────────────
function isRitualTime() {
  const h = new Date().getHours();
  return h >= RITUAL_HOUR_START; // 10 PM onwards (relaxed — full night)
}

// ── SECONDS UNTIL 10 PM ──────────────────────────────────────────────────────
function secondsUntil10PM() {
  const now    = new Date();
  let target   = new Date();
  target.setHours(RITUAL_HOUR_START, 0, 0, 0);
  if (now >= target) {
    // Already past 10 PM — next 10 PM is tomorrow
    target.setDate(target.getDate() + 1);
  }
  return Math.floor((target - now) / 1000);
}

// ── INIT RITUAL (called on page load) ────────────────────────────────────────
function initRitual() {
  // Only for signed-in users
  if (typeof isSignedIn === 'undefined' || !isSignedIn) return;
  if (typeof currentUser === 'undefined' || !currentUser) return;

  // Load completed days
  const saved = ritualLS('completed');
  ritualCompletedDays = saved ? JSON.parse(saved) : [];

  // Calculate current day
  ritualCurrentDay = getRitualDay();

  // Show FAB on all screens
  const fab = document.getElementById('ritual-fab');
  if (fab) fab.classList.add('show');
  updateFabState();

  // Show inline banner in memory-screen
  const banner = document.querySelector('.ritual-inline-banner');
  if (banner) banner.classList.add('show');

  // Show entry-screen ritual button
  const entryBtn = document.querySelector('.entry-ritual-btn');
  if (entryBtn) entryBtn.classList.add('show');

  // Update FAB every minute
  setInterval(updateFabState, 60000);
}

// ── UPDATE FAB APPEARANCE ─────────────────────────────────────────────────────
function updateFabState() {
  const moon = document.querySelector('.fab-moon');
  const label = document.querySelector('.fab-label');
  if (!moon || !label) return;
  if (isRitualTime()) {
    moon.classList.add('is-time');
    label.textContent = '10 PM Ritual';
  } else {
    moon.classList.remove('is-time');
    const secs = secondsUntil10PM();
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    label.textContent = h > 0 ? `${h}h ${m}m to 10 PM` : `${m}m to 10 PM`;
  }
}

// ── OPEN RITUAL MODAL ─────────────────────────────────────────────────────────
function openRitualModal() {
  // Guard: must be signed in
  if (typeof isSignedIn === 'undefined' || !isSignedIn) {
    if (typeof openSignup === 'function') openSignup();
    return;
  }

  // Set personal start date on first open
  if (!ritualLS('start_date')) {
    const today = new Date().toISOString().split('T')[0];
    ritualLS('start_date', today);
    ritualCurrentDay = 1;
  }

  ritualCurrentDay = getRitualDay();

  const modal = document.getElementById('ritual-modal');
  if (modal) {
    modal.classList.add('show');
    renderRitualModal();
    stopSelfieStream(); // safety
  }
}

// ── CLOSE RITUAL MODAL ────────────────────────────────────────────────────────
function closeRitualModal() {
  const modal = document.getElementById('ritual-modal');
  if (modal) modal.classList.remove('show');
  stopSelfieStream();
  stopCountdownTimer();
}

// ── RENDER MODAL CONTENT ──────────────────────────────────────────────────────
function renderRitualModal() {
  const sheet = document.querySelector('.ritual-sheet');
  if (!sheet) return;

  const dayData  = memoryCalendar[ritualCurrentDay] || memoryCalendar[1];
  const isDone   = ritualCompletedDays.includes(ritualCurrentDay);
  const timeOk   = isRitualTime();
  const pct      = Math.round((ritualCompletedDays.length / 30) * 100);

  // Build star field
  let starsHtml = '';
  for (let i = 0; i < 22; i++) {
    const d = (0.5 + Math.random() * 3).toFixed(1);
    starsHtml += `<div class="r-star" style="left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${d}s;animation-delay:${(Math.random()*2).toFixed(1)}s"></div>`;
  }

  // Build journey dots
  let dotsHtml = '';
  for (let i = 1; i <= 30; i++) {
    let cls = 'j-dot';
    if (ritualCompletedDays.includes(i)) cls += ' done';
    else if (i === ritualCurrentDay)     cls += ' today';
    const icon = ritualCompletedDays.includes(i) ? '✓' : i;
    dotsHtml += `<div class="${cls}">${icon}</div>`;
  }

  // Header HTML (common)
  const headerHtml = `
    <div class="ritual-stars">${starsHtml}</div>
    <div class="ritual-sheet-handle"></div>
    <div class="ritual-header">
      <button class="ritual-close-btn" onclick="closeRitualModal()">✕</button>
      <span class="ritual-moon-big">🌙</span>
      <div class="ritual-title">10 PM Memory Ritual</div>
      <div class="ritual-subtitle">30-Day Journey — Personal Archive ✨</div>
    </div>
    <div style="padding:0 20px;">
      <div class="day-progress-bar">
        <div class="day-progress-fill" style="width:${pct}%"></div>
      </div>
    </div>
  `;

  // Decide: countdown view OR day view
  let contentHtml = '';

  if (!timeOk) {
    // ── COUNTDOWN VIEW ────────────────────────────────────────
    const secs = secondsUntil10PM();
    const hh   = Math.floor(secs / 3600);
    const mm   = Math.floor((secs % 3600) / 60);
    const ss   = secs % 60;
    contentHtml = `
      <div id="ritual-countdown-view">
        <div class="countdown-card">
          <div class="countdown-label">Tonight's Ritual Unlocks In</div>
          <div class="countdown-digits">
            <div class="cd-block"><span class="cd-num" id="cd-h">${String(hh).padStart(2,'0')}</span><span class="cd-unit">hrs</span></div>
            <div class="cd-sep">:</div>
            <div class="cd-block"><span class="cd-num" id="cd-m">${String(mm).padStart(2,'0')}</span><span class="cd-unit">min</span></div>
            <div class="cd-sep">:</div>
            <div class="cd-block"><span class="cd-num" id="cd-s">${String(ss).padStart(2,'0')}</span><span class="cd-unit">sec</span></div>
          </div>
          <div class="countdown-msg">Come back at <strong style="color:#f5c842">10:00 PM</strong> tonight for your memory ritual 🌙<br>Today is <strong style="color:#f5df8a">Day ${ritualCurrentDay}</strong> of your 30-day journey.</div>
        </div>
        <div class="peek-card">
          <div class="peek-label">Tonight's Memory</div>
          <div class="peek-day-badge">Day ${ritualCurrentDay}</div>
          <div class="peek-title">${dayData.title}</div>
          <div style="font-family:'Caveat',cursive;color:rgba(245,239,220,0.45);font-size:0.8rem;margin-top:4px">${dayData.week}</div>
        </div>
        <div class="journey-strip">
          <div class="journey-label">Your 30-Day Map</div>
          <div class="journey-dots">${dotsHtml}</div>
        </div>
      </div>`;
    // Start live countdown
    setTimeout(startCountdownTimer, 100);

  } else {
    // ── DAY CARD VIEW ─────────────────────────────────────────
    let activityHtml = '';

    if (isDone) {
      // Already completed today
      activityHtml = `
        <div class="day-completed-card">
          <span class="completed-icon">✅</span>
          <div class="completed-title">Day ${ritualCurrentDay} Complete! 🎉</div>
          <div class="completed-sub">Meeru today's ritual complete chesaru.<br>Tomorrow new memory unlocks! ✨</div>
        </div>`;
    } else {
      // Show the activity
      activityHtml = buildActivityHtml(ritualCurrentDay, dayData);
    }

    contentHtml = `
      <div id="ritual-day-view">
        <div class="day-card">
          <div class="day-card-header">
            <div class="day-number-row">
              <span class="day-num-pill">Day ${ritualCurrentDay}</span>
              <span class="week-pill">${dayData.week}</span>
            </div>
            <div class="day-card-title">${dayData.title}</div>
          </div>
          <div class="day-card-body">
            <button class="voice-prompt-btn" id="voiceBtn" onclick="toggleVoicePrompt()">
              <span class="voice-icon">🔊</span>
              <div class="voice-text-wrap">
                <span class="voice-label">Tonight's Prompt</span>
                <span class="voice-prompt-text">${dayData.voiceText}</span>
              </div>
              <span class="voice-play-icon" id="voicePlayIcon">▶</span>
            </button>
            <div class="activity-label">Tonight's Activity</div>
            ${activityHtml}
          </div>
        </div>
        <div class="journey-strip">
          <div class="journey-label">Your 30-Day Map</div>
          <div class="journey-dots">${dotsHtml}</div>
        </div>
      </div>`;
  }

  sheet.innerHTML = headerHtml + contentHtml;
  sheet.scrollTop = 0;

  // Init drawing canvas after render
  if (dayData.activityType === 'drawing' && !isDone) {
    setTimeout(initDrawingCanvas, 80);
  }
}

// ── BUILD ACTIVITY HTML ───────────────────────────────────────────────────────
function buildActivityHtml(day, data) {
  const promptHtml = `<div style="font-family:'Caveat',cursive;color:rgba(245,239,220,0.65);font-size:0.88rem;line-height:1.5;margin-bottom:12px;padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:3px solid rgba(245,200,66,0.3);">${data.prompt}</div>`;

  switch (data.activityType) {

    case 'selfie': return `
      ${promptHtml}
      <div class="selfie-module">
        <div class="camera-preview-wrap" id="cameraWrap">
          <div class="camera-placeholder" id="cameraPlaceholder">
            <span>📷</span>
            <p>Camera start cheyyali ante button click cheyyandi</p>
          </div>
          <video id="selfie-video" autoplay playsinline style="display:none"></video>
          <canvas id="selfie-canvas"></canvas>
          <div class="camera-overlay-badge">ScrapDig Memory Ritual</div>
        </div>
        <div class="selfie-btn-row">
          <button class="ritual-action-btn btn-secondary btn-small" onclick="startCamera()">📷 Camera Open</button>
          <button class="ritual-action-btn btn-primary btn-small" onclick="captureSelfie(${day})">⚡ Capture!</button>
        </div>
        <canvas id="export-canvas" style="display:none"></canvas>
        <div id="selfie-download-area" style="margin-top:10px;display:none">
          <button class="ritual-action-btn btn-download" onclick="downloadSelfieCard(${day})">⬇️ Download Memory Card</button>
          <button class="ritual-action-btn btn-secondary" style="margin-top:8px" onclick="markDayComplete(${day})">✅ Day ${day} Complete!</button>
        </div>
      </div>`;

    case 'textcard': return `
      ${promptHtml}
      <div class="textcard-module">
        <textarea class="memory-textarea" id="memory-text" placeholder="Ikkada raayandi... (Telugu or English — mee choice 💛)" maxlength="400"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="ritual-action-btn btn-primary btn-small" onclick="generateTextCard(${day})">🎴 Memory Card Cheyyandi</button>
          <button class="ritual-action-btn btn-secondary btn-small" onclick="clearTextInput()">🗑️ Clear</button>
        </div>
        <canvas id="textcard-preview-canvas" style="display:none;border-radius:10px;width:100%;margin-top:10px"></canvas>
        <div id="textcard-download-area" style="margin-top:10px;display:none">
          <button class="ritual-action-btn btn-download" onclick="downloadTextCard()">⬇️ Download Card</button>
          <button class="ritual-action-btn btn-secondary" style="margin-top:8px" onclick="markDayComplete(${day})">✅ Day ${day} Complete!</button>
        </div>
      </div>`;

    case 'drawing': return `
      ${promptHtml}
      <div class="drawing-module">
        <div class="drawing-toolbar">
          ${['#1e0e05','#e74c3c','#3498db','#27ae60','#f39c12','#9b59b6','#e91e8c','#ffffff'].map(c =>
            `<button class="draw-color-btn ${c === '#1e0e05' ? 'active' : ''}" style="background:${c}" onclick="setDrawColor('${c}',this)" title="${c}"></button>`
          ).join('')}
          <button class="draw-size-btn active" onclick="setDrawSize(3,this)">S</button>
          <button class="draw-size-btn" onclick="setDrawSize(7,this)">M</button>
          <button class="draw-size-btn" onclick="setDrawSize(14,this)">L</button>
          <button class="draw-clear-btn" onclick="clearDrawing()">🗑️ Clear</button>
        </div>
        <canvas id="drawing-canvas" height="260"></canvas>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="ritual-action-btn btn-primary btn-small" onclick="exportDrawing(${day})">🎴 Export Drawing</button>
        </div>
        <canvas id="drawing-export-canvas" style="display:none"></canvas>
        <div id="drawing-download-area" style="margin-top:10px;display:none">
          <button class="ritual-action-btn btn-download" onclick="downloadDrawingCard()">⬇️ Download Drawing Card</button>
          <button class="ritual-action-btn btn-secondary" style="margin-top:8px" onclick="markDayComplete(${day})">✅ Day ${day} Complete!</button>
        </div>
      </div>`;

    default: return '<div style="color:rgba(245,239,220,0.4);font-family:Caveat,cursive;text-align:center;padding:20px">Activity loading...</div>';
  }
}

// ── MARK DAY COMPLETE ─────────────────────────────────────────────────────────
function markDayComplete(day) {
  if (!ritualCompletedDays.includes(day)) {
    ritualCompletedDays.push(day);
    ritualLS('completed', JSON.stringify(ritualCompletedDays));
  }
  showRitualToast(`Day ${day} complete! ✅ Roju varaku meeru amazing! 💛`);
  setTimeout(renderRitualModal, 600);
}

// ── COUNTDOWN TIMER ───────────────────────────────────────────────────────────
function startCountdownTimer() {
  stopCountdownTimer();
  countdownInterval = setInterval(() => {
    if (isRitualTime()) {
      stopCountdownTimer();
      renderRitualModal(); // switch to day view!
      return;
    }
    const secs = secondsUntil10PM();
    const hh   = Math.floor(secs / 3600);
    const mm   = Math.floor((secs % 3600) / 60);
    const ss   = secs % 60;
    const hEl  = document.getElementById('cd-h');
    const mEl  = document.getElementById('cd-m');
    const sEl  = document.getElementById('cd-s');
    if (hEl) hEl.textContent = String(hh).padStart(2,'0');
    if (mEl) mEl.textContent = String(mm).padStart(2,'0');
    if (sEl) sEl.textContent = String(ss).padStart(2,'0');
  }, 1000);
}
function stopCountdownTimer() {
  if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
}

// ── VOICE PROMPT ──────────────────────────────────────────────────────────────
let isSpeaking = false;
function toggleVoicePrompt() {
  const dayData = memoryCalendar[ritualCurrentDay];
  if (!dayData) return;
  const btn = document.getElementById('voiceBtn');
  const icon = document.getElementById('voicePlayIcon');

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    if (btn)  btn.classList.remove('speaking');
    if (icon) icon.textContent = '▶';
    return;
  }

  const utterance = new SpeechSynthesisUtterance(dayData.voiceText);
  utterance.lang  = 'en-IN'; // closest to Telugu-accented English
  utterance.rate  = 0.88;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to pick a female Indian voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang === 'en-IN') ||
                    voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;

  utterance.onstart = () => {
    isSpeaking = true;
    if (btn)  btn.classList.add('speaking');
    if (icon) icon.textContent = '⏸';
  };
  utterance.onend = utterance.onerror = () => {
    isSpeaking = false;
    if (btn)  btn.classList.remove('speaking');
    if (icon) icon.textContent = '▶';
  };

  window.speechSynthesis.speak(utterance);
}

// ── SELFIE MODULE ─────────────────────────────────────────────────────────────
function startCamera() {
  const video       = document.getElementById('selfie-video');
  const placeholder = document.getElementById('cameraPlaceholder');
  if (!video) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showRitualToast('Camera mee browser lo support kaadhu 😔');
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    .then(stream => {
      selfieStream = stream;
      video.srcObject = stream;
      video.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    })
    .catch(() => {
      showRitualToast('Camera permission ivvandi! Settings lo enable cheyyandi. 📷');
    });
}

function stopSelfieStream() {
  if (selfieStream) {
    selfieStream.getTracks().forEach(t => t.stop());
    selfieStream = null;
  }
  isSpeaking = false;
  window.speechSynthesis && window.speechSynthesis.cancel();
}

function captureSelfie(day) {
  const video  = document.getElementById('selfie-video');
  const canvas = document.getElementById('selfie-canvas');
  if (!video || !canvas || !video.srcObject) {
    showRitualToast('Pehle camera open cheyyandi! 📷');
    return;
  }

  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');

  // Mirror flip to match preview
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0);
  ctx.setTransform(1,0,0,1,0,0);

  canvas.style.display = 'block';
  video.style.display  = 'none';
  stopSelfieStream();

  const downloadArea = document.getElementById('selfie-download-area');
  if (downloadArea) downloadArea.style.display = 'block';
  showRitualToast('Captured! ✅ Download button click cheyyandi.');
}

function downloadSelfieCard(day) {
  const selfieCanvas = document.getElementById('selfie-canvas');
  const exportCanvas = document.getElementById('export-canvas');
  const dayData      = memoryCalendar[day] || {};
  if (!selfieCanvas || !exportCanvas) return;

  const W = 800, H = 900;
  exportCanvas.width  = W;
  exportCanvas.height = H;
  const ctx = exportCanvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#0d0520');
  gradient.addColorStop(1, '#150a30');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Stars
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.arc(Math.random()*W, Math.random()*H*0.4, Math.random()*1.5+0.3, 0, Math.PI*2);
    ctx.fillStyle = `rgba(245,200,66,${0.1 + Math.random()*0.5})`;
    ctx.fill();
  }

  // Selfie image (fitted, centered top)
  const imgAR = selfieCanvas.width / selfieCanvas.height;
  const boxW  = W - 60, boxH = Math.min(500, boxW / imgAR);
  const imgX  = (W - boxW) / 2;
  const imgY  = 40;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(imgX, imgY, boxW, boxH, 16);
  ctx.clip();
  ctx.drawImage(selfieCanvas, imgX, imgY, boxW, boxH);
  ctx.restore();

  // Gold border on photo
  ctx.strokeStyle = 'rgba(245,200,66,0.4)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.roundRect(imgX, imgY, boxW, boxH, 16);
  ctx.stroke();

  // Day badge
  const badgeY = imgY + boxH + 24;
  ctx.fillStyle = 'rgba(245,200,66,0.15)';
  ctx.beginPath(); ctx.roundRect(W/2-60, badgeY, 120, 28, 14); ctx.fill();
  ctx.fillStyle = '#f5c842';
  ctx.font = 'bold 14px "Special Elite", serif';
  ctx.textAlign = 'center';
  ctx.fillText(`DAY ${day} • 10 PM RITUAL`, W/2, badgeY+18);

  // Title
  ctx.fillStyle = '#f5df8a';
  ctx.font = 'bold 26px "Caveat", cursive';
  ctx.fillText(dayData.title || '', W/2, badgeY + 58);

  // Overlay text
  ctx.fillStyle = 'rgba(245,239,220,0.6)';
  ctx.font = '18px "Caveat", cursive';
  ctx.fillText(dayData.overlayText || '', W/2, badgeY + 86);

  // Date
  const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  ctx.fillStyle = 'rgba(245,239,220,0.3)';
  ctx.font      = '14px "Special Elite", serif';
  ctx.fillText(today, W/2, badgeY + 114);

  // Watermark
  ctx.fillStyle = 'rgba(245,200,66,0.35)';
  ctx.font      = '13px "Special Elite", serif';
  ctx.fillText(RITUAL_WATERMARK, W/2, H - 18);

  triggerDownload(exportCanvas, `ScrapDig_Day${day}_Selfie.jpg`);
  showRitualToast('Download start ayyindi! 📥');
}

// ── TEXT CARD MODULE ──────────────────────────────────────────────────────────
function clearTextInput() {
  const ta = document.getElementById('memory-text');
  if (ta) ta.value = '';
  const canvas = document.getElementById('textcard-preview-canvas');
  if (canvas) canvas.style.display = 'none';
  const dl = document.getElementById('textcard-download-area');
  if (dl) dl.style.display = 'none';
}

function generateTextCard(day) {
  const ta = document.getElementById('memory-text');
  if (!ta || !ta.value.trim()) {
    showRitualToast('Pehle kuch type cheyyandi! ✏️');
    return;
  }
  const text    = ta.value.trim();
  const dayData = memoryCalendar[day] || {};
  const canvas  = document.getElementById('textcard-preview-canvas');
  if (!canvas) return;

  const W = 800, H = 520;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  const bgColors = [
    ['#fdf6e3','#f0e6c8'],
    ['#1a0a04','#3d1f0a'],
    ['#0d0520','#150a30'],
    ['#0a1a2a','#1a3050'],
    ['#0a2a0a','#1a5a1a']
  ];
  const [c1, c2] = bgColors[day % bgColors.length];
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Paper texture lines
  const isDark = c1.startsWith('#0') || c1.startsWith('#1');
  for (let i = 0; i < H; i += 32) {
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.025)';
    ctx.fillRect(0, i, W, 1);
  }

  // Left border accent
  const accentColors = ['#f5c842','#e8913a','#e74c3c','#27ae60','#3498db'];
  ctx.fillStyle = accentColors[day % accentColors.length];
  ctx.fillRect(0, 0, 5, H);

  // Day badge
  ctx.fillStyle = isDark ? 'rgba(245,200,66,0.15)' : 'rgba(30,14,5,0.1)';
  ctx.beginPath(); ctx.roundRect(24, 20, 110, 28, 14); ctx.fill();
  ctx.fillStyle = isDark ? '#f5c842' : '#8B4513';
  ctx.font      = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`DAY ${day} • 10 PM`, 38, 38);

  // Title
  ctx.fillStyle = isDark ? '#f5df8a' : '#1e0e05';
  ctx.font      = 'bold 28px sans-serif';
  ctx.fillText(dayData.title || '', 24, 82);

  // Divider
  ctx.fillStyle = isDark ? 'rgba(245,200,66,0.25)' : 'rgba(30,14,5,0.12)';
  ctx.fillRect(24, 96, W - 48, 1);

  // Body text — word wrap
  ctx.fillStyle = isDark ? 'rgba(245,239,220,0.88)' : '#2a1608';
  ctx.font      = '20px sans-serif';
  const maxW   = W - 64;
  const lineH  = 32;
  const words  = text.split(' ');
  let line     = '', y = 138;

  for (let w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, 32, y);
      line = w; y += lineH;
      if (y > H - 80) { ctx.fillText('...', 32, y); break; }
    } else { line = test; }
  }
  if (y <= H - 80) ctx.fillText(line, 32, y);

  // Date stamp
  const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  ctx.fillStyle = isDark ? 'rgba(245,239,220,0.3)' : 'rgba(30,14,5,0.3)';
  ctx.font      = '13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(today, W - 24, H - 30);

  // Watermark
  ctx.fillStyle = isDark ? 'rgba(245,200,66,0.3)' : 'rgba(139,69,19,0.3)';
  ctx.textAlign = 'center';
  ctx.font      = '12px sans-serif';
  ctx.fillText(RITUAL_WATERMARK, W/2, H - 12);

  canvas.style.display = 'block';
  const dl = document.getElementById('textcard-download-area');
  if (dl) dl.style.display = 'block';
  showRitualToast('Card ready! Download cheyyandi 🎴');
}

function downloadTextCard() {
  const canvas = document.getElementById('textcard-preview-canvas');
  if (!canvas) return;
  triggerDownload(canvas, `ScrapDig_Day${ritualCurrentDay}_Memory.png`);
  showRitualToast('Download start ayyindi! 📥');
}

// ── DRAWING MODULE ────────────────────────────────────────────────────────────
function initDrawingCanvas() {
  const canvas = document.getElementById('drawing-canvas');
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = 260;
  drawingCtx    = canvas.getContext('2d');
  drawingCtx.fillStyle = '#fdf6e3';
  drawingCtx.fillRect(0, 0, canvas.width, canvas.height);

  // Add faint lines like paper
  for (let i = 32; i < 260; i += 32) {
    drawingCtx.strokeStyle = 'rgba(0,0,0,0.06)';
    drawingCtx.lineWidth   = 1;
    drawingCtx.beginPath();
    drawingCtx.moveTo(0, i); drawingCtx.lineTo(canvas.width, i);
    drawingCtx.stroke();
  }

  // Mouse events
  canvas.addEventListener('mousedown',  drawStart);
  canvas.addEventListener('mousemove',  drawMove);
  canvas.addEventListener('mouseup',    drawEnd);
  canvas.addEventListener('mouseleave', drawEnd);

  // Touch events
  canvas.addEventListener('touchstart', drawTouchStart, { passive: false });
  canvas.addEventListener('touchmove',  drawTouchMove,  { passive: false });
  canvas.addEventListener('touchend',   drawEnd);
}

function getCanvasPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
  const y = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
  return { x: (x - rect.left) * scaleX, y: (y - rect.top) * scaleY };
}

function drawStart(e) {
  drawingIsActive = true;
  const { x, y } = getCanvasPos(e.target, e);
  drawLastX = x; drawLastY = y;
  drawingCtx.beginPath();
  drawingCtx.arc(x, y, drawSize/2, 0, Math.PI*2);
  drawingCtx.fillStyle = drawColor;
  drawingCtx.fill();
}
function drawMove(e) {
  if (!drawingIsActive) return;
  const { x, y } = getCanvasPos(e.target, e);
  drawingCtx.beginPath();
  drawingCtx.moveTo(drawLastX, drawLastY);
  drawingCtx.lineTo(x, y);
  drawingCtx.strokeStyle = drawColor;
  drawingCtx.lineWidth   = drawSize;
  drawingCtx.lineCap     = 'round';
  drawingCtx.lineJoin    = 'round';
  drawingCtx.stroke();
  drawLastX = x; drawLastY = y;
}
function drawEnd() { drawingIsActive = false; }
function drawTouchStart(e) { e.preventDefault(); drawStart(e); }
function drawTouchMove(e)  { e.preventDefault(); drawMove(e);  }

function setDrawColor(color, btn) {
  drawColor = color;
  document.querySelectorAll('.draw-color-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
function setDrawSize(size, btn) {
  drawSize = size;
  document.querySelectorAll('.draw-size-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
function clearDrawing() {
  const canvas = document.getElementById('drawing-canvas');
  if (!canvas || !drawingCtx) return;
  drawingCtx.fillStyle = '#fdf6e3';
  drawingCtx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 32; i < 260; i += 32) {
    drawingCtx.strokeStyle = 'rgba(0,0,0,0.06)';
    drawingCtx.lineWidth   = 1;
    drawingCtx.beginPath();
    drawingCtx.moveTo(0, i); drawingCtx.lineTo(canvas.width, i);
    drawingCtx.stroke();
  }
}

function exportDrawing(day) {
  const drawCanvas   = document.getElementById('drawing-canvas');
  const exportCanvas = document.getElementById('drawing-export-canvas');
  const dayData      = memoryCalendar[day] || {};
  if (!drawCanvas || !exportCanvas) return;

  const W = 800, H = 680;
  exportCanvas.width  = W;
  exportCanvas.height = H;
  const ctx = exportCanvas.getContext('2d');

  // Paper bg
  ctx.fillStyle = '#fdf6e3';
  ctx.fillRect(0, 0, W, H);

  // Paper texture
  for (let i = 0; i < H; i += 30) {
    ctx.fillStyle = 'rgba(0,0,0,0.025)';
    ctx.fillRect(0, i, W, 1);
  }

  // Header strip
  ctx.fillStyle = '#1a0a04';
  ctx.fillRect(0, 0, W, 68);

  ctx.fillStyle = '#f5c842';
  ctx.font      = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`DAY ${day} — 10 PM Memory Ritual`, W/2, 28);

  ctx.fillStyle = 'rgba(245,239,220,0.8)';
  ctx.font      = '20px sans-serif';
  ctx.fillText(dayData.title || '', W/2, 52);

  // Drawing image
  const dW = W - 60, dH = dW * (drawCanvas.height / drawCanvas.width);
  ctx.save();
  ctx.shadowColor   = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur    = 12;
  ctx.shadowOffsetY = 3;
  ctx.drawImage(drawCanvas, 30, 86, dW, Math.min(dH, 480));
  ctx.restore();

  // Footer
  const footerY = H - 46;
  ctx.fillStyle = 'rgba(30,14,5,0.06)';
  ctx.fillRect(0, footerY, W, 46);

  const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  ctx.fillStyle = 'rgba(30,14,5,0.4)';
  ctx.font      = '13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(today, 24, H - 18);
  ctx.textAlign = 'right';
  ctx.fillText(RITUAL_WATERMARK, W - 24, H - 18);

  const dlArea = document.getElementById('drawing-download-area');
  if (dlArea) dlArea.style.display = 'block';
  showRitualToast('Drawing exported! Download cheyyandi 🎨');
}

function downloadDrawingCard() {
  const canvas = document.getElementById('drawing-export-canvas');
  if (!canvas) return;
  triggerDownload(canvas, `ScrapDig_Day${ritualCurrentDay}_Drawing.png`);
  showRitualToast('Download start ayyindi! 📥');
}

// ── DOWNLOAD HELPER ───────────────────────────────────────────────────────────
function triggerDownload(canvas, filename) {
  const link      = document.createElement('a');
  link.download   = filename;
  link.href       = canvas.toDataURL('image/png', 0.95);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ── BUILD HTML SKELETON (called once on page load) ────────────────────────────
function buildRitualHTML() {
  // 1. FAB button (floating, both screens)
  const fab = document.createElement('div');
  fab.id = 'ritual-fab';
  fab.onclick = openRitualModal;
  fab.innerHTML = `<div class="fab-moon">🌙</div><div class="fab-label">10 PM Ritual</div>`;
  document.body.appendChild(fab);

  // 2. Toast
  const toast = document.createElement('div');
  toast.id = 'ritual-toast';
  document.body.appendChild(toast);

  // 3. Reaction burst layer (if not already present)
  if (!document.getElementById('rxn-burst')) {
    const burst = document.createElement('div');
    burst.id = 'rxn-burst';
    document.body.appendChild(burst);
  }

  // 4. Main modal
  const modal = document.createElement('div');
  modal.id = 'ritual-modal';
  modal.onclick = function(e) { if (e.target === modal) closeRitualModal(); };
  modal.innerHTML = `<div class="ritual-sheet"></div>`;
  document.body.appendChild(modal);

  // 5. Inline banner inside memory-screen (after soil-header)
  const memScreen = document.getElementById('memory-screen');
  if (memScreen) {
    const banner = document.createElement('div');
    banner.className = 'ritual-inline-banner';
    banner.onclick   = openRitualModal;
    banner.innerHTML = `
      <span class="rib-icon">🌙</span>
      <div class="rib-text">
        <div class="rib-title">10 PM Memory Ritual</div>
        <div class="rib-sub" id="rib-sub-text">Mee personal 30-day archive journey ✨</div>
      </div>
      <span class="rib-arrow">›</span>`;
    // Insert after soil-header
    const header = memScreen.querySelector('.soil-header');
    if (header && header.nextSibling) {
      memScreen.insertBefore(banner, header.nextSibling);
    } else {
      memScreen.appendChild(banner);
    }
  }

  // 6. Entry screen ritual button
  const entryContent = document.querySelector('.entry-content');
  if (entryContent) {
    const entryBtn = document.createElement('button');
    entryBtn.className = 'entry-ritual-btn';
    entryBtn.onclick   = openRitualModal;
    entryBtn.innerHTML = `<span class="erb-moon">🌙</span><span class="erb-text">10 PM Memory Ritual</span><span class="erb-badge">30 Days</span>`;
    // Insert before footer within entry-content
    const digBtn = entryContent.querySelector('.dig-btn');
    if (digBtn) {
      entryContent.insertBefore(entryBtn, digBtn.nextSibling);
    } else {
      entryContent.appendChild(entryBtn);
    }
  }
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
// Wait for DOM + existing scripts to finish
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootRitual);
} else {
  // DOM already ready — wait a tick for existing scripts
  setTimeout(bootRitual, 0);
}

function bootRitual() {
  buildRitualHTML();
  // Wait a moment to let existing window.load + loadState() run first
  setTimeout(() => {
    initRitual();
    // Also re-check when user signs in (patch into afterSignupContinue)
    const origAfterSignup = window.afterSignupContinue;
    if (origAfterSignup) {
      window.afterSignupContinue = function() {
        origAfterSignup();
        setTimeout(initRitual, 400);
      };
    }
    const origFinalizeAuth = window.finalizeAuth;
    if (origFinalizeAuth) {
      window.finalizeAuth = function(name, title) {
        origFinalizeAuth(name, title);
        setTimeout(initRitual, 400);
      };
    }
  }, 900);
}