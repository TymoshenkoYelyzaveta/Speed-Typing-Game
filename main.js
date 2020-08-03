// UI elements
const word = document.getElementById("word");
const text = document.getElementById("text");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const endgameEl = document.getElementById("end-game-container");
const settingsEl = document.getElementById("settings-container");
const startBtn = document.getElementById("btn-start");
const restartBtn = document.getElementById("btn-restart");
const btnSettings = document.getElementById("btn-settings");

// by default game lasts 10s
let timeMode = 10;

let randomWord;

//init score
let score = 0;

//init time
let time = 10;
let timeInterval;

// Reset button is disable until the game has started
restartBtn.disabled = true;
restartBtn.classList.add("disabled");

function startGame(event) {
    addWordToDOM();
    text.focus();
    restartBtn.classList.remove("disabled");
    restartBtn.disabled = false;
    startBtn.classList.add("disabled");
    startBtn.disabled = true;
    timeInterval = setInterval(updateTime, 1000);
    hourglassTip();
    setInterval(hourglassTip, 3000);
}

function restartGame(event) {
    clearInterval(timeInterval);
    //Start counting down
    time = timeMode + 1;
    score = -1;
    startGame();
    updateScore();
    text.value = "";
    text.focus();
}

function updateTime() {
    time--;
    timeEl.innerHTML = time + "s";

    if (time === 0) {
        clearInterval(time);
        // End the game
        gameOver();
    }
}

function updateScore() {
    score++;
    scoreEl.innerHTML = score;
}

function addWordToDOM() {
    fetch("https://random-word-api.herokuapp.com//word?number=1")
        .then((response) => response.text())
        .then((data) => {
            randomWord = data.replace(
                /[`~!@#$%^&*()_|+\-=?"';:.<>\{\}\[\]\\\/]/gi,
                ""
            );
            word.innerHTML = randomWord;
        })
        .catch((err) => console.log(err));
}

function saveBestScore() {
    let previousScores;
    if (JSON.parse(localStorage.getItem("bestResults")) === null) {
        previousScores = [];
    } else {
        previousScores = JSON.parse(localStorage.getItem("bestResults"));
    }

    if (previousScores.length === 0) {
        let timeMode1 = { timeMode: 10, bestScore: 0 };
        let timeMode2 = { timeMode: 30, bestScore: 0 };
        let timeMode3 = { timeMode: 60, bestScore: 0 };
        previousScores.push(timeMode1);
        previousScores.push(timeMode2);
        previousScores.push(timeMode3);
        localStorage.setItem("bestResults", JSON.stringify(previousScores));
    }

    previousScores.forEach((result) => {
        if (result.timeMode === timeMode) {
            if (score > result.bestScore) {
                result.bestScore = score;
            }
        }
    });
    localStorage.setItem("bestResults", JSON.stringify(previousScores));
}

function getBestScore() {
    let previousScores;
    let bestScore;
    if (JSON.parse(localStorage.getItem("bestResults")) === null) {
        previousScores = [];
        bestScore = 0;
    } else {
        previousScores = JSON.parse(localStorage.getItem("bestResults"));
        previousScores.forEach((result) => {
            if (result.timeMode === timeMode) {
                bestScore = result.bestScore;
            }
        });
    }
    return bestScore;
}

// Show end screen
function gameOver() {
    saveBestScore();
    let bestScore = getBestScore();
    endgameEl.innerHTML = `
    <h1>Time ran out</h1>
    <p>You played ${timeMode}s</p>
    <p>Your final score is ${score}</p>
    <p>Best score is ${bestScore}</p>
    <button onclick="location.reload()">Reload</button>
    `;
    endgameEl.style.display = "flex";
}

// Change game time
function applySettings() {
    const rbs = document.querySelectorAll('input[name="time"]');
    for (const rb of rbs) {
        if (rb.checked) {
            time = Number(rb.value);
            timeMode = Number(rb.value);
            break;
        }
    }

    settingsEl.style.display = "none";
    timeEl.innerHTML = time + "s";
}

// Event listeners

// Start game
startBtn.addEventListener("click", startGame);
// Restart game
restartBtn.addEventListener("click", restartGame);

// Typing a word
text.addEventListener("input", (e) => {
    const insertedText = e.target.value.toLowerCase();
    if (insertedText === randomWord) {
        addWordToDOM();
        updateScore();
        //Clear input
        e.target.value = "";
    }
});

btnSettings.addEventListener("click", () => {
    settingsEl.innerHTML = `
    <h3>Choose time you want to play</h3>
    <form id="timeForm">
        <label><input type="radio" name="time" value="10" checked> <span>10s</span></label>
        <label><input type="radio" name="time" value="30"> <span>30s</span></label>
        <label><input type="radio" name="time" value="60"> <span>60s</span></label>
    </form>

    <button onclick="applySettings()">Apply</button>

    `;
    settingsEl.style.display = "flex";
});

// Animation for hourglass
function hourglassTip() {
    let hourglass = document.getElementById("hourglass");
    hourglass.innerHTML = "&#xf251";
    setTimeout(function () {
        hourglass.innerHTML = "&#xf252";
    }, 1000);
    setTimeout(function () {
        hourglass.innerHTML = "&#xf253";
    }, 2000);
}
