/* ═══════════════════════════════════════════════════════════════════════════════
   memoryRitual.js — 10 PM Memory Ritual Add-On  v3.0
   ScrapDig / Memory Digger
   ───────────────────────────────────────────────────────────────────────────────
   FIXES IN THIS VERSION:
   ✅ Camera retake bug fixed — "Camera Open" now properly resets photo + camera
   ✅ Continue screen added — shows before activity, with auto-voice + replay btn
   ✅ Auto voice reads prompt on open, best available voice selected
   ✅ Multi activityType as array now works (drawing canvas uniquely ID'd per index)
   ✅ Heaven background: falling snow + sparkles + soft ambient music via Web Audio
   ✅ Download cards are photo-style (polaroid frame) — NO QR code on any card
   ✅ Text card & drawing card styled like photo prints
   ✅ All canvas IDs scoped per type+index to avoid conflicts with multi-activity
   ═══════════════════════════════════════════════════════════════════════════════ */

'use strict';

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  🛠️  DEVELOPER CONFIG — set DEV_MODE = false before deploying               ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
const RITUAL_TEST_DAY    = null;   // e.g. 5 → force Day 5. null = auto
const RITUAL_TEST_HOUR   = null;   // e.g. 22 → simulate 10 PM. null = real time
const RITUAL_TEST_MINUTE = null;   // e.g. 0. null = real time
const DEV_MODE           = true;   // ← SET FALSE BEFORE DEPLOYING

// ── Unlock time ──
const RITUAL_HOUR_START   = 22;   // 22 = 10 PM
const RITUAL_MINUTE_START = 0;

// ── Card branding (appears on downloadable card footer) ──
const RITUAL_WATERMARK  = 'ScrapDig • 10 PM Memory Ritual';
const PROMO_APP_NAME    = 'Memory Digger';
const PROMO_QR_URL      = 'https://scrapdg.com';
const PROMO_SELL_LINE   = 'Sell your waste & Earn money 💰';
const PROMO_CTA_LINE    = 'Download ScrapDig on PlayStore';
const PROMO_PLAY_LABEL  = '▶ GET IT ON Google Play';

// ═══════════════════════════════════════════════════════════════════════════════
// 30-DAY MEMORY CALENDAR
// activityType can be: 'selfie' | 'textcard' | 'drawing'
//   OR an ARRAY for multiple: ['selfie', 'textcard']  ['textcard', 'drawing'] etc.
// ═══════════════════════════════════════════════════════════════════════════════
const memoryCalendar = {
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
    prompt: 'Write about a toy from childhood that\'s gone now. Draw it too if you remember! 🎨',
    activityType: ['textcard', 'drawing'],
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
    title: 'First Lonely Night 🌙',
    week: 'Week 1 — Childhood',
    voiceText: 'Amma lekapothe... first night darkness lo... real ga edichinattu anipinchindi. Write that night tonight.',
    prompt: 'Write about the first time you truly felt alone — whether it was hostel, exam, or any big change.',
    activityType: 'textcard',
    cardBg: 'linear-gradient(135deg,#0a0a1e,#1a1a40)'
  },
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
    voiceText: 'Front bench topper feel. Back bench freedom feel. Meeru ekkada kurchunevalaru? Draw mee classroom — also write your memory!',
    prompt: 'Draw your classroom from above — where you sat, your best friend\'s seat. Then write your funniest classroom memory.',
    activityType: ['drawing', 'textcard'],
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
  22: {
    title: 'What Changed ✨',
    week: 'Week 4 — Present You',
    voiceText: 'Childhood meeru vs ippatiki meeru — chala marindi. Aa changes draw cheyyandi... good and hard ones both.',
    prompt: 'Draw a "then vs now" comparison. Write about what you miss most too.',
    activityType: ['drawing', 'textcard'],
    cardBg: 'linear-gradient(135deg,#1a1a1a,#2a2a40)'
  },
  23: {
    title: 'What You\'re Tired Of 😮‍💨',
    week: 'Week 4 — Present You',
    voiceText: 'Honestly... ippatiki em tho most tired ga unnaru? No filter. Just write it.',
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
    prompt: 'Draw the one thing from your past you still deeply miss. Then write why. 🎨',
    activityType: ['drawing', 'textcard'],
    cardBg: 'linear-gradient(135deg,#1a0810,#381020)'
  },
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

// ═══════════════════════════════════════════════════════════════════════════════
// STATE VARIABLES
// ═══════════════════════════════════════════════════════════════════════════════
let ritualCurrentDay    = 1;
let ritualCompletedDays = [];
let selfieStream        = null;        // active camera MediaStream
let countdownInterval   = null;
let isSpeaking          = false;
let drawingCtx          = {};          // keyed by canvasId for multi-activity support
let drawingIsActive     = false;
let drawLastX           = 0;
let drawLastY           = 0;
let drawColor           = '#1e0e05';
let drawSize            = 4;
let ambientAudioCtx     = null;        // Web Audio context for ambient music
let ambientNodes        = [];          // running audio nodes
let snowInterval        = null;        // particle animation interval
let _devTestDay         = null;
let _devTestHour        = null;
let _devTestMinute      = null;
let devPanelOpen        = true;

// ═══════════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function ritualLS(key, val) {
  const email   = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : 'guest';
  const fullKey = 'ritual_' + email + '_' + key;
  if (val === undefined) {
    try { return localStorage.getItem(fullKey); } catch(e) { return null; }
  }
  try { localStorage.setItem(fullKey, val); } catch(e) {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════════
function showRitualToast(msg) {
  const t = document.getElementById('ritual-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIME & DAY CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function getRitualDay() {
  if (_devTestDay !== null) return _devTestDay;
  if (RITUAL_TEST_DAY && RITUAL_TEST_DAY >= 1 && RITUAL_TEST_DAY <= 30) return RITUAL_TEST_DAY;
  const startStr = ritualLS('start_date');
  if (!startStr) return 1;
  const start = new Date(startStr);
  const now   = new Date();
  start.setHours(0,0,0,0);
  const today = new Date(now); today.setHours(0,0,0,0);
  const diff  = Math.floor((today - start) / 86400000);
  return Math.min(Math.max(diff + 1, 1), 30);
}

function isRitualTime() {
  const now = new Date();
  const h   = (_devTestHour   !== null) ? _devTestHour   : (RITUAL_TEST_HOUR   !== null) ? RITUAL_TEST_HOUR   : now.getHours();
  const m   = (_devTestMinute !== null) ? _devTestMinute : (RITUAL_TEST_MINUTE !== null) ? RITUAL_TEST_MINUTE : now.getMinutes();
  return (h * 60 + m) >= (RITUAL_HOUR_START * 60 + RITUAL_MINUTE_START);
}

function secondsUntil10PM() {
  const now    = new Date();
  let target   = new Date();
  target.setHours(RITUAL_HOUR_START, RITUAL_MINUTE_START, 0, 0);
  if (isRitualTime()) { target.setDate(target.getDate() + 1); target.setHours(RITUAL_HOUR_START, RITUAL_MINUTE_START, 0, 0); }
  return Math.max(0, Math.floor((target - now) / 1000));
}

// ═══════════════════════════════════════════════════════════════════════════════
// AMBIENT HEAVEN MUSIC — Web Audio API
// Generates a soft, peaceful ambient soundscape (harp-like tones + pad)
// No external files needed — all generated in-browser
// ═══════════════════════════════════════════════════════════════════════════════

/* Pentatonic scale notes (Hz) — peaceful, no dissonance */
const HEAVEN_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

function startHeavenMusic() {
  stopHeavenMusic(); // clear any previous session
  try {
    ambientAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Main volume — keep very soft so it doesn't overpower
    const masterGain = ambientAudioCtx.createGain();
    masterGain.gain.value = 0.12; // 12% volume — background ambience
    masterGain.connect(ambientAudioCtx.destination);

    // Reverb via ConvolverNode (simple impulse response simulation)
    const convolver  = ambientAudioCtx.createConvolver();
    const reverbGain = ambientAudioCtx.createGain();
    reverbGain.gain.value = 0.6;

    // Generate impulse response for reverb (2 seconds of decaying noise)
    const rate    = ambientAudioCtx.sampleRate;
    const length  = rate * 2;
    const impulse = ambientAudioCtx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
      }
    }
    convolver.buffer = impulse;
    convolver.connect(reverbGain);
    reverbGain.connect(masterGain);

    ambientNodes.push(masterGain, convolver, reverbGain);

    // Soft drone pad — two detuned oscillators for warmth
    const playPad = (freq, detune, startDelay) => {
      const osc  = ambientAudioCtx.createOscillator();
      const gain = ambientAudioCtx.createGain();
      osc.type      = 'sine';
      osc.frequency.value = freq;
      osc.detune.value    = detune;
      gain.gain.setValueAtTime(0, ambientAudioCtx.currentTime + startDelay);
      gain.gain.linearRampToValueAtTime(0.25, ambientAudioCtx.currentTime + startDelay + 3);
      gain.gain.linearRampToValueAtTime(0.18, ambientAudioCtx.currentTime + startDelay + 8);
      osc.connect(gain);
      gain.connect(masterGain);
      gain.connect(convolver);
      osc.start(ambientAudioCtx.currentTime + startDelay);
      ambientNodes.push(osc, gain);
    };

    // Low drone base notes
    playPad(65.4,   0,   0);  // C2 root
    playPad(98.0,   7,   0.5); // G2 fifth
    playPad(130.8, -5,   1);   // C3 octave
    playPad(196.0,  3,   1.5); // G3 octave fifth

    // Schedule harp-like plucked notes at intervals
    const playHarpNote = (freq, startTime) => {
      const osc  = ambientAudioCtx.createOscillator();
      const gain = ambientAudioCtx.createGain();
      osc.type = 'triangle'; // warmer than sine for harp feel
      osc.frequency.value = freq;
      // Sharp attack, slow decay — plucked string feel
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 3.5);
      osc.connect(gain);
      gain.connect(masterGain);
      gain.connect(convolver);
      osc.start(startTime);
      osc.stop(startTime + 3.6);
      ambientNodes.push(osc, gain);
    };

    // Play a gentle arpeggio pattern that loops every 12 seconds
    const scheduleArpeggio = (baseTime) => {
      const pattern = [0, 2, 4, 6, 4, 2, 1, 3, 5, 7, 5, 3]; // index into HEAVEN_NOTES
      const spacing = 1.0; // seconds between notes
      pattern.forEach((noteIdx, i) => {
        const freq = HEAVEN_NOTES[noteIdx % HEAVEN_NOTES.length];
        playHarpNote(freq, baseTime + i * spacing);
        // Also play an octave higher at half volume for shimmer
        playHarpNote(freq * 2, baseTime + i * spacing + 0.08);
      });
    };

    // Schedule multiple loops
    const now = ambientAudioCtx.currentTime;
    for (let loop = 0; loop < 8; loop++) {
      scheduleArpeggio(now + loop * 13);
    }

    // After 8 loops (104s), reschedule if still active
    const rescheduleTimer = setTimeout(() => {
      if (ambientAudioCtx && ambientAudioCtx.state !== 'closed') {
        const t2 = ambientAudioCtx.currentTime;
        for (let loop = 0; loop < 8; loop++) scheduleArpeggio(t2 + loop * 13);
      }
    }, 100000);
    ambientNodes.push({ stop: () => clearTimeout(rescheduleTimer) });

  } catch (e) {
    // Web Audio not available — silent fail, app still works
    console.warn('Heaven music not available:', e.message);
  }
}

