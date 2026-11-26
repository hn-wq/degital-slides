"use strict";

const slides = [...document.querySelectorAll(".slide")];
const viewer = document.querySelector(".viewer");
const root = document.documentElement;
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const pageCount = document.querySelector("#page-count");
const announcement = document.querySelector("#announcement");
const indexDialog = document.querySelector("#index-dialog");
const indexList = document.querySelector("#index-list");
const openIndex = document.querySelector("#open-index");
const layoutButton = document.querySelector("#toggle-layout");
const fullscreenButton = document.querySelector("#fullscreen");
const statusMessage = document.querySelector("#status-message");
const readingMedia = matchMedia("(max-width: 700px) and (orientation: portrait)");
const interactiveSelector = "input, select, textarea, [contenteditable], [role=tab], [role=slider]";
const swipeExcluded = interactiveSelector + ", button, a";
const titles = slides.map(slide => {
  const heading = slide.querySelector("h1, h2").cloneNode(true);
  heading.querySelectorAll("br").forEach(lineBreak => lineBreak.replaceWith(" "));
  return heading.textContent.replace(/\s+/g, " ").trim();
});
let current = -1;
let layoutPreference;
let statusTimer;
let swipeStart;

function makeFolio(slide, number) {
  const footer = document.createElement("footer");
  const sectionLabel = document.createElement("span");
  const numberLabel = document.createElement("span");
  footer.className = "folio";
  sectionLabel.textContent = slide.dataset.section || "Local Bridge";
  numberLabel.textContent = `${String(number).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  footer.append(sectionLabel, numberLabel);
  slide.append(footer);
}

const indexButtons = slides.map((slide, index) => {
  makeFolio(slide, index + 1);
  const item = document.createElement("li");
  const button = document.createElement("button");
  const number = document.createElement("span");
  button.type = "button";
  number.textContent = String(index + 1).padStart(2, "0");
  number.setAttribute("aria-hidden", "true");
  button.append(number, document.createTextNode(titles[index]));
  button.addEventListener("click", () => {
    indexDialog.close();
    goTo(index);
  });
  item.append(button);
  indexList.append(item);
  return button;
});

function updateViewport() {
  const reading = !document.fullscreenElement && (layoutPreference ?? readingMedia.matches);
  root.dataset.layout = reading ? "reading" : "presentation";
  layoutButton.setAttribute("aria-pressed", String(reading));
  const layoutLabel = reading ? "16:9表示に切り替え" : "読みやすく表示";
  layoutButton.setAttribute("aria-label", layoutLabel);
  layoutButton.title = layoutLabel;
  layoutButton.querySelector(".button-text").textContent = reading ? "16:9表示" : "読みやすく表示";
  layoutButton.querySelector("use").setAttribute("href", reading ? "#i-fit" : "#i-read");

  const box = getComputedStyle(viewer);
  const width = viewer.clientWidth - parseFloat(box.paddingLeft) - parseFloat(box.paddingRight);
  const height = viewer.clientHeight - parseFloat(box.paddingTop) - parseFloat(box.paddingBottom);
  const base = getComputedStyle(root);
  const canvasWidth = parseFloat(base.getPropertyValue("--width"));
  const canvasHeight = parseFloat(base.getPropertyValue("--height"));
  const scale = Math.max(.05, Math.min(width / canvasWidth, height / canvasHeight));
  root.style.setProperty("--scale", scale);
  root.style.setProperty("--scaled-width", `${canvasWidth * scale}px`);
  root.style.setProperty("--scaled-height", `${canvasHeight * scale}px`);
}

function goTo(index, { writeHash = true } = {}) {
  const target = Math.max(0, Math.min(index, slides.length - 1));
  if (target === current) return;
  const focusedInSlide = current >= 0 && slides[current].contains(document.activeElement);
  slides.forEach((slide, n) => { slide.hidden = n !== target; });
  indexButtons[current]?.removeAttribute("aria-current");
  indexButtons[target].setAttribute("aria-current", "page");
  current = target;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  pageCount.value = `${current + 1} / ${slides.length}`;
  announcement.textContent = `${current + 1}ページ、${titles[current]}`;
  viewer.scrollTop = 0;
  if (focusedInSlide) {
    const heading = slides[current].querySelector("h1, h2");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  if (writeHash) {
    const hash = `#${slides[current].id}`;
    try {
      history.replaceState(null, "", hash);
    } catch {
      window.location.hash = hash;
    }
  }
}

function restoreHash() {
  const target = slides.findIndex(slide => `#${slide.id}` === location.hash);
  goTo(Math.max(0, target), { writeHash: false });
}

previous.addEventListener("click", () => goTo(current - 1));
next.addEventListener("click", () => goTo(current + 1));
openIndex.addEventListener("click", () => {
  indexDialog.showModal();
  indexButtons[current].focus();
});
document.querySelector("#close-index").addEventListener("click", () => indexDialog.close());
indexDialog.addEventListener("click", event => {
  if (event.target !== indexDialog) return;
  const box = indexDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom) indexDialog.close();
});
layoutButton.addEventListener("click", async () => {
  layoutPreference = root.dataset.layout !== "reading";
  if (document.fullscreenElement && layoutPreference) await document.exitFullscreen();
  updateViewport();
  viewer.scrollTop = 0;
});

