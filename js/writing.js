const canvas = document.getElementById("writeCanvas");
const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("pointerdown", () => drawing = true);
canvas.addEventListener("pointerup", () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener("pointermove", e => {
  if (!drawing) return;
  ctx.strokeStyle = "#ff8fb6";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

document.getElementById("clearBtn").onclick = () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
};
/* -------------------------------
   元素引用
--------------------------------*/
const writeCanvas = document.getElementById("writeCanvas");
const strokeCanvas = document.getElementById("strokeCanvas");
const gridCanvas = document.getElementById("gridCanvas");

const wctx = writeCanvas.getContext("2d");
const sctx = strokeCanvas.getContext("2d");
const gctx = gridCanvas.getContext("2d");

const hiraTab = document.getElementById("hiraTab");
const kataTab = document.getElementById("kataTab");
const kanaList = document.getElementById("kanaList");
const dailyChar = document.getElementById("dailyChar");
const resultMsg = document.getElementById("resultMsg");

const prevStrokeBtn = document.getElementById("prevStroke");
const nextStrokeBtn = document.getElementById("nextStroke");
const clearBtn = document.getElementById("clearBtn");

/* -------------------------------
   绘图参数 + 压力模拟
--------------------------------*/
let drawing = false;
let lastTime = 0;
let lastX = 0, lastY = 0;
let currentChar = "あ";
let strokeIndex = 0;

/* -------------------------------
   田字格绘制
--------------------------------*/
function drawGrid() {
  gctx.clearRect(0,0,300,300);
  gctx.strokeStyle = "#eee";
  gctx.lineWidth = 2;

  // 外边框
  gctx.strokeRect(10,10,280,280);

  // 中间十字
  gctx.beginPath();
  gctx.moveTo(150,10); 
  gctx.lineTo(150,290);
  gctx.moveTo(10,150);
  gctx.lineTo(290,150);
  gctx.stroke();
}
drawGrid();

/* -------------------------------
   动态笔粗细：速度越快越细
--------------------------------*/
function drawUserLine(e) {
  if (!drawing) return;
  
  const rect = writeCanvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

  const now = performance.now();
  const dt = now - lastTime || 16;
  const dist = Math.hypot(x - lastX, y - lastY);
  const speed = dist / dt;

  let lineWidth = Math.max(2, 10 - speed * 5);

  wctx.lineWidth = lineWidth;
  wctx.lineCap = "round";
  wctx.strokeStyle = "#ff8fb6";

  wctx.lineTo(x, y);
  wctx.stroke();

  lastX = x;
  lastY = y;
  lastTime = now;
}

/* -------------------------------
   笔画动画（逐笔）
--------------------------------*/
function showStroke() {
  const strokes = strokeData[currentChar];
  if (!strokes) return;

  sctx.clearRect(0,0,300,300);
  const path = strokes[strokeIndex];

  sctx.beginPath();
  sctx.lineWidth = 14;
  sctx.lineCap = "round";
  sctx.strokeStyle = "#ccc";

  let i = 0;
  function animate() {
    if (i >= path.length - 1) return;
    sctx.moveTo(path[i][0], path[i][1]);
    sctx.lineTo(path[i+1][0], path[i+1][1]);
    sctx.stroke();
    i++;
    requestAnimationFrame(animate);
  }
  animate();
}

/* -------------------------------
   自动评价手写效果
--------------------------------*/
function evaluateWriting() {
  const img = wctx.getImageData(0,0,300,300).data;

  // 统计非空像素
  let count = 0;
  for (let i = 3; i < img.length; i += 4) {
    if (img[i] > 20) count++;
  }

  if (count > 3000 && count < 15000) {
    resultMsg.textContent = "写得不错！🌸";
  } else {
    resultMsg.textContent = "再试一次！💕";
  }
}

/* -------------------------------
   事件绑定
--------------------------------*/
writeCanvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  resultMsg.textContent = "";
  const rect = writeCanvas.getBoundingClientRect();
  lastX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  lastY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  lastTime = performance.now();
});

writeCanvas.addEventListener("pointerup", () => {
  drawing = false;
  wctx.beginPath();
  evaluateWriting();
});

writeCanvas.addEventListener("pointermove", drawUserLine);

/* -------------------------------
   清除书写
--------------------------------*/
clearBtn.onclick = () => {
  wctx.clearRect(0,0,300,300);
  resultMsg.textContent = "";
};

/* -------------------------------
   笔画切换按钮
--------------------------------*/
nextStrokeBtn.onclick = () => {
  const strokes = strokeData[currentChar];
  if (!strokes) return;
  strokeIndex = (strokeIndex + 1) % strokes.length;
  showStroke();
};

prevStrokeBtn.onclick = () => {
  const strokes = strokeData[currentChar];
  if (!strokes) return;
  strokeIndex = (strokeIndex - 1 + strokes.length) % strokes.length;
  showStroke();
};

/* -------------------------------
   生成可选假名列表
--------------------------------*/
function loadKana(list) {
  kanaList.innerHTML = "";
  list.forEach(k => {
    const el = document.createElement("div");
    el.className = "kana-select";
    el.textContent = k.kana;
    el.onclick = () => {
      currentChar = k.kana;
      strokeIndex = 0;
      wctx.clearRect(0,0,300,300);
      showStroke();
    };
    kanaList.appendChild(el);
  });
}

/* -------------------------------
   今日随机假名
--------------------------------*/
function pickDailyKana() {
  const all = [...kanaData.hiragana, ...kanaData.katakana];
  const index = new Date().getDate() % all.length;
  dailyChar.textContent = all[index].kana;
  currentChar = all[index].kana;
  showStroke();
}
pickDailyKana();

/* -------------------------------
   Tab（平假名/片假名）
--------------------------------*/
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

// 默认载入
loadKana(kanaData.hiragana);
showStroke();
