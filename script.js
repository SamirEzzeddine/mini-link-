/* Phase 1 — tailored to Samir's windows and 2-week progression
   - Morning (05:00–07:30) + Evening (19:00–22:00) task cards
   - Week 1 (days 1–7) vs Week 2 (days 8–14) plan
   - 24h board with non-free hours disabled
   - Day counters, progress bars, persistence per day
*/
const hour = new Date().getHours();
const isDay = hour >= 6 && hour < 18;
document.body.classList.add(isDay ? 'day-theme' : 'night-theme');
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

// --- Phase dates ---
const todayISO = new Date().toISOString().slice(0,10);
const PHASE_KEY = 'p1-start-date';
let startDate = localStorage.getItem(PHASE_KEY);
if (!startDate) {
  startDate = todayISO; // auto-start today
  localStorage.setItem(PHASE_KEY, startDate);
}
const dayIndex = Math.min(14, Math.max(1, diffDays(startDate, todayISO) + 1));
const currentWeek = dayIndex <= 7 ? 1 : 2;

// UI meta
$('#dateDisplay').textContent = `Date: ${new Date().toLocaleDateString()}`;
$('#dayOf14').textContent = `Day ${dayIndex}/14`;
$('#restartPhase').addEventListener('click', () => {
  if (confirm('Restart Phase 1 from today? This clears current week/day data.')) {
    localStorage.setItem(PHASE_KEY, todayISO);
    window.location.reload();
  }
});

// --- Plans ---
const morningPlan = {
  1: [
    ['wake', 'Wake, hydrate 500ml'],
    ['cold', 'Cold shower / face splash'],
    ['plan3', 'Write 3 priorities (no phone)'],
    ['deep60', 'Deep work 60 min (no music)'],
    ['walk10', '10-min sunlight walk'],
  ],
  2: [
    ['wake', 'Wake, hydrate 500ml'],
    ['cold_long', 'Cold 60–90 sec'],
    ['focus90', 'Deep work 90 min (single task)'],
    ['protein', 'Protein breakfast'],
    ['review', '5-min plan review'],
  ],
};

const eveningPlan = {
  1: [
    ['train', 'Training: gym/run/bodyweight (sweat)'],
    ['meal', 'Protein + fats (no sugar)'],
    ['social', '1 real-world conversation'],
    ['journal', 'Journal urges, wins, lesson'],
    ['screens', 'Screens off after 21:00'],
  ],
  2: [
    ['train_harder', 'Training + small PR (weight/reps)'],
    ['skill', 'Skill block 45–60 min (create/learn)'],
    ['social_deeper', 'Deeper convo: ask, listen, share'],
    ['meditate', '10-min breathing/meditation'],
    ['shutdown', 'Shutdown ritual + prepare clothes'],
  ],
};

// Weekly engineering (4 tasks × 7 days)
const weekPlan = {
  1: { // Purge
    title: 'Week 1 — Purge (strip cheap dopamine, survive boredom, build baseline)',
    days: [
      ['No addiction/edging all day', 'Cold exposure (30–60s)', 'Deep work 60m', 'Journal at 21:00'],
      ['No scrolling', '10,000 steps / long walk', 'Protein-focused meals', 'Lights out by 22:00'],
      ['No sugar binges', 'Deep work 90m (one task)', 'Leave phone outside room', 'Urge log 1+ entry'],
      ['No music during focus', 'Bodyweight circuit 20m', 'Sunlight 20m', 'Journal triggers'],
      ['No gaming/streaming', 'Skill practice 30m', 'Tidy room 10m', 'Lights out by 22:00'],
      ['No dopamine stacking', 'Gym/run hard', 'Read 20 pages (paper/Kindle)', 'Reflect: 3 wins'],
      ['Full review of week', 'Nature time 30m', 'Prep next week tasks', 'Gratitude x3'],
    ]
  },
  2: { // Replace
    title: 'Week 2 — Replace (effort dopamine, creation, social calibration)',
    days: [
      ['No addiction/edging all day', 'Cold exposure 90–120s', 'Deep work 90m', 'Journal at 21:00'],
      ['No scrolling', 'Skill project 60m (output)', 'Heavy training / PR', 'No screens after 21:00'],
      ['Low sugar day', 'Two focus blocks (60m + 60m)', 'One difficult convo', 'Urge log 2+ entries'],
      ['Minimal music', 'Walk 20m phone-free', 'Write 300+ words', 'Sleep 7–8h'],
      ['No streaming', 'Skill project 60m (ship something)', 'Tidy desk 10m', 'Reflect: mistakes → fix'],
      ['No stacking', 'Gym/run intervals', 'Read 30 pages', 'Plan next week'],
      ['Full review (W2)', 'Nature 30m', 'Identity statement rewrite', 'Gratitude x3'],
    ]
  }
};

