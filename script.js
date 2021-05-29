const defaultMode = 0;
const modes = [
  new Mode("Multiply", "×", 
    () => [random(1, 12), random(1, 12)], 
    (a,b,c) => a * b == c),
  new Mode("Divide", "÷", 
    function() {
      var a = random(1, 12);
      return [a * random(1, 12), a];
    }, 
    (a,b,c) => a / b == c),
  new Mode("Add", "+", 
    () => [random(1, 100), random(1, 100)], 
    (a,b,c) => a + b == c),
  new Mode("Subtract", "−",
    () => [random(1, 100), random(1, 100)], 
    (a,b,c) => a - b == c),
]

var random = anime.random;
var op1, op2;
var modeIndex = -1;
var modeAnimation, nextQuestionAnimation, correctAnimation, incorrectAnimation; // animations

function Mode(name, operator, getOperands, check) {
  this.name = name;
  this.operator = operator;
  this.getOperands = getOperands;
  this.check = check;
}

function setMode(index) {
  if(typeof index !== "number") {
    console.error("index is not a number!");
    return;
  }
  
  index = Math.max(Math.min(index, modes.length - 1), 0);
  if(index === modeIndex) return; // not changed
  
  modeIndex = index;
  
  // change browser url
  var url = new URL(document.location);
  url.searchParams.set("mode", modeIndex);
  history.replaceState(null, "", url.href);
  
  document.getElementById("prev-mode-button").disabled = (modeIndex <= 0);
  document.getElementById("next-mode-button").disabled = (modeIndex >= modes.length - 1);
  
  nextQuestion();
  playModeAnimation();
}

function nextMode() { setMode(modeIndex + 1); };
function prevMode() { setMode(modeIndex - 1); };
function getMode() { return modes[modeIndex]; }

function nextQuestion() {
  var mode = getMode();
  [op1, op2] = mode.getOperands();
  var questionElement = document.getElementById("question");
  document.getElementById("prev-question").innerHTML = questionElement.innerHTML;
  questionElement.children[0].innerHTML = op1;
  questionElement.children[1].innerHTML = mode.operator;
  questionElement.children[2].innerHTML = op2;
  document.getElementById("answer").focus();
  nextQuestionAnimation.seek(0);
  nextQuestionAnimation.restart();
}

function checkAnswer() {
  var input = document.getElementById("answer");
  if(getMode().check(op1, op2, input.value)) {
    input.value = "";
    nextQuestion();
    playCorrectAnimation();
  } else {
    playIncorrectAnimation();
  }
  input.select();
}

var prevModeAnimation = null;
function playModeAnimation() {
  prevModeAnimation?.pause();

  var el = document.getElementById("mode-header-container");
  prevModeAnimation = anime({
    targets: el,
    duration: 450,
    left: [el.style.left, (-modeIndex * 100) + "%"],
    easing: "easeOutQuint"
  });
};

nextQuestionAnimation = anime({
  autoplay: false,
  targets: "#question-container > p",
  duration: 450,  
  translateY: ["-100%", "0%"],
  scale: {
    value: (_, i) => (i === 0 ? [0.85, 1.0] : [1.0, 0.85])
  },
  easing: "easeOutQuint"
});

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
    offset: 0,
    duration: 220,
    translateX: ["0em", "-0.1em", "0.1em", "0em"],
    easing: "easeInOutSine",
  });
}

// set initial mode from URL, if provided
setMode(parseInt(new URL(document.location).searchParams.get("mode")) ?? defaultMode);