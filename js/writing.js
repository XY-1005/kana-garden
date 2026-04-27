/* ========== Canvas 获取 ========== */
const grid = document.getElementById("gridCanvas");
const stroke = document.getElementById("strokeCanvas");
const write = document.getElementById("writeCanvas");

const g = grid.getContext("2d");
const s = stroke.getContext("2d");
const w = write.getContext("2d");

let currentChar = "あ";
let strokeIndex = 0;
let drawing = false;
let ox = 0, oy = 0;
let lastTime = 0;
let autoPlayOn = false;
let mode = "brush";
let brushColor = "#ff8fb6";

/* ========== 田字格 ========== */
function drawGrid() {
  g.clearRect(0, 0, 300, 300);
  g.strokeStyle = "#ddd";
  g.lineWidth = 2;
  g.strokeRect(10, 10, 280, 280);
  g.beginPath();
  g.moveTo(150, 10); g.lineTo(150, 290);
  g.moveTo(10, 150); g.lineTo(290, 150);
  g.stroke();
}
drawGrid();

/* ========== 坐标统一（手机 + PC） ========== */
function getPos(e) {
  const r = write.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - r.left,
      y: e.touches[0].clientY - r.top,
    };
  }
  return { x: e.offsetX, y: e.offsetY };
}

/* ========== 动态笔尖（速度越快越细） ========== */
function draw(e) {
  if (!drawing) return;

  const now = performance.now();
  const { x, y } = getPos(e);

  const dt = now - lastTime || 16;
  const dist = Math.hypot(x - ox, y - oy);
  const speed = dist / dt;

  const width = Math.max(2, 10 - speed * 3);

  w.lineWidth = width;
  w.lineCap = "round";
  w.strokeStyle = mode === "eraser" ? "white" : brushColor;
  w.globalCompositeOperation =
    mode === "eraser" ? "destination-out" : "source-over";

  w.lineTo(x, y);
  w.stroke();

  ox = x;
  oy = y;
  lastTime = now;
}

/* ========== 书写事件 ========== */
write.addEventListener("pointerdown", (e) => {
  drawing = true;
  w.beginPath();
  const { x, y } = getPos(e);
  ox = x;
  oy = y;
  lastTime = performance.now();
});

write.addEventListener("pointermove", draw);
write.addEventListener("pointerup", () => {
  drawing = false;
  w.beginPath();
  evaluate();
});

/* ========== 清除 ========== */
clearBtn.onclick = () => {
  w.clearRect(0, 0, 300, 300);
  resultMsg.textContent = "";
};

/* ========== 显示笔画 ========== */
function showStroke() {
  s.clearRect(0, 0, 300, 300);

  const strokes = strokeData[currentChar];
  if (!strokes) return;

  const path = strokes[strokeIndex];

  s.lineWidth = 12;
  s.lineCap = "round";
  s.strokeStyle = "#ccc";

  let i = 0;

  function step() {
    if (i >= path.length - 1) return;
    s.beginPath();
    s.moveTo(path[i][0], path[i][1]);
    s.lineTo(path[i + 1][0], path[i + 1][1]);
    s.stroke();
    i++;
    requestAnimationFrame(step);
  }

  step();
}

/* ========== 笔画切换 ========== */
prevStroke.onclick = () => {
  const total = strokeData[currentChar].length;
  strokeIndex = (strokeIndex - 1 + total) % total;
  showStroke();
};

nextStroke.onclick = () => {
  const total = strokeData[currentChar].length;
  strokeIndex = (strokeIndex + 1) % total;
  showStroke();
};

/* ========== 自动描红 ========== */
autoPlay.onclick = () => {
  autoPlayOn = !autoPlayOn;
  autoPlay.textContent = autoPlayOn ? "停止" : "自动描红";

  if (autoPlayOn) autoPlayLoop();
};

function autoPlayLoop() {
  if (!autoPlayOn) return;
  nextStroke.click();
  setTimeout(autoPlayLoop, 700);
}

/* ========== 自动评分 ========== */
function evaluate() {
  const img = w.getImageData(0, 0, 300, 300).data;

  let count = 0;
  for (let i = 3; i < img.length; i += 4)
    if (img[i] > 40) count++;

  resultMsg.textContent =
    count > 2000 && count < 18000 ? "写得不错！🌸" : "再试试结构～💕";
}

/* ========== 假名选择 ========== */
function loadKana(list) {
  kanaList.innerHTML = "";

  list.forEach((k) => {
    const d = document.createElement("div");
    d.textContent = k.kana;
    d.onclick = () => {
      currentChar = k.kana;
      strokeIndex = 0;
      w.clearRect(0, 0, 300, 300);
      showStroke();
    };
    kanaList.appendChild(d);
  });
}

/* ========== 平 / 片假名 ========== */
hiraTab.onclick = () => {
  hiraTab.classList.add("active");
  kataTab.classList.remove("active");
  loadKana(kanaData.hiragana);
};
kataTab.onclick = () => {
  kataTab.classList.add("active");
  hiraTab.classList.remove("active");
  loadKana(kanaData.katakana);
};

/* ========== 模式 ========== */
brushMode.onclick = () => (mode = "brush");
eraserMode.onclick = () => (mode = "eraser");
colorPick.onclick = () => {
  const c = prompt("颜色代码：", brushColor);
  if (c) brushColor = c;
};

/* ========== 导出 PNG ========== */
downloadBtn.onclick = () => {
  const url = write.toDataURL();
  const a = document.createElement("a");
  a.href = url;
  a.download = `kana-${currentChar}.png`;
  a.click();
};

/* ========== 今日假名 ========== */
function setDaily() {
  const all = [...kanaData.hiragana, ...kanaData.katakana];
  const idx = new Date().getDate() % all.length;
  dailyChar.textContent = all[idx].kana;
  currentChar = all[idx].kana;
  showStroke();
}

setDaily();
loadKana(kanaData.hiragana);

