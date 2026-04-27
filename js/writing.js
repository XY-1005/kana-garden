/* ========== 主要 Canvas ========== */
const write = document.getElementById("writeCanvas");
const stroke = document.getElementById("strokeCanvas");
const grid = document.getElementById("gridCanvas");

const w = write.getContext("2d");
const s = stroke.getContext("2d");
const g = grid.getContext("2d");

/* ========== 绘制田字格 ========== */
function drawGrid(){
  g.clearRect(0,0,300,300);

  g.strokeStyle="#e0e0e0";
  g.lineWidth=2;

  g.strokeRect(10,10,280,280);
  g.beginPath();

  g.moveTo(150,10); g.lineTo(150,290);
  g.moveTo(10,150); g.lineTo(290,150);
  g.stroke();
}
drawGrid();

/* ========== 生成字帖（按参考图） ========== */
const gridBox = document.getElementById("kanaGrid");

function renderChart(type){
  gridBox.innerHTML="";

  kanaData[type].forEach(item=>{
    const cell=document.createElement("div");
    cell.className="kana-cell";

    const text=document.createElement("div");
    text.className="char";
    text.textContent=item.kana;

    cell.appendChild(text);

    // 生成笔顺数字
    const strokes=strokeData[item.kana];
    if(strokes){
      strokes.forEach((pts,i)=>{
        const num=document.createElement("div");
        num.className="num";
        num.textContent=(i+1);
        num.style.left=pts[0][0]/5+"px";
        num.style.top= pts[0][1]/5+"px";
        cell.appendChild(num);
      });
    }

    // 点击加载到右侧
    cell.onclick=()=>{
      loadCharacter(item.kana);
    };

    gridBox.appendChild(cell);
  });
}

/* ========== 切换平假名/片假名 ========== */
document.getElementById("showHira").onclick = ()=>{
  document.getElementById("showHira").classList.add("active");
  document.getElementById("showKata").classList.remove("active");
  renderChart("hiragana");
};

document.getElementById("showKata").onclick = ()=>{
  document.getElementById("showKata").classList.add("active");
  document.getElementById("showHira").classList.remove("active");
  renderChart("katakana");
};

/* 默认显示平假名字帖 */
renderChart("hiragana");

/* ========== 右侧描红 ========== */
function loadCharacter(c){
  s.clearRect(0,0,300,300);

  const strokes=strokeData[c];
  if(!strokes) return;

  s.lineWidth=10;
  s.lineCap="round";
  s.strokeStyle="rgba(0,0,0,0.2)";

  strokes.forEach(path=>{
    for(let i=0;i<path.length-1;i++){
      s.beginPath();
      s.moveTo(path[i][0],path[i][1]);
      s.lineTo(path[i+1][0],path[i+1][1]);
      s.stroke();
    }
  });
}

/* ========== 手写 ========== */
let writing=false, ox=0, oy=0, lastTime=0;

write.onpointerdown = e=>{
  writing=true;
  w.beginPath();
  const rect = write.getBoundingClientRect();
  ox=e.clientX - rect.left;
  oy=e.clientY - rect.top;
  lastTime=performance.now();
};

write.onpointermove = e=>{
  if(!writing) return;

  const now=performance.now();
  const rect = write.getBoundingClientRect();
  const x=e.clientX-rect.left;
  const y=e.clientY-rect.top;

  const dt=now-lastTime||16;
  const dist=Math.hypot(x-ox,y-oy);
  const speed=dist/dt;

  const width=Math.max(2,8-speed*2);

  w.lineWidth=width;
  w.lineCap="round";
  w.strokeStyle="#ff8fb6";

  w.lineTo(x,y);
  w.stroke();

  ox=x; oy=y;
  lastTime=now;
};

write.onpointerup = ()=>{
  writing=false;
  w.beginPath();
};

/* 清除 */
document.getElementById("clearBtn").onclick=()=>{
  w.clearRect(0,0,300,300);
  document.getElementById("resultMsg").textContent = "";
};



