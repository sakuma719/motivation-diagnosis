"use strict";

const questions = [
  { focus: "promotion", text: "仕事では、もっと良い成果や新しい可能性に目が向く" },
  { focus: "prevention", text: "仕事では、ミスや問題を起こさないことが気になる" },
  { focus: "promotion", text: "新しい方法を試せそうなら、まず可能性を考える" },
  { focus: "prevention", text: "新しい方法を試す前に、失敗や影響を確認しておきたい" },
  { focus: "promotion", text: "目標を立てるとき、達成したら何が得られるかを考える" },
  { focus: "prevention", text: "目標を立てるとき、果たす責任や守ることを考える" }
];
const scale = ["当てはまらない", "あまり当てはまらない", "どちらともいえない", "やや当てはまる", "とても当てはまる"];
const startScreen = document.querySelector("#start-screen");
const form = document.querySelector("#questions");
const diagnosis = document.querySelector("#diagnosis");
const result = document.querySelector("#result");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
let answers = Array(questions.length).fill(null);
let current = 0;

function renderQuestion(focus = false) {
  const question = questions[current];
  form.innerHTML = `<fieldset><legend id="question-title" tabindex="-1"><span class="question-number">Q${current + 1} / ${questions.length}</span>${question.text}</legend><div class="options">${scale.map((label, index) => `<label class="option"><input type="radio" name="answer" value="${index + 1}" ${answers[current] === index + 1 ? "checked" : ""}><span><b>${index + 1}</b>${label}</span></label>`).join("")}</div></fieldset>`;
  const count = answers.filter(value => value !== null).length;
  document.querySelector("#progress").value = count;
  document.querySelector("#progress-text").textContent = `質問 ${current + 1} / 6 · ${count} / 6 回答済み`;
  previous.disabled = current === 0;
  next.hidden = answers[current] === null;
  next.textContent = current === questions.length - 1 ? "結果を見る" : "次の質問へ";
  if (focus) document.querySelector("#question-title").focus();
}

// 選択された数値をそのまま加算する。逆転採点なし。
function calculateScores(values) {
  return questions.reduce((scores, question, index) => {
    scores[question.focus] += values[index];
    return scores;
  }, { promotion: 0, prevention: 0 });
}
function scoreLevel(score) {
  return score >= 10 ? "高め" : score === 9 ? "中間" : "控えめ";
}
function classify(scores) {
  const promotion = scoreLevel(scores.promotion);
  const prevention = scoreLevel(scores.prevention);
  if (promotion === "中間" || prevention === "中間") {
    return { title: "中間タイプ", description: "促進焦点と予防焦点のバランスや傾向が中間にあり、状況によって重視することが変わる可能性があります。" };
  }
  if (promotion === "高め" && prevention === "控えめ") {
    return { title: "タイプA：促進優位", description: "新しいことや成果にワクワクしやすい" };
  }
  if (promotion === "高め" && prevention === "高め") {
    return { title: "タイプB：両方高め", description: "成果も安全もどちらも気になる" };
  }
  if (promotion === "控えめ" && prevention === "控えめ") {
    return { title: "タイプC：両方控えめ", description: "仕事や場面によってスイッチが変わりやすい" };
  }
  return { title: "タイプD：予防優位", description: "ミスや抜け漏れが気になりやすい" };
}
function showResult() {
  if (answers.some(value => value === null)) return;
  const scores = calculateScores(answers);
  const type = classify(scores);
  for (const focus of ["promotion", "prevention"]) {
    document.querySelector(`#${focus}-score`).textContent = scores[focus];
    document.querySelector(`#${focus}-level`).textContent = scoreLevel(scores[focus]);
    document.querySelector(`#${focus}-bar`).value = scores[focus];
    document.querySelector(`#${focus}-bar-label`).textContent = `${scores[focus]} / 15`;
  }
  document.querySelector("#result-title").textContent = type.title;
  document.querySelector("#result-description").textContent = type.description;
  startScreen.hidden = true;
  diagnosis.hidden = true;
  result.hidden = false;
  result.focus();
}
function advance() {
  if (answers[current] === null) return;
  if (current === questions.length - 1) showResult();
  else { current += 1; renderQuestion(true); }
}
form.addEventListener("submit", event => event.preventDefault());
form.addEventListener("change", event => {
  if (!event.target.matches('input[name="answer"]')) return;
  answers[current] = Number(event.target.value);
  advance();
});
previous.addEventListener("click", () => {
  if (current === 0) return;
  current -= 1;
  renderQuestion(true);
});
next.addEventListener("click", advance);
document.querySelector("#start").addEventListener("click", () => {
  startScreen.hidden = true;
  diagnosis.hidden = false;
  renderQuestion(true);
});
function restartDiagnosis() {
  answers = Array(questions.length).fill(null);
  current = 0;
  document.querySelector("#type-list").hidden = true;
  result.hidden = true;
  diagnosis.hidden = true;
  startScreen.hidden = false;
  renderQuestion();
  document.querySelector("#start").focus();
}
renderQuestion();

const typeList = document.querySelector("#type-list");
document.querySelector("#show-types").addEventListener("click", () => {
  result.hidden = true;
  typeList.hidden = false;
  typeList.focus();
});
document.querySelector("#back-to-result").addEventListener("click", () => {
  typeList.hidden = true;
  result.hidden = false;
  result.focus();
});
document.querySelector("#restart").addEventListener("click", restartDiagnosis);
document.querySelector("#restart-from-types").addEventListener("click", restartDiagnosis);
