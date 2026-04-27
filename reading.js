const grid = document.getElementById("kanaGrid");
const hiraBtn = document.getElementById("hiraganaBtn");
const kataBtn = document.getElementById("katakanaBtn");

function renderKana(list) {
  grid.innerHTML = "";
  list.forEach(k => {
    grid.innerHTML += `
      <div class="kana-card">
        <div class="kana">${k.kana}</div>
        <div class="romaji">${k.romaji}</div>
      </div>
    `;
  });
}

hiraBtn.onclick = () => {
  hiraBtn.classList.add("active");
  kataBtn.classList.remove("active");
  renderKana(kanaData.hiragana);
};

kataBtn.onclick = () => {
  kataBtn.classList.add("active");
  hiraBtn.classList.remove("active");
  renderKana(kanaData.katakana);
};

renderKana(kanaData.hiragana);
