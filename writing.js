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
