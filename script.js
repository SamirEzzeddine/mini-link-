// Build dynamic structure and persistent behavior
const hourContainer = document.getElementById('hourContainer');
const weekContainer = document.getElementById('weekContainer');
const hourProgress = document.getElementById('hourProgress');
const hourStats = document.getElementById('hourStats');
const weekProgress = document.getElementById('weekProgress');
const weekStats = document.getElementById('weekStats');
const dateDisplay = document.getElementById('dateDisplay');

const today = new Date().toLocaleDateString();
dateDisplay.textContent = `Date: ${today}`;

// --- Generate Hourly Tasks ---
for (let i = 5; i < 29; i++) { // 05:00 to 04:00 next day
  let hour = i % 24;
  let label = `${hour.toString().padStart(2, '0')}:00`;
  const id = `h${hour}`;
  const div = document.createElement('div');
  div.classList.add('hour-item');
  div.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">${label}</label>`;
  hourContainer.appendChild(div);
}

// --- Generate Weekly Tasks (4 per day x 7 days) ---
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
days.forEach((d, i) => {
  for (let t = 1; t <= 4; t++) {
    const id = `${d}${t}`;
    const div = document.createElement('div');
    div.classList.add('week-item');
    div.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">${d} Task ${t}</label>`;
    weekContainer.appendChild(div);
  }
});

// --- LocalStorage Keys ---
const hourKey = `hours-${today}`;
const weekKey = `week-${today}`;
const logKey = `urge-${today}`;

// --- Restore Saved State ---
function restore() {
  const hourData = JSON.parse(localStorage.getItem(hourKey)) || {};
  const weekData = JSON.parse(localStorage.getItem(weekKey)) || {};
  const urgeText = localStorage.getItem(logKey) || '';

  document.querySelectorAll('.hour-item input').forEach((cb) => {
    cb.checked = hourData[cb.id] || false;
  });
  document.querySelectorAll('.week-item input').forEach((cb) => {
    cb.checked = weekData[cb.id] || false;
  });
  document.getElementById('urgeLog').value = urgeText;
  updateProgress();
}

// --- Update Progress ---
function updateProgress() {
  const hourBoxes = document.querySelectorAll('.hour-item input');
  const weekBoxes = document.querySelectorAll('.week-item input');

  const hoursDone = Array.from(hourBoxes).filter(cb => cb.checked).length;
  const weekDone = Array.from(weekBoxes).filter(cb => cb.checked).length;

  hourProgress.value = hoursDone;
  weekProgress.value = weekDone;

  hourStats.textContent = `${hoursDone} / ${hourBoxes.length} hours clean`;
  weekStats.textContent = `${weekDone} / ${weekBoxes.length} tasks complete`;
}

// --- Save State ---
function save() {
  const hourData = {};
  document.querySelectorAll('.hour-item input').forEach(cb => hourData[cb.id] = cb.checked);
  localStorage.setItem(hourKey, JSON.stringify(hourData));

  const weekData = {};
  document.querySelectorAll('.week-item input').forEach(cb => weekData[cb.id] = cb.checked);
  localStorage.setItem(weekKey, JSON.stringify(weekData));

  const urgeText = document.getElementById('urgeLog').value;
  localStorage.setItem(logKey, urgeText);

  updateProgress();
}

// --- Reset Day/Week ---
document.getElementById('resetDay').addEventListener('click', () => {
  if (confirm('Reset all daily checkboxes?')) {
    localStorage.removeItem(hourKey);
    restore();
  }
});

document.getElementById('resetWeek').addEventListener('click', () => {
  if (confirm('Reset all weekly tasks?')) {
    localStorage.removeItem(weekKey);
    restore();
  }
});

// --- Event Listeners ---
document.body.addEventListener('change', save);
document.getElementById('urgeLog').addEventListener('input', save);

// --- Initialize ---
restore();
updateProgress();
