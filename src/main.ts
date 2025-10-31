type N = number;

interface Item {
  id: string;
  name: string;
  cost: N;
  baseCost: N;
  rate: N;
  owned: number;
  description: string;
}

const PRICE_MULTIPLIER = 1.15;

const items: Item[] = [
  {
    id: "tray",
    name: "Sorting Tray (A)",
    cost: 10,
    baseCost: 10,
    rate: 0.1,
    owned: 0,
    description: "Keeps wire bits tidy; +0.1 clips/sec per tray.",
  },
  {
    id: "coil",
    name: "Wire Coil (B)",
    cost: 100,
    baseCost: 100,
    rate: 2.0,
    owned: 0,
    description: "Fresh galvanized coil; +2 clips/sec per coil.",
  },
  {
    id: "bender",
    name: "Auto-Bender (C)",
    cost: 1000,
    baseCost: 1000,
    rate: 50,
    owned: 0,
    description: "Bends perfect paperclips nonstop; +50 clips/sec.",
  },
  {
    id: "line",
    name: "Assembly Line (D)",
    cost: 12000,
    baseCost: 12000,
    rate: 800,
    owned: 0,
    description: "Conveyors & QA cams; +800 clips/sec.",
  },
  {
    id: "foundry",
    name: "Micro-Foundry (E)",
    cost: 180000,
    baseCost: 180000,
    rate: 15000,
    owned: 0,
    description: "Wire-drawing, annealing, the works; +15k clips/sec.",
  },
];

// Step 2: counter and state
let clips = 0;
const clickValue = 1;
let growthRate = 0;

// Correct image import for src/paperclip.png
const paperclipURL = new URL("./paperclip.png", import.meta.url).toString();

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: { class?: string; text?: string } = {},
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (opts.class) e.className = opts.class;
  if (opts.text) e.textContent = opts.text;
  return e;
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 10_000) return (n / 1000).toFixed(1) + "k";
  return n % 1 === 0 ? n.toString() : n.toFixed(2);
}

// Step 1: layout and styling
const style = el("style");
style.textContent = `
  :root { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  body { margin: 0; padding: 24px; background:#0b0d10; color:#e4e7eb; }
  .app { max-width: 760px; margin: 0 auto; display: grid; gap: 16px; }
  h1 { margin: 0 0 6px 0; font-size: 28px; }
  .panel {
    background:#131820; border:1px solid #1d2633; border-radius: 14px; padding:16px;
    box-shadow:0 4px 20px rgba(0,0,0,.25);
  }
  .row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  .grid { display:grid; gap:12px; }
  .mono { font-family: ui-monospace, Menlo, Consolas, monospace; }
  button {
    font-size: 18px; border-radius: 12px; border: 1px solid #243247; padding: 10px 14px;
    background: #182231; color: #d8dee9; cursor: pointer;
  }
  button:disabled { opacity:.55; cursor:not-allowed; }
  .big {
    font-size: 22px; padding: 14px 18px; border-width:2px; display:flex; align-items:center; gap:12px;
    background:#172133; transition: transform .06s ease;
  }
  .big:active { transform: scale(0.98); }
  .icon { width: 42px; height: 42px; }
  .itemRow { display:grid; grid-template-columns: 1fr auto; gap:8px; align-items:center; }
  .itemMeta { font-size:14px; opacity:.85; }
`;
document.head.appendChild(style);

// Step 1: Button creation
const app = el("div", { class: "app" });
document.body.appendChild(app);

const title = el("h1", { text: "Paperclip Farm — Infinite Office Supplies" });
const flavor = el("div");
flavor.innerHTML =
  `Click to bend wire into <b>paperclips</b>, then invest in upgrades to automate production.`;
app.appendChild(title);
app.appendChild(flavor);

const clickBtn = el("button", { class: "big" });
const icon = el("img") as HTMLImageElement;
icon.className = "icon";
icon.src = paperclipURL;
icon.alt = "paperclip";
const label = el("span", { text: "Punch out paperclips" });
clickBtn.appendChild(icon);
clickBtn.appendChild(label);
app.appendChild(clickBtn);

// Step 2: Counter + rate display
const counterPanel = el("div", { class: "panel" });
const counterLine = el("div", { class: "row" });
const clipsLabel = el("div", { class: "mono" });
const rateLabel = el("div", { class: "mono" });
counterLine.append(clipsLabel, rateLabel);
counterPanel.appendChild(counterLine);
app.appendChild(counterPanel);

// Step 6: Upgrade shop
const shop = el("div", { class: "panel grid" });
const shopHeader = el("div");
shopHeader.innerHTML = "<b>Upgrades</b> (buy to increase clips/sec)";
shop.appendChild(shopHeader);

const buyButtons: Record<string, HTMLButtonElement> = {};
const ownedLabels: Record<string, HTMLDivElement> = {};

for (const it of items) {
  const row = el("div", { class: "itemRow" });
  const left = el("div");
  const nm = el("div");
  nm.innerHTML = `<b>${it.name}</b>`;
  const meta = el("div", { class: "itemMeta" });
  meta.textContent = it.description;
  const owned = el("div", { class: "itemMeta mono", text: "Owned: 0" });
  left.append(nm, meta, owned);

  const btn = el("button", { text: "Buy" });
  btn.addEventListener("click", () => {
    if (clips >= it.cost) {
      // Step 5 & Step 7
      clips -= it.cost;
      it.owned += 1;
      growthRate += it.rate;
      it.cost = +(it.cost * PRICE_MULTIPLIER).toFixed(2);
      updateUI();
    }
  });

  row.append(left, btn);
  shop.appendChild(row);
  buyButtons[it.id] = btn;
  ownedLabels[it.id] = owned;
}
app.appendChild(shop);

// Step 2: click interaction
clickBtn.addEventListener("click", () => {
  clips += clickValue;
  updateUI();
});

// Step 4: continuous growth with requestAnimationFrame
let last = performance.now();
function loop(now: number) {
  const dt = (now - last) / 1000;
  last = now;
  clips += growthRate * dt;
  updateUI();
  requestAnimationFrame(loop);
}
requestAnimationFrame((t) => {
  last = t;
  requestAnimationFrame(loop);
});

// Step 6 + 9 + 10: dynamic UI update
function updateUI() {
  clipsLabel.textContent = `🧮 ${fmt(clips)} paperclips`;
  rateLabel.textContent = `• ${fmt(growthRate)} clips/sec`;

  for (const it of items) {
    const btn = buyButtons[it.id];
    const canBuy = clips >= it.cost;
    btn.disabled = !canBuy;
    btn.textContent = canBuy ? `Buy — ${fmt(it.cost)}` : `Need ${fmt(it.cost)}`;
    ownedLabels[it.id].textContent = `Owned: ${it.owned}  •  +${
      fmt(
        it.rate * it.owned,
      )
    } c/s  (each: ${fmt(it.rate)} c/s)`;
  }
}

// Step 2: initial paint
updateUI();
