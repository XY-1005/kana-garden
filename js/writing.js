/* ========== Canvas 获取 ========== */
const grid = document.getElementById("gridCanvas");
const stroke = document.getElementById("strokeCanvas");
const write = document.getElementById("writeCanvas");

const g = grid.getContext("2d");
const s = stroke.getContext("2d");
const w = write.getContext("2d");

/* ========== 假名切换按钮 ========== */
const kanaListDiv = document.getElementById("kanaList");
document.getElementById("hiraBtn").onclick = () => showKana("hiragana");
document.getElementById("kataBtn").onclick = () => showKana("katakana");

function showKana(type){
  kanaListDiv.classList.remove("hidden");
  kanaListDiv.innerHTML = "";

  (kanaData[type]).forEach(k => {
    const d = document.createElement("div");
    d.textContent = k.kana;
    d.onclick = () => drawStroke(k.kana);
    kanaListDiv.appendChild(d);
  });
}

/* ========== 田字格绘制 ========== */
function drawGrid(){
  g.clearRect(0,0,300,300);
  g.strokeStyle="#eee";
  g.lineWidth=2;

  g.strokeRect(10,10,280,280);

  g.beginPath();
  g.moveTo(150,10); g.lineTo(150,290);
  g.moveTo(10,150); g.lineTo(290,150);
  g.stroke();
}
drawGrid();

/* ========== 显示字帖描红 (灰色) ========== */
function drawStroke(char){
  s.clearRect(0,0,300,300);

  const strokes = strokeData[char];
  if(!strokes) return;

  s.strokeStyle="#ccc";
  s.lineWidth=12;
  s.lineCap="round";

  strokes.forEach(path=>{
    for(let i=0;i<path.length-1;i++){
      s.beginPath();
      s.moveTo(path[i][0],path[i][1]);
      s.lineTo(path[i+1][0],path[i+1][1]);
      s.stroke();
    }
  });
}

/* ========== 手写（带压力系统） ========== */
let drawing = false;
let ox = 0, oy = 0;
let lastTime = 0;

write.addEventListener("pointerdown", e=>{
  drawing = true;
  w.beginPath();
  const rect = write.getBoundingClientRect();
  ox = e.clientX - rect.left;
  oy = e.clientY - rect.top;
  lastTime = performance.now();
});

write.addEventListener("pointermove", e=>{
  if(!drawing) return;

  const now = performance.now();
  const rect = write.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const dt = now - lastTime || 16;
  const dist = Math.hypot(x - ox, y - oy);
  const speed = dist / dt;

  const width = Math.max(2, 10 - speed * 3);

  w.lineWidth = width;
  w.lineCap="round";
  w.strokeStyle="#ff8fb6";

  w.lineTo(x,y);
  w.stroke();

  ox=x; oy=y;
  lastTime=now;
});

write.addEventListener("pointerup",()=>{
  drawing=false;
  w.beginPath();
});

/* ========== 清除 ========== */
document.getElementById("clearBtn").onclick = ()=>{
  w.clearRect(0,0,300,300);
  document.getElementById("resultMsg").textContent="";
};


