// Handle checkbox clicks + save state
document.addEventListener("DOMContentLoaded", () => {
  const boxes = document.querySelectorAll(".checkbox");

  boxes.forEach((box, i) => {
    const key = `day_${i}_checked`;
    if (localStorage.getItem(key) === "true") {
      box.classList.add("checked");
    }

    box.addEventListener("click", () => {
      box.classList.toggle("checked");
      localStorage.setItem(key, box.classList.contains("checked"));
    });
  });
});