function showStatus(message) {
  window.clearTimeout(statusTimer);
  statusMessage.textContent = message;
  statusMessage.hidden = false;
  statusTimer = window.setTimeout(() => { statusMessage.hidden = true; }, 6500);
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await root.requestFullscreen();
  } catch {
    showStatus("全画面表示を開始できません。HTMLをブラウザで直接開くか、ブラウザの全画面機能をご利用ください。");
  }
}

fullscreenButton.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", () => {
  const full = Boolean(document.fullscreenElement);
  fullscreenButton.setAttribute("aria-label", full ? "全画面を終了" : "全画面表示");
  fullscreenButton.title = full ? "全画面を終了（Esc）" : "全画面表示（F）";
  fullscreenButton.querySelector(".button-text").textContent = full ? "全画面を終了" : "全画面";
  fullscreenButton.querySelector("use").setAttribute("href", full ? "#i-exit-full" : "#i-full");
  updateViewport();
  if (full) document.activeElement?.blur();
});

document.addEventListener("keydown", event => {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey ||
      indexDialog.open || event.target.closest?.(interactiveSelector)) return;
  switch (event.key) {
    case "ArrowRight": goTo(current + 1); break;
    case "ArrowLeft": goTo(current - 1); break;
    case " ":
      if (event.target.closest?.("button, a, summary")) return;
      goTo(current + 1);
      break;
    case "Home": goTo(0); break;
    case "End": goTo(slides.length - 1); break;
    case "F":
    case "f": toggleFullscreen(); break;
    default: return;
  }
  event.preventDefault();
});

viewer.addEventListener("touchstart", event => {
  swipeStart = null;
  if (event.touches.length !== 1 || event.target.closest?.(swipeExcluded)) return;
  const touch = event.touches[0];
  swipeStart = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
}, { passive: true });
viewer.addEventListener("touchend", event => {
  if (!swipeStart) return;
  const start = swipeStart;
  swipeStart = null;
  const touch = [...event.changedTouches].find(candidate => candidate.identifier === start.id);
  if (!touch) return;
  const dx = touch.clientX - start.x;
  const dy = touch.clientY - start.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > 1.55 * Math.abs(dy)) goTo(current + (dx < 0 ? 1 : -1));
}, { passive: true });
viewer.addEventListener("touchcancel", () => { swipeStart = null; }, { passive: true });
window.addEventListener("hashchange", restoreHash);
window.addEventListener("resize", updateViewport);
readingMedia.addEventListener("change", updateViewport);
new ResizeObserver(() => requestAnimationFrame(updateViewport)).observe(viewer);

document.querySelectorAll(".compare-table tbody tr").forEach(row => {
  const serviceLabels = ["ChatGPT", "Gemini", "Claude"];
  row.querySelectorAll("td").forEach((cell, index) => { cell.dataset.service = serviceLabels[index]; });
});

const scenarioTabs = [...document.querySelectorAll(".scenario-tabs [role=tab]")];
function activateScenario(selected, focus = false) {
  scenarioTabs.forEach((tab, index) => {
    const active = index === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
    if (active && focus) tab.focus();
  });
}
scenarioTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateScenario(index));
  tab.addEventListener("keydown", event => {
    let newIndex;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight": newIndex = (index + 1) % scenarioTabs.length; break;
      case "ArrowUp":
      case "ArrowLeft": newIndex = (index + scenarioTabs.length - 1) % scenarioTabs.length; break;
      case "Home": newIndex = 0; break;
      case "End": newIndex = scenarioTabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    activateScenario(newIndex, true);
  });
});

const number = new Intl.NumberFormat("ja-JP");
const simInputs = [
  { range: document.querySelector("#monthly-cost"), out: document.querySelector("#cost-label"), unit: "円" },
  { range: document.querySelector("#days-used"), out: document.querySelector("#days-label"), unit: "日" },
  { range: document.querySelector("#minutes-saved"), out: document.querySelector("#minutes-label"), unit: "分" }
];
const savedResult = document.querySelector("#saved-result");
const savedUnit = document.querySelector("#saved-unit");
const hourlyResult = document.querySelector("#hourly-result");
const hourlyUnit = document.querySelector("#hourly-unit");

function updateEstimate() {
  const [cost, days, dailyMinutes] = simInputs.map(({ range, out, unit }) => {
    const value = range.valueAsNumber;
    out.value = `${number.format(value)} ${unit}`;
    range.setAttribute("aria-valuetext", `${number.format(value)}${unit}`);
    return value;
  });

  const totalMinutes = days * dailyMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  savedResult.textContent = hours ? number.format(hours) : String(minutes);
  savedUnit.textContent = hours ? (minutes ? `時間 ${minutes}分` : "時間") : "分";
  hourlyResult.textContent = totalMinutes ? number.format(Math.round(cost * 60 / totalMinutes)) : "—";
  hourlyUnit.textContent = totalMinutes ? "円" : "短縮時間が0のため算出なし";
}

simInputs.forEach(({ range }) => range.addEventListener("input", updateEstimate));
updateEstimate();
updateViewport();
restoreHash();

