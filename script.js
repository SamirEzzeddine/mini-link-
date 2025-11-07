// ===============================
// Full-System 61-Day Challenge JS
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const boxes = document.querySelectorAll(".checkbox");
  const total = boxes.length;
  const progressBar = document.createElement("div");
  const progressFill = document.createElement("div");
  const progressText = document.createElement("span");
  const motivator = document.createElement("div");

  // ----- Progress Bar -----
  progressBar.style.cssText = `
    width: 100%;
    background: rgba(255,255,255,0.1);
    border-radius: 20px;
    height: 16px;
    margin: 20px 0;
    overflow: hidden;
    position: relative;
  `;
  progressFill.style.cssText = `
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg,#00e676,#00c2ff);
    border-radius: 20px;
    transition: width 0.4s ease;
  `;
  progressText.style.cssText = `
    display: block;
    font-size: 0.9rem;
    color: #00e676;
    text-align: right;
    margin-top: 6px;
    letter-spacing: 0.5px;
  `;
  motivator.style.cssText = `
    font-size: 1rem;
    text-align: center;
    margin: 10px 0 25px;
    color: #00c2ff;
    font-weight: 600;
  `;

  // Insert the tracker below the header
  const header = document.querySelector("header");
  header.insertAdjacentElement("afterend", motivator);
  header.insertAdjacentElement("afterend", progressText);
  header.insertAdjacentElement("afterend", progressBar);
  progressBar.appendChild(progressFill);

  // Load saved states
  boxes.forEach((box, i) => {
    const key = `day_${i}_checked`;
    if (localStorage.getItem(key) === "true") {
      box.classList.add("checked");
    }

    box.addEventListener("click", () => {
      box.classList.toggle("checked");
      localStorage.setItem(key, box.classList.contains("checked"));
      updateProgress();
    });
  });

  // Motivational quotes by progress %
  const quotes = [
    [0, "Let’s start strong — first steps define the path."],
    [10, "Momentum builds discipline. Keep stacking wins."],
    [25, "A quarter done — don’t coast, accelerate."],
    [50, "Halfway. Most people quit here. You won’t."],
    [75, "You’re operating on a different level now."],
    [90, "Discipline > Motivation. Finish what you started."],
    [100, "System complete. You’ve earned every percent."]
  ];

  function updateProgress() {
    const checked = document.querySelectorAll(".checkbox.checked").length;
    const percent = Math.round((checked / total) * 100);
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}% complete (${checked}/${total})`;
    updateMotivator(percent);
  }

  function updateMotivator(percent) {
    const quote = quotes.reduce((acc, [p, q]) => (percent >= p ? q : acc), "");
    motivator.textContent = quote;
  }

  // Initialize display
  updateProgress();
});
