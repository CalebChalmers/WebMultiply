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
    if(index === modeIndex) // not changed
        return;

    var initial = (modeIndex === -1);
    modeIndex = index;
    
    // change browser url
    var url = new URL(document.location);
    url.searchParams.set("mode", modeIndex);
    history.replaceState(null, "", url.href);

    document.getElementById("prev-mode-button").disabled = (modeIndex === 0);
    document.getElementById("next-mode-button").disabled = (modeIndex === modes.length - 1);
    
    nextQuestion();
    playModeAnimation(initial);
}

function nextMode() { setMode(modeIndex + 1); };
function prevMode() { setMode(modeIndex - 1); };
function getMode() { return modes[modeIndex]; }

function nextQuestion() {
    nextQuestionAnimation.seek(0);
    var mode = getMode();
    [op1, op2] = mode.getOperands();
    var questionElement = document.getElementById("question");
    document.getElementById("prev-question").innerHTML = questionElement.innerHTML;
    questionElement.children[0].innerHTML = op1;
    questionElement.children[1].innerHTML = mode.operator;
    questionElement.children[2].innerHTML = op2;
    document.getElementById("answer").focus();
    nextQuestionAnimation.restart();
}

function checkAnswer() {
    var input = document.getElementById("answer");
    input.classList.remove("correct", "incorrect");
    if(getMode().check(op1, op2, input.value)) {
        input.value = "";
        input.classList.add("correct");
        nextQuestion();
        playCorrectAnimation();
    } else {
        input.classList.add("incorrect");
        playIncorrectAnimation();
    }
    input.select();
}

function onKeyPress(ev) {
    if(ev.keyCode === 34) { // Page Down
        nextMode();
        ev.preventDefault();
    } else if(ev.keyCode === 33) { // Page Up
        prevMode();
        ev.preventDefault();
    }
}

function onResize() {
    playModeAnimation(true);
}

var prevModeAnimation = null;
function playModeAnimation(initial) {
    var el = document.getElementById("mode-header-container");
    var newLeft = -el.offsetWidth * modeIndex;

    if(initial) {
        el.style.left = newLeft + "px";    
        return;
    }
    
    if(prevModeAnimation !== null)
        prevModeAnimation.pause();

    prevModeAnimation = anime.timeline({
        duration: 450,
        easing: "easeOutQuint",
    }).add({
        targets: el,
        left: [el.style.left, newLeft]
    }).add({
        targets: "#question > .operator",
        offset: 60,
        duration: 200,
        easing: "easeOutQuad",
        scale: [0, 1],
        opacity: {
            value: [0, 1],
            easing: "easeOutQuint"
        }
    });
};

nextQuestionAnimation = anime({
    autoplay: false,
    targets: "#question-container > p",
    duration: 450,  
    translateY: ["-100%", "0%"],
    scale: {
        value: (t, i) => (i === 0 ? [0.85, 1.0] : [1.0, 0.85])
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

(function () {
    var mode;
    setMode(
        (mode = new URL(document.location).searchParams.get("mode")) === null ? 
        defaultMode : 
        isNaN(mode = parseInt(mode)) ? 
        defaultMode : mode
    );
})();