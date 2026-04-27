/* 获取 Canvas */
const grid = document.getElementById("gridCanvas");
const stroke = document.getElementById("strokeCanvas");
const write = document.getElementById("writeCanvas");

const g = grid.getContext("2d");
const s = stroke.getContext("2d");
const w = write.getContext("2d");

/* ============= 绘制田字格 ============= */
function drawGrid() {
  g.clearRect(0,0,300,300);

  g.strokeStyle = "#e0e0e0";
  g.lineWidth = 2;

  g.strokeRect(10,10,280,280);

  g.beginPath();
  g.moveTo(150,10); g.lineTo(150,290);
  g.moveTo(10,150); g.lineTo(290,150);
  g.stroke();
}
drawGrid();

/* ============= 渲染假名按钮（4×12） ============= */
const buttonsBox = document.getElementById("kanaButtons");
const hiraBtn = document.getElementById("showHira");
const kataBtn = document.getElementById("showKata");

function renderButtons(type) {
  buttonsBox.innerHTML = "";
  kanaData[type].forEach(k => {
    const btn = document.createElement("div");
    btn.className = "kana-btn";
    btn.textContent = k.kana;
    btn.onclick = () => showChar(k.kana);
    buttonsBox.appendChild(btn);
  });
}

hiraBtn.onclick = () => {
  hiraBtn.classList.add("active");
  kataBtn.classList.remove("active");
  renderButtons("hiragana");
};

kataBtn.onclick = () => {
  kataBtn.classList.add("active");
  hiraBtn.classList.remove("active");
  renderButtons("katakana");
};

/* 初始显示平假名按钮 */
renderButtons("hiragana");

/* ============= 显示对应假名的灰色描红 ============= */
function showChar(char) {
  s.clearRect(0,0,300,300);

  const paths = strokeData[char];
  if (!paths) return;

  s.strokeStyle = "rgba(0,0,0,0.2)";
  s.lineWidth = 10;

  paths.forEach(path => {
    for (let i = 0; i < path.length - 1; i++) {
      s.beginPath();
      s.moveTo(path[i][0], path[i][1]);
      s.lineTo(path[i+1][0], path[i+1][1]);
      s.stroke();
    }
  });
}

/* ============= 手写区域 ============= */
let drawing = false, ox = 0, oy = 0;

write.onpointerdown = e => {
  drawing = true;
  w.beginPath();
  const r = write.getBoundingClientRect();
  ox = e.clientX - r.left;
  oy = e.clientY - r.top;
};

write.onpointermove = e => {
  if (!drawing) return;

  const r = write.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  w.lineCap = "round";
  w.lineWidth = 6;
  w.strokeStyle = "#ff8fb6";

  w.lineTo(x, y);
  w.stroke();

  ox = x;
  oy = y;
};

write.onpointerup = () => {
  drawing = false;
  w.beginPath();
};

/* 清除 */
document.getElementById("clearBtn").onclick = () => {
  w.clearRect(0, 0, 300, 300);
};



