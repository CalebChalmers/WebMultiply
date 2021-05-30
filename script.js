const defaultMode = 0;
const modes = [
  {
    name: "Multiply", symbol: "×",
    generate: () => {
      let a = random(1, 12);
      let b = random(1, 12);
      return [a, b, a * b]
    }
  },
  {
    name: "Divide", symbol: "÷",
    generate: () => {
      let a = random(1, 12);
      let b = random(1, 12);
      return [a * b, a, b];
    }
  },
  {
    name: "Add", symbol: "+",
    generate: () => {
      let a = random(1, 100);
      let b = random(1, 100);
      return [a, b, a + b]
    }
  },
  {
    name: "Subtract", symbol: "−",
    generate: () => {
      let a = random(1, 100);
      let b = random(1, 100);
      return [a, b, a - b]
    }
  }
]

function random(min, max) // [min, max]
{
  return min + Math.floor(Math.random() * (max - min + 1));
}

function getModeIndex() {
  let url = new URL(document.location);
  let modeIndex = parseInt(url.searchParams.get("mode"));
  return isNaN(modeIndex) ? defaultMode : modeIndex;
}

function setModeIndex(index) {
  let newIndex = Math.min(Math.max(index, 0), modes.length - 1);
  
  // change browser url
  let url = new URL(document.location);
  url.searchParams.set("mode", newIndex);
  history.replaceState(null, "", url.href);
  
  document.title = modes[newIndex].name + "!";
  document.getElementById("prev-mode-button").disabled = (newIndex <= 0);
  document.getElementById("next-mode-button").disabled = (newIndex >= modes.length - 1);
  
  nextQuestion();
  playModeAnimation();
}

function nextQuestion() {
  let mode = modes[getModeIndex()];
  let [operatorA, operatorB, answer] = mode.generate();
  window.answer = answer;
  
  let questionElement = document.getElementById("question");
  document.getElementById("prev-question").innerHTML = questionElement.innerHTML;
  questionElement.children[0].textContent = operatorA;
  questionElement.children[1].textContent = mode.symbol;
  questionElement.children[2].textContent = operatorB;

  playNextQuestionAnimation();
  document.getElementById("answer").focus();
}

function checkAnswer() {
  let input = document.getElementById("answer");
  if(input.value == window.answer) {
    input.value = "";
    nextQuestion();
    playCorrectAnimation();
  } else {
    playIncorrectAnimation();
  }
  input.select();
}

function playModeAnimation() {
  anime({
    targets: document.getElementById("mode-header-container"),
    duration: 450,
    left: (-getModeIndex() * 100) + "%",
    easing: "easeOutQuint"
  });
};

function playNextQuestionAnimation() {
  let targets = "#question-container > p";
  anime.remove(targets);
  anime({
    targets: targets,
    duration: 450,
    translateY: ["-100%", "0%"],
    scale: (_el, i, _t) => (i === 0 ? [0.85, 1.0] : [1.0, 0.85]),
    easing: "easeOutQuint"
  });
}

function playCorrectAnimation() {
  anime({
    targets: "#answer",
    duration: 400,
    borderColor: ["#18ad2c", "#d3d3d3"],
    easing: "linear"
  });
}

function playIncorrectAnimation() {
  anime.timeline().add({
    targets: "#answer",
    duration: 400,
    borderColor: ["#ff0000", "#d3d3d3"],
    easing: "linear"
  }).add({
    targets: "#question",
    duration: 220,
    translateX: ["0em", "-0.1em", "0.1em", "0em"],
    easing: "easeInOutSine",
  }, 0);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prev-mode-button").addEventListener("click", () => {
    setModeIndex(getModeIndex() - 1);
  });
  document.getElementById("next-mode-button").addEventListener("click", () => {
    setModeIndex(getModeIndex() + 1);
  });
  document.getElementById("answer-form").addEventListener("submit", event => {
    checkAnswer();
    event.preventDefault();
  });
  
  setModeIndex(getModeIndex()); // initialize mode from URL
});