function stopHeavenMusic() {
  ambientNodes.forEach(n => {
    try { if (n.stop) n.stop(); } catch(e){}
    try { if (n.disconnect) n.disconnect(); } catch(e){}
  });
  ambientNodes = [];
  if (ambientAudioCtx) {
    try { ambientAudioCtx.close(); } catch(e){}
    ambientAudioCtx = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEAVEN PARTICLE EFFECTS — snow + sparkles falling in the modal background
// ═══════════════════════════════════════════════════════════════════════════════

/*
  startHeavenParticles() — injects a canvas overlay into the ritual sheet
  and animates falling snow + sparkle particles.
  Called when the activity view opens.
  stopHeavenParticles() — removes the canvas and stops animation.
*/
function startHeavenParticles() {
  stopHeavenParticles();
  const sheet = document.querySelector('.ritual-sheet');
  if (!sheet) return;

  const canvas    = document.createElement('canvas');
  canvas.id       = 'heaven-particles';
  canvas.style.cssText = `
    position:fixed;
    top:0;left:0;right:0;bottom:0;
    width:100%;height:100%;
    pointer-events:none;
    z-index:999;
    opacity:0.65;
  `;
  document.body.appendChild(canvas);

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);

  const ctx = canvas.getContext('2d');

  // Create particles — mix of snow + sparkles
  const particles = [];
  const PARTICLE_COUNT = 80;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(makeParticle(W, H, true));
  }

  function makeParticle(W, H, randomY) {
    const isSparkle = Math.random() < 0.3; // 30% sparkles, 70% snow
    return {
      x:       Math.random() * W,
      y:       randomY ? Math.random() * H : -10,
      size:    isSparkle ? Math.random() * 3 + 1.5 : Math.random() * 4 + 2,
      speedY:  isSparkle ? Math.random() * 0.8 + 0.3 : Math.random() * 1.2 + 0.5,
      speedX:  (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.3,
      sparkle: isSparkle,
      wobble:  Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005
    };
  }

  let frame;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p, i) => {
      p.wobble  += p.wobbleSpeed;
      p.x       += p.speedX + Math.sin(p.wobble) * 0.3;
      p.y       += p.speedY;

      if (p.y > H + 10) {
        particles[i] = makeParticle(W, H, false);
        return;
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;

      if (p.sparkle) {
        // Draw 4-point star for sparkles ✦
        ctx.translate(p.x, p.y);
        ctx.rotate(p.wobble);
        ctx.fillStyle = `hsl(${48 + Math.sin(p.wobble) * 20}, 100%, ${80 + Math.sin(p.wobble * 2) * 15}%)`;
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s * 2);
        ctx.lineTo(s * 0.4, -s * 0.4);
        ctx.lineTo(s * 2, 0);
        ctx.lineTo(s * 0.4, s * 0.4);
        ctx.lineTo(0, s * 2);
        ctx.lineTo(-s * 0.4, s * 0.4);
        ctx.lineTo(-s * 2, 0);
        ctx.lineTo(-s * 0.4, -s * 0.4);
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw snow circle with subtle inner glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.5, 'rgba(220,235,255,0.7)');
        grad.addColorStop(1, 'rgba(180,210,255,0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.restore();
    });
    frame = requestAnimationFrame(animate);
  }
  animate();

  // Store cleanup refs
  canvas._ritualCleanup = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
  };
}

