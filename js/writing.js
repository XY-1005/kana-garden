/* ============================================================
   三层画布初始化
============================================================ */
const grid = document.getElementById("gridCanvas");
const stroke = document.getElementById("strokeCanvas");
const write = document.getElementById("writeCanvas");

const g = grid.getContext("2d");
const s = stroke.getContext("2d");
const w = write.getContext("2d");

/* 当前状态 */
let currentChar = "あ";
let strokeIndex = 0;
let autoPlayOn = false;

/* 书写状态 */
let drawing = false;
let ox = 0, oy = 0;
let lastTime = 0;

/* 画笔模式 */
let mode = "brush"; // 或 "eraser"
let brushColor = "#ff8fb6";

/* ============================================================
   田字格
============================================================ */
function drawGrid(){
  g.clearRect(0,0,300,300);
  g.strokeStyle="#ddd";
  g.lineWidth=2;

  g.strokeRect(10,10,280,280);

  g.beginPath();
  g.moveTo(150,10); g.lineTo(150,290);
  g.moveTo(10,150); g.lineTo(290,150);
  g.stroke();
}
drawGrid();

/* ============================================================
   坐标获取（手机 + PC）
============================================================ */
function getPos(e){
  const r = write.getBoundingClientRect();
  if(e.touches){
    return {
      x: e.touches[0].clientX - r.left,
      y: e.touches[0].clientY - r.top
    };
  }
  return { x: e.offsetX, y: e.offsetY };
}

/* ============================================================
   压力笔迹：速度越快越细
============================================================ */
function draw(e){
  if(!drawing) return;

  const now = performance.now();
  const pos = getPos(e);

  const dt = now - lastTime || 16;
  const dist = Math.hypot(pos.x - ox, pos.y - oy);
  const speed = dist / dt;

  let width = Math.max(2, 10 - speed * 3);

  w.lineWidth = width;
  w.lineCap = "round";
  w.strokeStyle = mode==="eraser" ? "white" : brushColor;
  w.globalCompositeOperation = mode==="eraser" ? "destination-out" : "source-over";

  w.lineTo(pos.x, pos.y);
  w.stroke();

  ox = pos.x;
  oy = pos.y;
  lastTime = now;
}

/* ============================================================
   书写事件绑定（已修复断触）
============================================================ */
write.addEventListener("pointerdown",e=>{
  drawing = true;
  w.beginPath();
  const pos = getPos(e);
  ox = pos.x;
  oy = pos.y;
  lastTime = performance.now();
});

write.addEventListener("pointermove",draw);

write.addEventListener("pointerup",()=>{
  drawing = false;
  w.beginPath();
  evaluate();
});

/* ============================================================
   清除
============================================================ */
clearBtn.onclick = ()=>{
  w.clearRect(0,0,300,300);
  resultMsg.textContent="";
};

/* ============================================================
   描红笔画动画
============================================================ */
function showStroke(){
  s.clearRect(0,0,300,300);
  const strokes = strokeData[currentChar];
  if(!strokes) return;

  const path = strokes[strokeIndex];
  s.lineWidth = 12;
  s.lineCap = "round";
  s.strokeStyle = "#ccc";

  let i=0;
  function step(){
    if(i>=path.length-1) return;
    s.beginPath();
    s.moveTo(path[i][0],path[i][1]);
    s.lineTo(path[i+1][0],path[i+1][1]);
    s.stroke();
    i++;
    requestAnimationFrame(step);
  }
  step();
}

/* 前一笔 / 下一笔 */
prevStroke.onclick = ()=>{
  const total = strokeData[currentChar].length;
  strokeIndex = (strokeIndex - 1 + total) % total;
  showStroke();
};
nextStroke.onclick = ()=>{
  const total = strokeData[currentChar].length;
  strokeIndex = (strokeIndex + 1) % total;
  showStroke();
};

/* 自动描红 */
autoPlay.onclick = ()=>{
  if(autoPlayOn){ autoPlayOn=false; autoPlay.textContent="自动描红"; return; }
  autoPlayOn = true;
  autoPlay.textContent="停止";
  autoPlayAnime();
};

function autoPlayAnime(){
  if(!autoPlayOn) return;
  nextStroke.click();
  setTimeout(autoPlayAnime,800);
}

/* ============================================================
   自动评分（简化版）
============================================================ */
function evaluate(){
  const img = w.getImageData(0,0,300,300).data;
  let count=0;
  for(let i=3;i<img.length;i+=4){
    if(img[i]>50) count++;
  }
  if(count > 2000 && count < 18000){
    resultMsg.textContent="写得不错！🌸";
  }else{
    resultMsg.textContent="再试试结构～💕";
  }
}

/* ============================================================
   假名选择
============================================================ */
function loadKana(list){
  kanaList.innerHTML="";
  list.forEach(k=>{
    const el=document.createElement("div");
    el.className="kana-select";
    el.textContent=k.kana;
    el.onclick=()=>{
      currentChar = k.kana;
      strokeIndex=0;
      w.clearRect(0,0,300,300);
      showStroke();
    };
    kanaList.appendChild(el);
  });
}

hiraTab.onclick=()=>{
  hiraTab.classList.add("active");
  kataTab.classList.remove("active");
  loadKana(kanaData.hiragana);
};
kataTab.onclick=()=>{
  kataTab.classList.add("active");
  hiraTab.classList.remove("active");
  loadKana(kanaData.katakana);
};

/* ============================================================
   模式选择：笔刷 / 橡皮擦 / 颜色
============================================================ */
brushMode.onclick=()=>{ mode="brush"; };
eraserMode.onclick=()=>{ mode="eraser"; };

colorPick.onclick=()=>{
  const c = prompt("输入颜色（如 #ff8fb6 或 red）：", brushColor);
  if(c) brushColor=c;
};

/* ============================================================
   保存图片为 PNG
============================================================ */
downloadBtn.onclick=()=>{
  const url = write.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `kana-${currentChar}.png`;
  a.click();
};

/* ============================================================
   今日推荐假名
============================================================ */
function setDaily(){
  const all=[...kanaData.hiragana, ...kanaData.katakana];
  const i = new Date().getDate() % all.length;
  dailyChar.textContent = all[i].kana;
  currentChar = all[i].kana;
  showStroke();
}

setDaily();
loadKana(kanaData.hiragana);
