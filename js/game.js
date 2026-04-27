let score = 0;
let count = 0;
const total = 10;
let current;

function nextQuestion() {
  const all = [...kanaData.hiragana, ...kanaData.katakana];
  current = all[Math.floor(Math.random() * all.length)];
  document.getElementById("question").textContent = current.kana;
}

function resetGame() {
  score = 0;
  count = 0;
  document.getElementById("score").textContent = "0";
  nextQuestion();
}

document.getElementById("answer").addEventListener("input", e => {
  if (e.target.value.toLowerCase() === current.romaji) {
    score++;
    count++;
    document.getElementById("score").textContent = score;
    document.getElementById("feedback").textContent = "✔ 正确！";
    e.target.value = "";
    nextQuestion();
  }
});

document.getElementById("restart").onclick = resetGame;

resetGame();