// --- Containers ---
const hourContainer = $('#hourContainer');
const weekContainer = $('#weekContainer');
const morningTasks = $('#morningTasks');
const eveningTasks = $('#eveningTasks');

// --- Keys for today ---
const hourKey   = `p1-hours-${todayISO}`;
const weekKey   = `p1-week-${weekNumberKey()}`;      // week scope
const morningKey= `p1-morning-${todayISO}`;
const eveningKey= `p1-evening-${todayISO}`;
const logKey    = `p1-urge-${todayISO}`;

// --- Build morning/evening cards based on week ---
buildTaskGroup(morningTasks, morningPlan[currentWeek], 'morning', morningKey);
buildTaskGroup(eveningTasks, eveningPlan[currentWeek], 'evening', eveningKey);
$('#weekTitle').textContent = weekPlan[currentWeek].title;
buildWeekBoard(weekPlan[currentWeek]);

// --- Build 24h board (disable non-free hours; include 07:30) ---
buildHourBoard();

// --- Restore saved state + listeners ---
restoreAll();
bindListeners();

// --- Progress updates on load ---
updateAllProgress();

/* ---------- functions ---------- */

function diffDays(aISO, bISO){
  const a = new Date(aISO + 'T00:00:00');
  const b = new Date(bISO + 'T00:00:00');
  return Math.round((b - a)/(1000*60*60*24));
}

function weekNumberKey(){
  // tie week data to phase start week (1 or 2)
  return `${localStorage.getItem(PHASE_KEY)}-w${currentWeek}`;
}

function buildTaskGroup(container, planArray, prefix, storageKey){
  container.innerHTML = '';
  planArray.forEach(([id, label]) => {
    const div = document.createElement('div');
    div.className = 'hour-item'; // reuse style
    const fullId = `${prefix}-${id}`;
    div.innerHTML = `<input type="checkbox" id="${fullId}" data-scope="${prefix}">
                     <label for="${fullId}">${label}</label>`;
    container.appendChild(div);
  });
}

function buildWeekBoard(plan){
  weekContainer.innerHTML = '';
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  // 7 columns, 4 tasks each
  plan.days.forEach((taskList, i) => {
    const col = document.createElement('div');
    col.className = 'week-item';
    col.style.flexDirection = 'column';
    col.style.alignItems = 'stretch';
    col.style.width = '100%';
    const title = document.createElement('div');
    title.style.marginBottom = '6px';
    title.innerHTML = `<strong>${days[i]}</strong>`;
    col.appendChild(title);

    taskList.forEach((task, j) => {
      const id = `wk-${currentWeek}-${i}-${j}`;
      const row = document.createElement('div');
      row.className = 'week-item';
      row.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">${task}</label>`;
      col.appendChild(row);
    });

    weekContainer.appendChild(col);
  });
}

function buildHourBoard(){
  hourContainer.innerHTML = '';
  const free = [
    {h:5,label:'05:00'}, {h:6,label:'06:00'}, {h:7,label:'07:00'},
    {h:'7-30',label:'07:30'}, // half-hour slot
    {h:19,label:'19:00'}, {h:20,label:'20:00'}, {h:21,label:'21:00'}, {h:22,label:'22:00'}
  ];
  const freeIds = new Set(free.map(x => `h-${x.h}`));

  for (let i=0;i<24;i++){
    const id = `h-${i}`;
    const div = document.createElement('div');
    div.className = 'hour-item';
    const isFree = freeIds.has(id);
    div.innerHTML = `<input type="checkbox" id="${id}" ${isFree?'':'disabled'}>
                     <label for="${id}">${String(i).padStart(2,'0')}:00 ${isFree?'':'(locked)'}</label>`;
    hourContainer.appendChild(div);
    // special 07:30
    if (i===7){
      const divHalf = document.createElement('div');
      divHalf.className = 'hour-item';
      divHalf.innerHTML = `<input type="checkbox" id="h-7-30">
                           <label for="h-7-30">07:30 (last 30 min)</label>`;
      hourContainer.appendChild(divHalf);
    }
  }
}