function stopHeavenParticles() {
  const existing = document.getElementById('heaven-particles');
  if (existing) {
    if (existing._ritualCleanup) existing._ritualCleanup();
    existing.remove();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE — picks the BEST available voice for en-IN / Telugu / English
// ═══════════════════════════════════════════════════════════════════════════════

/*
  pickBestVoice() → returns the best SpeechSynthesisVoice available.
  Priority: female en-IN > male en-IN > en-GB female > en-US female > any English
  "en-IN" voices handle Tenglish best (English words + Telugu sentence structure).
  Google voices (Google हिन्दी, Google UK English Female) are the most natural.
*/
function pickBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Priority list — Google voices are highest quality
  const priority = [
    v => v.name.includes('Google') && v.lang === 'en-IN',
    v => v.name.includes('Google') && v.lang.startsWith('en'),
    v => v.lang === 'en-IN',
    v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en'),
    v => v.lang === 'en-GB',
    v => v.lang === 'en-US' && v.name.includes('Samantha'),
    v => v.lang === 'en-US',
    v => v.lang.startsWith('en'),
  ];

  for (const check of priority) {
    const found = voices.find(check);
    if (found) return found;
  }
  return voices[0] || null;
}

/*
  speakRitualText(text) → speak the given text with the best voice.
  Cancels any ongoing speech first.
  Returns the utterance so callers can attach onend.
*/
function speakRitualText(text, onDone) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  isSpeaking = false;

  const utterance  = new SpeechSynthesisUtterance(text);
  utterance.lang   = 'en-IN';
  utterance.rate   = 0.82;   // slightly slower — easier to follow
  utterance.pitch  = 1.05;   // slightly warm/bright
  utterance.volume = 1.0;

  // Try to set voice immediately; if voices not loaded yet, wait
  const setVoice = () => {
    const v = pickBestVoice();
    if (v) utterance.voice = v;
  };
  setVoice();
  if (!utterance.voice) {
    window.speechSynthesis.onvoiceschanged = () => {
      setVoice();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }

  utterance.onstart = () => { isSpeaking = true; };
  utterance.onend   = () => { isSpeaking = false; if (onDone) onDone(); };
  utterance.onerror = () => { isSpeaking = false; if (onDone) onDone(); };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/*
  toggleVoicePrompt() — play/pause from the voice button on the activity page.
*/
function toggleVoicePrompt() {
  const dayData = memoryCalendar[ritualCurrentDay];
  if (!dayData) return;
  const btn  = document.getElementById('voiceBtn');
  const icon = document.getElementById('voicePlayIcon');

  if (isSpeaking) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    if (btn)  btn.classList.remove('speaking');
    if (icon) icon.textContent = '▶ Listen Again';
    return;
  }

  if (btn)  btn.classList.add('speaking');
  if (icon) icon.textContent = '⏸ Playing...';

  speakRitualText(dayData.voiceText, () => {
    if (btn)  btn.classList.remove('speaking');
    if (icon) icon.textContent = '▶ Listen Again';
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════
function initRitual() {
  if (typeof isSignedIn === 'undefined' || !isSignedIn) return;
  if (typeof currentUser === 'undefined' || !currentUser) return;

  const saved = ritualLS('completed');
  ritualCompletedDays = saved ? JSON.parse(saved) : [];
  ritualCurrentDay    = getRitualDay();

  const hero = document.getElementById('ritual-hero-banner');
  if (hero) {
    hero.classList.add('show');
    const badge = document.getElementById('rhb-day-badge');
    if (badge) badge.textContent = `Day ${ritualCurrentDay}`;
    const sub = document.getElementById('rhb-sub');
    if (sub) {
      if (isRitualTime()) {
        sub.textContent = `Tonight's ritual is UNLOCKED! ✅ Tap to begin →`;
        sub.style.color = '#2ecc71';
      } else {
        const secs = secondsUntil10PM();
        const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60);
        sub.textContent = `Unlocks in ${h > 0 ? h+'h ' : ''}${m}m • Come back at 10 PM 🌙`;
        sub.style.color = 'rgba(245,239,220,0.6)';
      }
    }
  }

  const entryBtn = document.querySelector('.entry-ritual-btn');
  if (entryBtn) entryBtn.classList.add('show');

  const fab = document.getElementById('ritual-fab');
  if (fab) fab.classList.add('show');
  updateFabState();
  setInterval(updateFabState, 60000);
  if (DEV_MODE) setTimeout(updateDevStatus, 300);
}

function updateFabState() {
  const moon  = document.querySelector('.fab-moon');
  const label = document.querySelector('.fab-label');
  if (!moon || !label) return;
  if (isRitualTime()) {
    moon.classList.add('is-time');
    label.textContent = '10 PM Ritual ✨';
  } else {
    moon.classList.remove('is-time');
    const secs = secondsUntil10PM();
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    label.textContent = h > 0 ? `${h}h ${m}m to 10 PM` : `${m}m to 10 PM`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODAL OPEN / CLOSE
// ═══════════════════════════════════════════════════════════════════════════════
function openRitualModal() {
  if (typeof isSignedIn === 'undefined' || !isSignedIn) {
    if (typeof openSignup === 'function') openSignup();
    return;
  }
  if (!ritualLS('start_date')) {
    ritualLS('start_date', new Date().toISOString().split('T')[0]);
    ritualCurrentDay = 1;
  }
  ritualCurrentDay = getRitualDay();
  const modal = document.getElementById('ritual-modal');
  if (modal) {
    modal.classList.add('show');
    renderRitualModal();
    stopSelfieStream();
  }
}

function closeRitualModal() {
  const modal = document.getElementById('ritual-modal');
  if (modal) modal.classList.remove('show');
  stopSelfieStream();
  stopCountdownTimer();
  stopHeavenMusic();
  stopHeavenParticles();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  isSpeaking = false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RENDER MODAL — main view controller
// ═══════════════════════════════════════════════════════════════════════════════
function renderRitualModal() {
  const sheet = document.querySelector('.ritual-sheet');
  if (!sheet) return;

  const dayData = memoryCalendar[ritualCurrentDay] || memoryCalendar[1];
  const isDone  = ritualCompletedDays.includes(ritualCurrentDay);
  const timeOk  = isRitualTime();
  const pct     = Math.round((ritualCompletedDays.length / 30) * 100);

  let starsHtml = '';
  for (let i = 0; i < 22; i++) {
    const d = (0.5 + Math.random() * 3).toFixed(1);
    starsHtml += `<div class="r-star" style="left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${d}s;animation-delay:${(Math.random()*2).toFixed(1)}s"></div>`;
  }

  let dotsHtml = '';
  for (let i = 1; i <= 30; i++) {
    let cls  = 'j-dot';
    if (ritualCompletedDays.includes(i)) cls += ' done';
    else if (i === ritualCurrentDay)     cls += ' today';
    const icon = ritualCompletedDays.includes(i) ? '✓' : i;
    dotsHtml += `<div class="${cls}">${icon}</div>`;
  }

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

  let contentHtml = '';

  if (!timeOk) {
    // ── COUNTDOWN VIEW ──
    const secs = secondsUntil10PM();
    const hh = Math.floor(secs / 3600);
    const mm = Math.floor((secs % 3600) / 60);
    const ss = secs % 60;
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
          <div class="countdown-msg">Come back at <strong style="color:#f5c842">10:00 PM</strong> tonight 🌙<br>Today is <strong style="color:#f5df8a">Day ${ritualCurrentDay}</strong> of your 30-day journey.</div>
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
    setTimeout(startCountdownTimer, 100);

  } else if (!isDone) {
    // ── CONTINUE SCREEN — shown BEFORE activities open ──
    // User sees the day title + prompt preview, taps "Continue" to start
    const types = Array.isArray(dayData.activityType) ? dayData.activityType : [dayData.activityType];
    const typeLabels = { selfie: '📷 Selfie', textcard: '✍️ Write', drawing: '🎨 Draw' };
    const typePills  = types.map(t => `<span class="continue-type-pill">${typeLabels[t] || t}</span>`).join('');

    contentHtml = `
      <div id="ritual-continue-view" style="padding:0 20px 24px;">
        <!-- Heaven-themed card for the day preview -->
        <div class="continue-card" style="background:${dayData.cardBg || 'linear-gradient(135deg,#0d0520,#150a30)'}">
          <div class="continue-stars-bg" id="continue-stars-bg"></div>
          <div class="continue-inner">
            <div class="continue-day-badge">
              <span class="day-num-pill">Day ${ritualCurrentDay}</span>
              <span class="week-pill">${dayData.week}</span>
            </div>
            <div class="continue-title">${dayData.title}</div>
            <div class="continue-prompt-preview">"${dayData.prompt}"</div>
            <div class="continue-type-row">${typePills}</div>
          </div>
        </div>

        <!-- Auto-playing voice section with replay button -->
        <div class="continue-voice-section">
          <div class="continue-voice-icon">🎙️</div>
          <div class="continue-voice-text" id="continue-voice-status">Reading your prompt...</div>
          <button class="continue-replay-btn" onclick="replayVoicePrompt()" id="continue-replay-btn">
            🔄 Hear Again
          </button>
        </div>

        <!-- The main CTA button -->
        <button class="continue-start-btn ritual-action-btn btn-primary" onclick="openActivityView(${ritualCurrentDay})">
          ✨ I'm Ready — Begin
        </button>

        <div class="journey-strip" style="margin-top:16px">
          <div class="journey-label">Your 30-Day Map</div>
          <div class="journey-dots">${dotsHtml}</div>
        </div>
      </div>`;

  } else {
    // ── COMPLETED VIEW ──
    contentHtml = `
      <div id="ritual-day-view" style="padding:0 20px 20px;">
        <div class="day-completed-card">
          <span class="completed-icon">✅</span>
          <div class="completed-title">Day ${ritualCurrentDay} Complete! 🎉</div>
          <div class="completed-sub">Meeru today's ritual complete chesaru.<br>Tomorrow new memory unlocks! ✨</div>
        </div>
        <div class="journey-strip">
          <div class="journey-label">Your 30-Day Map</div>
          <div class="journey-dots">${dotsHtml}</div>
        </div>
      </div>`;
  }

  sheet.innerHTML = headerHtml + contentHtml;
  sheet.scrollTop = 0;

  // If continue screen — animate stars and auto-speak
  if (timeOk && !isDone) {
    animateContinueStars();
    // Auto-speak the voice prompt after a short delay
    setTimeout(() => {
      const dayData2 = memoryCalendar[ritualCurrentDay];
      if (!dayData2) return;
      const statusEl = document.getElementById('continue-voice-status');
      if (statusEl) statusEl.textContent = '🔊 Listening...';
      speakRitualText(dayData2.voiceText, () => {
        if (statusEl) statusEl.textContent = '✅ Prompt played — tap below to begin';
      });
    }, 800);
  }
}

/* Animate mini twinkling stars inside the continue card */
function animateContinueStars() {
  const bg = document.getElementById('continue-stars-bg');
  if (!bg) return;
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('div');
    s.className = 'continue-star';
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${(Math.random()*3).toFixed(1)}s;animation-duration:${(1.5+Math.random()*2).toFixed(1)}s`;
    bg.appendChild(s);
  }
}

/* Replay the voice prompt from continue screen */
function replayVoicePrompt() {
  const dayData = memoryCalendar[ritualCurrentDay];
  if (!dayData) return;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  isSpeaking = false;

  const statusEl = document.getElementById('continue-voice-status');
  if (statusEl) statusEl.textContent = '🔊 Listening again...';

  speakRitualText(dayData.voiceText, () => {
    if (statusEl) statusEl.textContent = '✅ Done — tap below to begin';
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPEN ACTIVITY VIEW — called when user taps "I'm Ready — Begin"
// ═══════════════════════════════════════════════════════════════════════════════
/*
  openActivityView(day) → replaces the continue screen with the activity UI.
  Also starts heaven particles + music.
  Handles both single activityType string and array of types.
*/
function openActivityView(day) {
  const sheet   = document.querySelector('.ritual-sheet');
  const dayData = memoryCalendar[day] || memoryCalendar[1];
  if (!sheet || !dayData) return;

  // Stop voice from continue screen
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  isSpeaking = false;

  // Start heaven experience
  startHeavenParticles();
  startHeavenMusic();

  // Normalize activityType to always be an array
  const types = Array.isArray(dayData.activityType) ? dayData.activityType : [dayData.activityType];

  let dotsHtml = '';
  for (let i = 1; i <= 30; i++) {
    let cls  = 'j-dot';
    if (ritualCompletedDays.includes(i)) cls += ' done';
    else if (i === ritualCurrentDay)     cls += ' today';
    dotsHtml += `<div class="${cls}">${ritualCompletedDays.includes(i) ? '✓' : i}</div>`;
  }

  // Build each activity module, separated by dividers
  const activitiesHtml = types.map((type, idx) => {
    return `
      ${idx > 0 ? '<div class="activity-divider"><span>✦</span></div>' : ''}
      ${buildSingleActivityHtml(day, dayData, type, idx)}
    `;
  }).join('');

  const activityViewHtml = `
    <div id="ritual-day-view" class="heaven-activity-view">
      <!-- Heaven background glow -->
      <div class="heaven-glow-bg"></div>

      <!-- Day header card -->
      <div class="day-card" style="background:${dayData.cardBg || 'rgba(255,255,255,0.04)'}20;border:1px solid rgba(245,200,66,0.2);border-radius:14px;margin:0 16px 14px;overflow:hidden;position:relative;z-index:1;">
        <div class="day-card-header">
          <div class="day-number-row">
            <span class="day-num-pill">Day ${day}</span>
            <span class="week-pill">${dayData.week}</span>
          </div>
          <div class="day-card-title">${dayData.title}</div>
        </div>
        <div class="day-card-body" style="padding:12px 16px;">
          <!-- Voice replay button — now shows as compact "listen again" -->
          <button class="voice-prompt-btn" id="voiceBtn" onclick="toggleVoicePrompt()" style="margin-bottom:10px;">
            <span class="voice-icon">🔊</span>
            <div class="voice-text-wrap">
              <span class="voice-label">Tonight's Prompt</span>
              <span class="voice-prompt-text">${dayData.voiceText}</span>
            </div>
            <span class="voice-play-icon" id="voicePlayIcon">▶ Listen Again</span>
          </button>
          <div class="activity-label">Tonight's ${types.length > 1 ? 'Activities' : 'Activity'}</div>
          ${activitiesHtml}
        </div>
      </div>

      <div class="journey-strip" style="padding:0 16px 20px;position:relative;z-index:1;">
        <div class="journey-label">Your 30-Day Map</div>
        <div class="journey-dots">${dotsHtml}</div>
      </div>
    </div>`;

  // Replace content in existing sheet (preserve header)
  const existingHeader = sheet.querySelector('.ritual-stars, .ritual-sheet-handle, .ritual-header, .day-progress-bar')?.parentElement;
  // Re-render full sheet with header + activity
  const pct = Math.round((ritualCompletedDays.length / 30) * 100);
  let starsHtml = '';
  for (let i = 0; i < 22; i++) {
    const d = (0.5 + Math.random() * 3).toFixed(1);
    starsHtml += `<div class="r-star" style="left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${d}s;animation-delay:${(Math.random()*2).toFixed(1)}s"></div>`;
  }

  sheet.innerHTML = `
    <div class="ritual-stars">${starsHtml}</div>
    <div class="ritual-sheet-handle"></div>
    <div class="ritual-header">
      <button class="ritual-close-btn" onclick="closeRitualModal()">✕</button>
      <span class="ritual-moon-big">🌙</span>
      <div class="ritual-title">10 PM Memory Ritual</div>
      <div class="ritual-subtitle">Day ${day} of 30 — ${dayData.week}</div>
    </div>
    <div style="padding:0 20px;">
      <div class="day-progress-bar"><div class="day-progress-fill" style="width:${pct}%"></div></div>
    </div>
    ${activityViewHtml}
  `;
  sheet.scrollTop = 0;

  // Init drawing canvases (delayed so DOM is rendered)
  types.forEach((type, idx) => {
    if (type === 'drawing') {
      const canvasId = `drawing-canvas-${idx}`;
      setTimeout(() => initDrawingCanvas(canvasId, idx), 100 + idx * 50);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD SINGLE ACTIVITY HTML
// Each activity gets unique IDs suffixed with _idx to avoid DOM conflicts
// when multiple activities of same or different types are on the same page
// ═══════════════════════════════════════════════════════════════════════════════
function buildSingleActivityHtml(day, data, type, idx) {
  // Unique ID suffix ensures no ID collisions when stacking multiple activities
  const uid = `${type}_${idx}`;

  const promptHtml = `
    <div class="activity-prompt-box">
      ${data.prompt}
    </div>`;

  switch (type) {

    // ── SELFIE ──────────────────────────────────────────────────────────────────
    case 'selfie': return `
      ${promptHtml}
      <div class="selfie-module" id="selfie-module-${idx}">
        <div class="camera-preview-wrap" id="cameraWrap-${idx}">
          <!-- Placeholder shown before camera is opened -->
          <div class="camera-placeholder" id="cameraPlaceholder-${idx}">
            <span>📷</span>
            <p>Tap button below to open camera</p>
          </div>
          <!-- FIX: playsinline + muted required for iOS Safari.
               Without playsinline → "invalid value registry" error.
               Without muted → autoplay blocked on some devices. -->
          <video id="selfie-video-${idx}" autoplay playsinline muted style="display:none;width:100%;height:100%;object-fit:cover;transform:scaleX(-1);"></video>
          <!-- Canvas shows the captured photo — hidden initially -->
          <canvas id="selfie-canvas-${idx}" style="display:none;width:100%;"></canvas>
          <div class="camera-overlay-badge">ScrapDig 🌙 Day ${day}</div>
        </div>
        <div class="selfie-btn-row">
          <!-- FIX: Camera Open button now properly resets state before opening -->
          <button class="ritual-action-btn btn-secondary btn-small" onclick="startCamera(${idx})">📷 Open Camera</button>
          <button class="ritual-action-btn btn-primary btn-small" onclick="captureSelfie(${day}, ${idx})">⚡ Capture!</button>
        </div>
        <!-- Hidden canvas for the export card -->
        <canvas id="export-canvas-${idx}" style="display:none"></canvas>
        <!-- Download area — shown after capture -->
        <div id="selfie-download-area-${idx}" style="display:none;margin-top:12px;">
          <div class="photo-card-preview-label">📸 Your Memory Card</div>
          <div class="photo-card-wrap">
            <canvas id="photo-card-selfie-${idx}" style="width:100%;display:none;border-radius:8px;"></canvas>
          </div>
          <div class="promo-btn-row">
            <button class="ritual-action-btn btn-promo-download btn-small" onclick="downloadPhotoCard('selfie', ${idx}, ${day})">⬇️ Download</button>
            <button class="ritual-action-btn btn-promo-share btn-small" onclick="sharePhotoCard('selfie', ${idx})">📤 Share</button>
          </div>
          <!-- Retake button — FIX: resets canvas + video before opening camera again -->
          <button class="ritual-action-btn btn-secondary" style="margin-top:6px;" onclick="retakeSelfie(${day}, ${idx})">🔄 Retake Photo</button>
          <button class="ritual-action-btn btn-secondary" style="margin-top:6px;" onclick="markDayComplete(${day})">✅ Day ${day} Complete!</button>
        </div>
      </div>`;

    // ── TEXT CARD ────────────────────────────────────────────────────────────────
    case 'textcard': return `
      ${promptHtml}
      <div class="textcard-module">
        <textarea class="memory-textarea" id="memory-text-${idx}" placeholder="Ikkada raayandi... (Telugu or English — mee choice 💛)" maxlength="500"></textarea>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="ritual-action-btn btn-primary btn-small" onclick="generateTextCard(${day}, ${idx})">🎴 Create Card</button>
          <button class="ritual-action-btn btn-secondary btn-small" onclick="clearTextInput(${idx})">🗑️ Clear</button>
        </div>
        <!-- Preview card canvas — shown after generate -->
        <div id="textcard-download-area-${idx}" style="display:none;margin-top:12px;">
          <div class="photo-card-preview-label">📝 Your Memory Card</div>
          <div class="photo-card-wrap">
            <canvas id="photo-card-text-${idx}" style="width:100%;display:none;border-radius:8px;"></canvas>
          </div>
          <div class="promo-btn-row">
            <button class="ritual-action-btn btn-promo-download btn-small" onclick="downloadPhotoCard('text', ${idx}, ${day})">⬇️ Download</button>
            <button class="ritual-action-btn btn-promo-share btn-small" onclick="sharePhotoCard('text', ${idx})">📤 Share</button>
          </div>
          <button class="ritual-action-btn btn-secondary" style="margin-top:6px;" onclick="markDayComplete(${day})">✅ Day ${day} Complete!</button>
        </div>
      </div>`;

    // ── DRAWING ──────────────────────────────────────────────────────────────────
    // FIX: Each drawing canvas has a unique ID (drawing-canvas-${idx})
    // Previously all shared "drawing-canvas" which broke multi-activity days
    case 'drawing': return `
      ${promptHtml}
      <div class="drawing-module" id="drawing-module-${idx}">
        <div class="drawing-toolbar" id="drawing-toolbar-${idx}">
          ${['#1e0e05','#e74c3c','#3498db','#27ae60','#f39c12','#9b59b6','#e91e8c','#ffffff'].map((c,ci) =>
            `<button class="draw-color-btn ${ci === 0 ? 'active' : ''}" style="background:${c}"
              onclick="setDrawColorForCanvas('${c}',this,'drawing-canvas-${idx}')" title="${c}"></button>`
          ).join('')}
          <button class="draw-size-btn active" onclick="setDrawSizeForCanvas(3,this,'drawing-canvas-${idx}')">S</button>
          <button class="draw-size-btn" onclick="setDrawSizeForCanvas(7,this,'drawing-canvas-${idx}')">M</button>
          <button class="draw-size-btn" onclick="setDrawSizeForCanvas(14,this,'drawing-canvas-${idx}')">L</button>
          <button class="draw-clear-btn" onclick="clearDrawingCanvas('drawing-canvas-${idx}')">🗑️</button>
        </div>
        <!-- Unique canvas ID per drawing instance -->
        <canvas id="drawing-canvas-${idx}" height="260" style="width:100%;border-radius:10px;background:#fdf6e3;touch-action:none;cursor:crosshair;display:block;"></canvas>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="ritual-action-btn btn-primary btn-small" onclick="exportDrawingCanvas(${day}, ${idx})">🎴 Export Drawing</button>
        </div>
        <!-- Download area — shown after export -->
        <div id="drawing-download-area-${idx}" style="display:none;margin-top:12px;">
          <div class="photo-card-preview-label">🎨 Your Drawing Card</div>
          <div class="photo-card-wrap">
            <canvas id="photo-card-draw-${idx}" style="width:100%;display:none;border-radius:8px;"></canvas>
          </div>
          <div class="promo-btn-row">
            <button class="ritual-action-btn btn-promo-download btn-small" onclick="downloadPhotoCard('drawing', ${idx}, ${day})">⬇️ Download</button>
            <button class="ritual-action-btn btn-promo-share btn-small" onclick="sharePhotoCard('drawing', ${idx})">📤 Share</button>
          </div>
          <button class="ritual-action-btn btn-secondary" style="margin-top:6px;" onclick="markDayComplete(${day})">✅ Day ${day} Complete!</button>
        </div>
      </div>`;

    default:
      return '<div style="color:rgba(245,239,220,0.4);font-family:Caveat,cursive;text-align:center;padding:20px">Activity loading...</div>';
  }
}

function markDayComplete(day) {
  if (!ritualCompletedDays.includes(day)) {
    ritualCompletedDays.push(day);
    ritualLS('completed', JSON.stringify(ritualCompletedDays));
  }
  stopHeavenMusic();
  stopHeavenParticles();
  showRitualToast(`Day ${day} complete! ✅ Meeru amazing! 💛`);
  setTimeout(renderRitualModal, 600);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════════════════════════
function startCountdownTimer() {
  stopCountdownTimer();
  countdownInterval = setInterval(() => {
    if (isRitualTime()) {
      stopCountdownTimer();
      renderRitualModal();
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

// ═══════════════════════════════════════════════════════════════════════════════
// CAMERA MODULE — with retake fix
// ═══════════════════════════════════════════════════════════════════════════════

/*
  startCamera(idx) — opens front camera for the selfie module at index idx.
  FIX: Before opening, hides any previously captured photo so the preview
  area shows the live video feed (not half-photo/half-video split).
*/
function startCamera(idx) {
  const video       = document.getElementById(`selfie-video-${idx}`);
  const placeholder = document.getElementById(`cameraPlaceholder-${idx}`);
  const captCanvas  = document.getElementById(`selfie-canvas-${idx}`);
  if (!video) return;

  // FIX: Reset state — hide captured photo, clear download area
  if (captCanvas) captCanvas.style.display = 'none';
  const dlArea = document.getElementById(`selfie-download-area-${idx}`);
  if (dlArea) dlArea.style.display = 'none';

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showRitualToast('Camera mee browser lo support ledu 😔 Chrome lo open cheyyandi!');
    return;
  }

  // Stop any existing stream first
  if (selfieStream) {
    selfieStream.getTracks().forEach(t => t.stop());
    selfieStream = null;
  }

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false
  })
  .then(stream => {
    selfieStream = stream;
    try {
      video.srcObject = stream;
    } catch(e) {
      try { video.src = URL.createObjectURL(stream); } catch(e2) {
        showRitualToast('Camera open kaaledu 😔 Chrome latest version try cheyyandi');
        return;
      }
    }
    video.load();
    video.play().catch(() => {});
    video.style.display  = 'block';
    if (placeholder) placeholder.style.display = 'none';
  })
  .catch(err => {
    console.warn('Camera error:', err.name, err.message);
    if (err.name === 'NotAllowedError') showRitualToast('Camera permission ivvandi! Settings lo enable cheyyandi 📷');
    else if (err.name === 'NotFoundError') showRitualToast('Camera found kaaledu on this device 📷');
    else if (err.name === 'NotReadableError') showRitualToast('Camera another app lo use avuthundi. Close it first! 🙈');
    else showRitualToast(`Camera error: ${err.name} — Chrome/HTTPS required`);
  });
}

function stopSelfieStream() {
  if (selfieStream) {
    selfieStream.getTracks().forEach(t => t.stop());
    selfieStream = null;
  }
  isSpeaking = false;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

/*
  captureSelfie(day, idx) — takes photo from camera, draws on canvas.
  Then generates the photo-style promo card.
*/
function captureSelfie(day, idx) {
  const video  = document.getElementById(`selfie-video-${idx}`);
  const canvas = document.getElementById(`selfie-canvas-${idx}`);
  if (!video || !canvas) { showRitualToast('Pehle camera open cheyyandi! 📷'); return; }
  if (!video.srcObject && !video.src) { showRitualToast('Pehle camera open cheyyandi! 📷'); return; }

  canvas.width  = video.videoWidth  || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1); // mirror for selfie feel
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  canvas.style.display = 'block';
  video.style.display  = 'none';
  stopSelfieStream();

  generatePhotoCard('selfie', idx, day);

  const dlArea = document.getElementById(`selfie-download-area-${idx}`);
  if (dlArea) dlArea.style.display = 'block';
  showRitualToast('Captured! ✅ Download cheyyandi 📥');
}

/*
  retakeSelfie(day, idx) — FIX for half-screen bug.
  Resets both the canvas and video elements, then re-opens camera.
  Previously the canvas stayed visible while video also showed = split screen.
*/
function retakeSelfie(day, idx) {
  // Hide the captured photo canvas
  const canvas = document.getElementById(`selfie-canvas-${idx}`);
  if (canvas) {
    canvas.style.display = 'none';
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  // Hide download area
  const dlArea = document.getElementById(`selfie-download-area-${idx}`);
  if (dlArea) dlArea.style.display = 'none';
  // Hide photo card preview
  const photoCard = document.getElementById(`photo-card-selfie-${idx}`);
  if (photoCard) photoCard.style.display = 'none';
  // Show placeholder
  const placeholder = document.getElementById(`cameraPlaceholder-${idx}`);
  if (placeholder) placeholder.style.display = 'flex';
  // Stop any existing stream
  stopSelfieStream();
  // Re-open camera
  startCamera(idx);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT CARD MODULE
// ═══════════════════════════════════════════════════════════════════════════════

function clearTextInput(idx) {
  const ta = document.getElementById(`memory-text-${idx}`);
  if (ta) ta.value = '';
  const dl = document.getElementById(`textcard-download-area-${idx}`);
  if (dl) dl.style.display = 'none';
  const pc = document.getElementById(`photo-card-text-${idx}`);
  if (pc) pc.style.display = 'none';
}

function generateTextCard(day, idx) {
  const ta = document.getElementById(`memory-text-${idx}`);
  if (!ta || !ta.value.trim()) { showRitualToast('Pehle kuch type cheyyandi! ✏️'); return; }
  const text    = ta.value.trim();
  const dayData = memoryCalendar[day] || {};

  // Generate the photo-style card directly
  generatePhotoCard('text', idx, day, text);

  const dl = document.getElementById(`textcard-download-area-${idx}`);
  if (dl) dl.style.display = 'block';
  showRitualToast('Card ready! Download cheyyandi 🎴');
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRAWING MODULE — per-canvas functions with unique IDs
// ═══════════════════════════════════════════════════════════════════════════════

/*
  initDrawingCanvas(canvasId, idx) — sets up the drawing canvas.
  FIX: Takes the canvas ID explicitly, so each multi-activity drawing
  gets its own context stored in drawingCtx[canvasId].
*/
function initDrawingCanvas(canvasId, idx) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  canvas.width  = canvas.offsetWidth || 320;
  canvas.height = 260;
  const ctx     = canvas.getContext('2d');
  drawingCtx[canvasId] = ctx; // store per canvas

  // Cream paper background
  ctx.fillStyle = '#fdf6e3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Ruled lines
  for (let i = 32; i < 260; i += 32) {
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
  }

  // Attach event listeners with canvas context baked in
  const getPos = (e) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const y = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    return { x: (x - rect.left) * scaleX, y: (y - rect.top) * scaleY };
  };

  let drawing = false, lx = 0, ly = 0;

  const onDown = (e) => {
    drawing = true;
    const { x, y } = getPos(e);
    lx = x; ly = y;
    ctx.beginPath();
    ctx.arc(x, y, drawSize/2, 0, Math.PI*2);
    ctx.fillStyle = drawColor;
    ctx.fill();
  };
  const onMove = (e) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lx, ly); ctx.lineTo(x, y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth   = drawSize;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.stroke();
    lx = x; ly = y;
  };
  const onUp   = () => { drawing = false; };
  const onTD   = (e) => { e.preventDefault(); onDown(e); };
  const onTM   = (e) => { e.preventDefault(); onMove(e); };

  canvas.addEventListener('mousedown',  onDown);
  canvas.addEventListener('mousemove',  onMove);
  canvas.addEventListener('mouseup',    onUp);
  canvas.addEventListener('mouseleave', onUp);
  canvas.addEventListener('touchstart', onTD, { passive: false });
  canvas.addEventListener('touchmove',  onTM, { passive: false });
  canvas.addEventListener('touchend',   onUp);
}

function setDrawColorForCanvas(color, btn, canvasId) {
  drawColor = color;
  // Only reset buttons within the same toolbar
  const toolbar = btn.closest('.drawing-toolbar');
  if (toolbar) toolbar.querySelectorAll('.draw-color-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function setDrawSizeForCanvas(size, btn, canvasId) {
  drawSize = size;
  const toolbar = btn.closest('.drawing-toolbar');
  if (toolbar) toolbar.querySelectorAll('.draw-size-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function clearDrawingCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx    = drawingCtx[canvasId];
  if (!canvas || !ctx) return;
  ctx.fillStyle = '#fdf6e3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 32; i < 260; i += 32) {
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
  }
}

function exportDrawingCanvas(day, idx) {
  const canvasId = `drawing-canvas-${idx}`;
  const src      = document.getElementById(canvasId);
  if (!src) return;
  generatePhotoCard('drawing', idx, day);
  const dlArea = document.getElementById(`drawing-download-area-${idx}`);
  if (dlArea) dlArea.style.display = 'block';
  showRitualToast('Drawing exported! Download cheyyandi 🎨');
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHOTO-STYLE DOWNLOAD CARD (NO QR)
// Looks like a Polaroid photo print — user content is the photo, branding below
// ═══════════════════════════════════════════════════════════════════════════════

/*
  generatePhotoCard(type, idx, day, textContent?)
  → Draws a beautiful polaroid/photo-print style card on the output canvas.

  CARD LAYOUT (900 x 1100px):
  ┌─────────────────────────────────────────────────────┐
  │  ░░ white frame top (30px)                          │
  │  ┌───────────────────────────────────────────────┐  │
  │  │                                               │  │
  │  │   USER CONTENT (selfie / text / drawing)      │  │  ← fills most of card
  │  │                                               │  │
  │  └───────────────────────────────────────────────┘  │
  │                                                     │
  │   📅 Day X  ·  [TITLE]  ·  ScrapDig Presents       │  ← polaroid caption zone
  │   💰 Sell waste & earn • 📲 Get ScrapDig on Play   │
  │   scrapdg.com                                       │
  └─────────────────────────────────────────────────────┘

  NO QR code as per request.
*/
function generatePhotoCard(type, idx, day, textContent) {
  const dayData = memoryCalendar[day] || {};

  // Get source canvas
  let srcCanvas;
  if (type === 'selfie')  srcCanvas = document.getElementById(`selfie-canvas-${idx}`);
  if (type === 'text')    srcCanvas = buildTextCanvas(day, idx, textContent || '');
  if (type === 'drawing') srcCanvas = document.getElementById(`drawing-canvas-${idx}`);
  if (!srcCanvas) return;

  // Get output canvas
  let outCanvas;
  if (type === 'selfie')  outCanvas = document.getElementById(`photo-card-selfie-${idx}`);
  if (type === 'text')    outCanvas = document.getElementById(`photo-card-text-${idx}`);
  if (type === 'drawing') outCanvas = document.getElementById(`photo-card-draw-${idx}`);
  if (!outCanvas) return;

  const W  = 900;
  const H  = 1100;
  const FR = 22;  // frame/border width (polaroid white margin)
  const CAPTION_H = 160; // bottom caption zone height

  // Available photo area
  const photoW = W - FR * 2;
  const photoH = H - FR - CAPTION_H - FR; // top frame + bottom caption zone

  outCanvas.width  = W;
  outCanvas.height = H;
  const ctx = outCanvas.getContext('2d');

  // ── 1. OUTER CARD BACKGROUND — warm cream Polaroid color ──
  ctx.fillStyle = '#f8f2e4'; // aged cream
  ctx.fillRect(0, 0, W, H);

  // ── 2. Very subtle grain texture overlay ──
  for (let i = 0; i < H; i += 2) {
    ctx.fillStyle = `rgba(0,0,0,${0.008 + Math.random() * 0.006})`;
    ctx.fillRect(0, i, W, 1);
  }

  // ── 3. Thin inner shadow to make frame look real ──
  const shadowGrad = ctx.createLinearGradient(FR, FR, FR + 8, FR + 8);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.12)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(FR, FR, 8, photoH);
  ctx.fillRect(FR, FR, photoW, 8);

  // ── 4. USER CONTENT drawn inside the photo area ──
  ctx.save();
  ctx.beginPath();
  ctx.rect(FR, FR, photoW, photoH);
  ctx.clip();

  if (type === 'selfie') {
    // Selfie: fill the photo box maintaining aspect ratio, center crop
    const sAR = srcCanvas.width / srcCanvas.height;
    const pAR = photoW / photoH;
    let sw, sh, sx = 0, sy = 0;
    if (sAR > pAR) {
      // source is wider — crop sides
      sh = srcCanvas.height;
      sw = sh * pAR;
      sx = (srcCanvas.width - sw) / 2;
    } else {
      // source is taller — crop top/bottom
      sw = srcCanvas.width;
      sh = sw / pAR;
      sy = (srcCanvas.height - sh) / 2;
    }
    ctx.drawImage(srcCanvas, sx, sy, sw, sh, FR, FR, photoW, photoH);

    // Light vignette overlay for photo look
    const vign = ctx.createRadialGradient(W/2, FR + photoH/2, photoH*0.35, W/2, FR + photoH/2, photoH*0.75);
    vign.addColorStop(0, 'rgba(0,0,0,0)');
    vign.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = vign;
    ctx.fillRect(FR, FR, photoW, photoH);

  } else {
    // Text/drawing: use their natural content + a matching background
    const bg = dayData.cardBg || 'linear-gradient(135deg,#1a0a04,#3d1f0a)';
    const tmpGrad = ctx.createLinearGradient(FR, FR, FR + photoW, FR + photoH);
    // Parse first two colors from gradient string for the background
    const colorMatch = bg.match(/#[0-9a-fA-F]{3,6}/g) || ['#1a0a04','#2a1208'];
    tmpGrad.addColorStop(0, colorMatch[0] || '#1a0a04');
    tmpGrad.addColorStop(1, colorMatch[1] || colorMatch[0] || '#2a1208');
    ctx.fillStyle = tmpGrad;
    ctx.fillRect(FR, FR, photoW, photoH);

    // Draw content canvas centered in photo area
    const srcAR = srcCanvas.width / srcCanvas.height;
    let dw = photoW - 40;
    let dh = dw / srcAR;
    if (dh > photoH - 40) { dh = photoH - 40; dw = dh * srcAR; }
    const dx = FR + (photoW - dw) / 2;
    const dy = FR + (photoH - dh) / 2;

    // Soft card shadow behind the content
    ctx.shadowColor   = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur    = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(dx - 6, dy - 6, dw + 12, dh + 12, 10); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    ctx.drawImage(srcCanvas, dx, dy, dw, dh);
  }
  ctx.restore();

  // ── 5. Day label overlay on photo (top-left corner badge) ──
  const badgePad = FR + 10;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.roundRect(badgePad, badgePad, 120, 28, 14); ctx.fill();
  ctx.fillStyle = '#f5c842';
  ctx.font      = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`✦ Day ${day} of 30`, badgePad + 10, badgePad + 18);

  // ── 6. CAPTION ZONE — the polaroid white area at bottom ──
  const capY = FR + photoH + FR; // top of caption zone

  // Warm caption background
  ctx.fillStyle = '#f8f2e4';
  ctx.fillRect(0, FR + photoH, W, CAPTION_H + FR);

  // Gold accent strip at top of caption zone
  const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
  accentGrad.addColorStop(0, 'transparent');
  accentGrad.addColorStop(0.15, '#f5c842');
  accentGrad.addColorStop(0.85, '#e8913a');
  accentGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, FR + photoH, W, 2);

  const textY1 = capY + 28;
  const textY2 = capY + 56;
  const textY3 = capY + 82;
  const textY4 = capY + 108;
  const textY5 = capY + 132;

  // App name + day title
  ctx.fillStyle = '#2a1208';
  ctx.font      = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(PROMO_APP_NAME + ' Presents', W / 2, textY1);

  ctx.fillStyle = '#1a0a04';
  ctx.font      = 'bold 17px sans-serif';
  ctx.fillText(dayData.title || '', W / 2, textY2);

  // Sell pitch
  ctx.fillStyle = '#8B4513';
  ctx.font      = '14px sans-serif';
  ctx.fillText(PROMO_SELL_LINE, W / 2, textY3);

  // CTA
  ctx.fillStyle = '#1a7a3c';
  ctx.font      = 'bold 14px sans-serif';
  ctx.fillText('📲 ' + PROMO_CTA_LINE, W / 2, textY4);

  // Date + URL
  const dateStr = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  ctx.fillStyle = 'rgba(30,14,5,0.4)';
  ctx.font      = '12px sans-serif';
  ctx.fillText(PROMO_QR_URL + '  •  ' + dateStr, W / 2, textY5);

  // Decorative corner ornaments
  ['left','right'].forEach(side => {
    ctx.fillStyle = 'rgba(245,200,66,0.4)';
    ctx.font      = '18px sans-serif';
    ctx.textAlign = side === 'left' ? 'left' : 'right';
    ctx.fillText('✦', side === 'left' ? FR : W - FR, textY1);
  });

  outCanvas.style.display = 'block';
}

/*
  buildTextCanvas(day, idx, text) — creates an in-memory canvas for the text
  content, which is then used as the "photo" inside generatePhotoCard.
*/
function buildTextCanvas(day, idx, text) {
  const ta   = document.getElementById(`memory-text-${idx}`);
  const body = text || (ta ? ta.value.trim() : '');
  const dayData = memoryCalendar[day] || {};

  const W = 800, H = 500;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  const bgColors = [
    ['#fdf6e3','#f0e6c8'],
    ['#1a0a04','#3d1f0a'],
    ['#0d0520','#150a30'],
    ['#0a1a2a','#1a3050'],
    ['#0a2a0a','#1a5a1a']
  ];
  const [c1, c2] = bgColors[day % bgColors.length];
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, c1); grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const isDark = c1.startsWith('#0') || c1.startsWith('#1');

  // Paper lines
  for (let i = 0; i < H; i += 32) {
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.025)';
    ctx.fillRect(0, i, W, 1);
  }

  // Left accent
  const accents = ['#f5c842','#e8913a','#e74c3c','#27ae60','#3498db'];
  ctx.fillStyle = accents[day % accents.length];
  ctx.fillRect(0, 0, 5, H);

  // Title
  ctx.fillStyle  = isDark ? '#f5df8a' : '#1e0e05';
  ctx.font       = 'bold 28px sans-serif';
  ctx.textAlign  = 'left';
  ctx.fillText(dayData.title || '', 24, 44);

  // Divider
  ctx.fillStyle = isDark ? 'rgba(245,200,66,0.3)' : 'rgba(30,14,5,0.15)';
  ctx.fillRect(24, 58, W - 48, 1);

  // Body text with word wrap
  ctx.fillStyle  = isDark ? 'rgba(245,239,220,0.9)' : '#2a1608';
  ctx.font       = '22px sans-serif';
  const maxW2    = W - 60;
  const lineH    = 36;
  let y          = 100;
  let line       = '';
  for (const w of body.split(' ')) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW2 && line) {
      ctx.fillText(line, 28, y);
      line = w; y += lineH;
      if (y > H - 60) { ctx.fillText('...', 28, y); break; }
    } else { line = test; }
  }
  if (y <= H - 60) ctx.fillText(line, 28, y);

  return canvas;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOWNLOAD & SHARE
// ═══════════════════════════════════════════════════════════════════════════════

function downloadPhotoCard(type, idx, day) {
  let canvas;
  if (type === 'selfie')  canvas = document.getElementById(`photo-card-selfie-${idx}`);
  if (type === 'text')    canvas = document.getElementById(`photo-card-text-${idx}`);
  if (type === 'drawing') canvas = document.getElementById(`photo-card-draw-${idx}`);
  if (!canvas || canvas.width === 0) return;
  triggerDownload(canvas, `ScrapDig_Day${day}_${type}.png`);
  showRitualToast('Download start ayyindi! 📥');
}

async function sharePhotoCard(type, idx) {
  let canvas;
  if (type === 'selfie')  canvas = document.getElementById(`photo-card-selfie-${idx}`);
  if (type === 'text')    canvas = document.getElementById(`photo-card-text-${idx}`);
  if (type === 'drawing') canvas = document.getElementById(`photo-card-draw-${idx}`);
  if (!canvas) return;

  if (!navigator.share) {
    showRitualToast('Download cheyyandi, then WhatsApp lo share cheyyandi! 📲');
    return;
  }
  canvas.toBlob(async (blob) => {
    try {
      const file = new File([blob], `ScrapDig_Memory.png`, { type: 'image/png' });
      await navigator.share({ title: 'My ScrapDig Memory', files: [file] });
    } catch(e) {
      if (e.name !== 'AbortError') showRitualToast('Download → share cheyyandi! 📤');
    }
  }, 'image/png', 0.95);
}

function triggerDownload(canvas, filename) {
  const link    = document.createElement('a');
  link.download = filename;
  link.href     = canvas.toDataURL('image/png', 0.95);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD RITUAL HTML SKELETON — injected once on page load
// ═══════════════════════════════════════════════════════════════════════════════
function buildRitualHTML() {
  // ── Hero banner ──
  const memScreen = document.getElementById('memory-screen');
  if (memScreen) {
    const hero = document.createElement('div');
    hero.id = 'ritual-hero-banner';
    hero.onclick = openRitualModal;
    hero.innerHTML = `
      <div class="rhb-stars" id="rhb-stars"></div>
      <div class="rhb-left">
        <div class="rhb-moon-wrap">
          <span class="rhb-moon">🌙</span>
          <div class="rhb-pulse-ring"></div>
        </div>
        <div class="rhb-text">
          <div class="rhb-eyebrow">✦ 30-Day Personal Archive ✦</div>
          <div class="rhb-title">10 PM Memory Ritual</div>
          <div class="rhb-sub" id="rhb-sub">Mee personal journey starts tonight ✨</div>
        </div>
      </div>
      <div class="rhb-right">
        <div class="rhb-day-badge" id="rhb-day-badge">Day 1</div>
        <div class="rhb-arrow">›</div>
      </div>`;
    const header = memScreen.querySelector('.soil-header');
    if (header && header.nextSibling) memScreen.insertBefore(hero, header.nextSibling);
    else memScreen.prepend(hero);
    const starWrap = hero.querySelector('#rhb-stars');
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('div');
      s.className = 'rhb-star';
      s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${(Math.random()*3).toFixed(1)}s;animation-duration:${(1.5+Math.random()*2).toFixed(1)}s`;
      starWrap.appendChild(s);
    }
  }

  // ── Entry button ──
  const entryContent = document.querySelector('.entry-content');
  if (entryContent) {
    const entryBtn     = document.createElement('button');
    entryBtn.id        = 'ritual-entry-btn';
    entryBtn.className = 'entry-ritual-btn';
    entryBtn.onclick   = openRitualModal;
    entryBtn.innerHTML = `
      <span class="erb-moon">🌙</span>
      <div class="erb-inner">
        <span class="erb-text">10 PM Memory Ritual</span>
        <span class="erb-sub">30-day personal archive journey</span>
      </div>
      <span class="erb-badge">30 Days</span>`;
    const digBtn = entryContent.querySelector('.dig-btn');
    if (digBtn) digBtn.after(entryBtn);
    else entryContent.appendChild(entryBtn);
  }

  // ── FAB ──
  const fab     = document.createElement('div');
  fab.id        = 'ritual-fab';
  fab.onclick   = openRitualModal;
  fab.innerHTML = `<div class="fab-moon">🌙</div><div class="fab-label">10 PM Ritual</div>`;
  document.body.appendChild(fab);

  // ── Toast ──
  const toast = document.createElement('div');
  toast.id    = 'ritual-toast';
  document.body.appendChild(toast);

  // ── Modal ──
  const modal   = document.createElement('div');
  modal.id      = 'ritual-modal';
  modal.onclick = (e) => { if (e.target === modal) closeRitualModal(); };
  modal.innerHTML = `<div class="ritual-sheet"></div>`;
  document.body.appendChild(modal);

  if (DEV_MODE) buildDevPanel();
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEV PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function buildDevPanel() {
  const realH  = new Date().getHours();
  const realM  = new Date().getMinutes();
  const initH  = RITUAL_TEST_HOUR   !== null ? RITUAL_TEST_HOUR   : realH;
  const initM  = RITUAL_TEST_MINUTE !== null ? RITUAL_TEST_MINUTE : realM;
  const initD  = RITUAL_TEST_DAY    !== null ? RITUAL_TEST_DAY    : 1;
  const panel  = document.createElement('div');
  panel.id     = 'ritual-dev-panel';
  panel.innerHTML = `
    <div class="dev-header" onclick="toggleDevPanel()">
      🛠️ Ritual Dev Panel &nbsp;<span style="opacity:0.55;font-size:0.72rem;">DEV_MODE=true — set false before deploy!</span>
      <span id="dev-chevron">▲</span>
    </div>
    <div class="dev-body" id="dev-body">
      <div class="dev-section-title">📅 Day Control</div>
      <div class="dev-row">
        <div class="dev-input-row">
          <input class="dev-input dev-input-sm" id="dev-day-input" type="number" min="1" max="30" value="${initD}">
          <button class="dev-btn dev-btn-gold" onclick="devSetDay()">✅ Set Day</button>
          <button class="dev-btn dev-btn-gray" onclick="devClearDay()">Auto</button>
        </div>
        <div class="dev-day-quick">
          ${[1,4,7,10,15,20,25,28,29,30].map(d =>
            `<button class="dev-quick-btn" onclick="devQuickDay(${d})">D${d}</button>`
          ).join('')}
        </div>
      </div>
      <div class="dev-section-title">🕐 Time Control</div>
      <div class="dev-row">
        <div class="dev-input-row">
          <input class="dev-input dev-input-sm" id="dev-hour-input" type="number" min="0" max="23" value="${initH}">
          <span class="dev-colon">:</span>
          <input class="dev-input dev-input-sm" id="dev-min-input" type="number" min="0" max="59" value="${initM}">
          <button class="dev-btn dev-btn-gold" onclick="devSetTime()">✅ Set</button>
          <button class="dev-btn dev-btn-gray" onclick="devResetTime()">Real</button>
        </div>
        <div class="dev-day-quick">
          <button class="dev-quick-btn" onclick="devQuickTime(21,59)">21:59</button>
          <button class="dev-quick-btn dev-quick-btn-green" onclick="devQuickTime(22,0)">22:00 ✅</button>
          <button class="dev-quick-btn" onclick="devQuickTime(10,0)">10 AM</button>
        </div>
      </div>
      <div class="dev-section-title">🧹 Reset</div>
      <div class="dev-row">
        <div class="dev-input-row">
          <button class="dev-btn dev-btn-red" onclick="devResetProgress()">🗑️ Reset Days</button>
          <button class="dev-btn dev-btn-gray" onclick="devResetStart()">📅 Reset Start</button>
          <button class="dev-btn dev-btn-gold" onclick="openRitualModal()">🌙 Open Modal</button>
        </div>
      </div>
      <div class="dev-status" id="dev-status">Loading...</div>
    </div>`;
  document.body.appendChild(panel);
  setTimeout(updateDevStatus, 1200);
}

function toggleDevPanel() {
  devPanelOpen = !devPanelOpen;
  const body = document.getElementById('dev-body');
  const chev = document.getElementById('dev-chevron');
  if (body) body.style.display = devPanelOpen ? 'block' : 'none';
  if (chev) chev.textContent   = devPanelOpen ? '▲' : '▼';
}

function devSetDay() {
  const v = parseInt(document.getElementById('dev-day-input').value);
  if (isNaN(v) || v < 1 || v > 30) { showRitualToast('1–30 maatre valid!'); return; }
  _devTestDay = ritualCurrentDay = v;
  updateDevStatus();
  const badge = document.getElementById('rhb-day-badge');
  if (badge) badge.textContent = `Day ${v}`;
  showRitualToast(`✅ Day ${v} set!`);
}
function devClearDay() {
  _devTestDay = null;
  ritualCurrentDay = getRitualDay();
  document.getElementById('dev-day-input').value = ritualCurrentDay;
  updateDevStatus();
  showRitualToast(`Auto: Day ${ritualCurrentDay}`);
}
function devQuickDay(d) {
  document.getElementById('dev-day-input').value = d;
  devSetDay();
}
function devSetTime() {
  const h = parseInt(document.getElementById('dev-hour-input').value);
  const m = parseInt(document.getElementById('dev-min-input').value);
  if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) { showRitualToast('Invalid time!'); return; }
  _devTestHour = h; _devTestMinute = m;
  updateDevStatus(); updateFabState();
  const sub = document.getElementById('rhb-sub');
  if (sub) {
    const unlocked = isRitualTime();
    sub.textContent = unlocked ? 'UNLOCKED! ✅ Tap to begin →' : `Unlocks soon 🌙`;
    sub.style.color = unlocked ? '#2ecc71' : 'rgba(245,239,220,0.6)';
  }
  showRitualToast(`⏰ ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} — ${isRitualTime() ? '✅ UNLOCKED' : '⏳ LOCKED'}`);
}
function devResetTime() {
  _devTestHour = _devTestMinute = null;
  const now = new Date();
  document.getElementById('dev-hour-input').value = now.getHours();
  document.getElementById('dev-min-input').value  = now.getMinutes();
  updateDevStatus(); updateFabState();
  showRitualToast('Real time restored ⏰');
}
function devQuickTime(h, m) {
  document.getElementById('dev-hour-input').value = h;
  document.getElementById('dev-min-input').value  = m;
  devSetTime();
}
function devResetProgress() {
  ritualCompletedDays = [];
  ritualLS('completed', '[]');
  updateDevStatus();
  showRitualToast('All days reset! 🧹');
}
function devResetStart() {
  const email = (typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : 'guest';
  try { localStorage.removeItem('ritual_' + email + '_start_date'); } catch(e){}
  ritualCurrentDay = 1; _devTestDay = null;
  document.getElementById('dev-day-input').value = 1;
  updateDevStatus();
  showRitualToast('Start date reset! Next open = Day 1 📅');
}
function updateDevStatus() {
  const el = document.getElementById('dev-status');
  if (!el) return;
  const now       = new Date();
  const useH      = _devTestHour   !== null ? _devTestHour   : now.getHours();
  const useM      = _devTestMinute !== null ? _devTestMinute : now.getMinutes();
  const unlocked  = isRitualTime();
  const start     = ritualLS('start_date') || '— not started —';
  el.innerHTML = `
    <div class="dev-stat"><span>⏰ Active Time</span><strong style="color:${unlocked?'#2ecc71':'#e74c3c'}">${String(useH).padStart(2,'0')}:${String(useM).padStart(2,'0')} — ${unlocked?'✅ UNLOCKED':'⏳ LOCKED'}</strong></div>
    <div class="dev-stat"><span>🗓️ Day</span><strong style="color:#f5c842">Day ${ritualCurrentDay} / 30</strong></div>
    <div class="dev-stat"><span>✅ Done</span><strong>${ritualCompletedDays.length}/30</strong></div>
    <div class="dev-stat"><span>📅 Started</span><strong>${start}</strong></div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════════════════════
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootRitual);
} else {
  setTimeout(bootRitual, 0);
}

function bootRitual() {
  buildRitualHTML();
  setTimeout(() => {
    initRitual();
    const origAfterSignup = window.afterSignupContinue;
    if (origAfterSignup) window.afterSignupContinue = function() { origAfterSignup(); setTimeout(initRitual, 400); };
    const origFinalizeAuth = window.finalizeAuth;
    if (origFinalizeAuth) window.finalizeAuth = function(n, t) { origFinalizeAuth(n, t); setTimeout(initRitual, 400); };
  }, 900);
}