function restoreAll(){
  // Morning
  const mData = JSON.parse(localStorage.getItem(morningKey) || '{}');
  $$('#morningTasks input').forEach(cb => cb.checked = !!mData[cb.id]);

  // Evening
  const eData = JSON.parse(localStorage.getItem(eveningKey) || '{}');
  $$('#eveningTasks input').forEach(cb => cb.checked = !!eData[cb.id]);

  // Week
  const wData = JSON.parse(localStorage.getItem(weekKey) || '{}');
  $$('#weekContainer input').forEach(cb => cb.checked = !!wData[cb.id]);

  // Hours
  const hData = JSON.parse(localStorage.getItem(hourKey) || '{}');
  $$('#hourContainer input').forEach(cb => cb.checked = !!hData[cb.id]);

  // Urge log
  $('#urgeLog').value = localStorage.getItem(logKey) || '';
}

function bindListeners(){
  // Save on any change
  document.body.addEventListener('change', () => {
    // Morning
    const m = {};
    $$('#morningTasks input').forEach(cb => m[cb.id] = cb.checked);
    localStorage.setItem(morningKey, JSON.stringify(m));

    // Evening
    const e = {};
    $$('#eveningTasks input').forEach(cb => e[cb.id] = cb.checked);
    localStorage.setItem(eveningKey, JSON.stringify(e));

    // Week
    const w = {};
    $$('#weekContainer input').forEach(cb => w[cb.id] = cb.checked);
    localStorage.setItem(weekKey, JSON.stringify(w));

    // Hours
    const h = {};
    $$('#hourContainer input').forEach(cb => h[cb.id] = cb.checked);
    localStorage.setItem(hourKey, JSON.stringify(h));

    updateAllProgress();
  });

  // Urge log
  $('#urgeLog').addEventListener('input', () => {
    localStorage.setItem(logKey, $('#urgeLog').value);
  });

  // Reset buttons
  $('#resetDay').addEventListener('click', () => {
    if (confirm('Reset MORNING, EVENING, and 24h checkboxes for today?')) {
      localStorage.removeItem(morningKey);
      localStorage.removeItem(eveningKey);
      localStorage.removeItem(hourKey);
      restoreAll();
      updateAllProgress();
    }
  });
  $('#resetWeek').addEventListener('click', () => {
    if (confirm('Reset WEEK tasks for current week?')) {
      localStorage.removeItem(weekKey);
      restoreAll();
      updateAllProgress();
    }
  });
}

function updateAllProgress(){
  // Morning
  const mBoxes = $$('#morningTasks input');
  const mDone = [...mBoxes].filter(cb => cb.checked).length;
  $('#morningProgress').max = mBoxes.length;
  $('#morningProgress').value = mDone;
  $('#morningStats').textContent = `${mDone} / ${mBoxes.length} complete`;

  // Evening
  const eBoxes = $$('#eveningTasks input');
  const eDone = [...eBoxes].filter(cb => cb.checked).length;
  $('#eveningProgress').max = eBoxes.length;
  $('#eveningProgress').value = eDone;
  $('#eveningStats').textContent = `${eDone} / ${eBoxes.length} complete`;

  // Week
  const wBoxes = $$('#weekContainer input');
  const wDone = [...wBoxes].filter(cb => cb.checked).length;
  $('#weekProgress').max = wBoxes.length || 28;
  $('#weekProgress').value = wDone;
  $('#weekStats').textContent = `${wDone} / ${wBoxes.length} tasks complete`;

  // 24h
  const hBoxes = $$('#hourContainer input');
  const hDone = [...hBoxes].filter(cb => cb.checked).length;
  $('#hourProgress').max = hBoxes.length;
  $('#hourProgress').value = hDone;
  $('#hourStats').textContent = `${hDone} / ${hBoxes.length} hours clean`;
}
