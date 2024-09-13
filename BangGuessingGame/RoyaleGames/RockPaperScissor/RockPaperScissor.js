const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const CounterDown = document.getElementById('CounterDown');
const PlayerArea = document.getElementById('PlayerArea');
const WinnerDisplay = document.getElementById('WinnerDisplay');
const roundOf16 = [].concat(Array.from(document.getElementById("Round1Of16").children)).concat(Array.from(document.getElementById("Round2Of16").children));
const roundOf8 = [].concat(Array.from(document.getElementById("Round1Of8").children)).concat(Array.from(document.getElementById("Round2Of8").children));;
const roundOf4 = [].concat(Array.from(document.getElementById("Round1Of4").children)).concat(Array.from(document.getElementById("Round2Of4").children));;
const Final = [];
Final.push(document.getElementById("FinalMatch"));

const DecisionTime = 10;
const ResultingTime = 2;
const WinnerTime = 30;

var players = JSON.parse(localStorage.getItem("players"));
var winner = null;
var counter = 0;
var gameState = "deciding";
var round = "16";
var roundIsOver = true;
var thisPlayers = [];
var Round16Matches = [];
var Round8Matches = [];
var Round4Matches = [];
var FinalMatch = [];

for (let i = 0; i < players.length; i++) {
    if (players[i].alive) {
        thisPlayers.push({ player: players[i], weapon: "" });
    }
}

createRoundOf16();
displayRound();

const myInterval = setInterval(timeAction, 100);


socket.addEventListener('open', (event) => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    let channel = sessionStorage.getItem('channel')
    socket.send(`JOIN #${channel}`);
});

socket.addEventListener('message', event => {
    if (event.data.includes("PING")) socket.send("PONG");
    if (event.data.includes("PRIVMSG")) {
        if (isPlaying) {
            let split = event.data.split(":");
            let message = split[2];
            let user = split[1].split("!")[0];
            handleMessage(user, message);
        }
    }
})


function handleMessage(user, message) {
    if (isAlivePlayer(user) && gameState === "deciding" && isValid(message.toLowerCase())) {
        let play = thisPlayers.find(p => p.player.name === user);
        play.weapon = message.toLowerCase();
    }
}

function createRoundOf16() {
    for (let i = 0; i < roundOf16.length; i++) {
        if (thisPlayers.length > 15 - i) {
            Round16Matches.push({ player1: thisPlayers[i], player2: thisPlayers[15 - i], winner: "tie" });
        } else {
            Round16Matches.push({ player1: thisPlayers[i], player2: "noOne", winner: "player1" });
        }
    }
}

function isValid(message) {
    return (message === "rock" || message === "scissors" || message === "paper");
}


function resolveMatches() {
    console.log("resolving " + round);
    let currentRound = getRound();
    roundIsOver = resolveRound(currentRound);
}

function resolveRound(round) {
    let isDone = true;
    for (let i = 0; i < round.logic.length; i++) {
        if (round.logic[i].winner !== "tie") { continue; }
        setWinner(round.logic[i]);
        if (round.logic[i].winner === "tie") { isDone = false; }
        displayPlayerWeapon(round, i);
    }
    return isDone;
}

function setWinner(match) {
    if (match.player2.weapon === "") {
        match.winner = "player1";
    } else {
        switch (match.player1.weapon) {
            case "rock":
                if (match.player2.weapon === "paper") {
                    match.winner = "player2";
                } else if (match.player2.weapon === "scissors") {
                    match.winner = "player1";
                }
                break;
            case "paper":
                if (match.player2.weapon === "scissors") {
                    match.winner = "player2";
                } else if (match.player2.weapon === "rock") {
                    match.winner = "player1";
                }
                break;
            case "scissors":
                if (match.player2.weapon === "rock") {
                    match.winner = "player2";
                } else if (match.player2.weapon === "paper") {
                    match.winner = "player1";
                }
                break;
            default:
                match.winner = "player2";
                break;
        }
    }

}

function getWinner(match) {
    if (match.winner === "player2") {
        return match.player2;
    } else {
        return match.player1
    }
}

function displayPlayerWeapon(round, i) {
    round.display[i].children[3].style.display = "block";
    round.display[i].children[3].src = getIMGSrc(round.logic[i].player1.weapon);
    round.display[i].children[4].style.display = "block";
    round.display[i].children[4].src = getIMGSrc(round.logic[i].player2.weapon);
}

function createNewRound() {
    let oldRound = getRound();
    switch (round) {
        case "16":
            round = "8";
            break;
        case "8":
            round = "4";
            break;
        case "4":
            round = "Final";
            break;
        default:
            break;
    }
    let nextRound = getRound();
    for (let i = 0; i < nextRound.display.length; i++) {
        let p1 = getWinner(oldRound.logic[i * 2]);
        let p2 = getWinner(oldRound.logic[(i * 2) + 1]);
        p1.weapon = "";
        p2.weapon = "";
        nextRound.logic.push({ player1: p1, player2: p2, winner: "tie" });
    }
}

function displayRound() {
    let currentRound = getRound();
    for (let i = 0; i < currentRound.logic.length; i++) {
        let match = currentRound.logic[i];
        let player1 = document.createElement('div');
        player1.classList.add("Player");
        
        player1.classList.add("Left");
        let textitem1 = document.createElement('div');
        textitem1.innerHTML = match.player1.player.number;
        if(round === "Final"){
            player1.classList.add("FinalItem");
        }
        player1.appendChild(textitem1);
        player1.style.backgroundColor = match.player1.player.color;
        let player2 = document.createElement('div');
        player2.classList.add("Player");
        if(round === "Final"){
            player2.classList.add("FinalItem");
        }
        player2.classList.add("Right");
        if (match.player2 !== "noOne") {
            let textitem2 = document.createElement('div');
            textitem2.innerHTML = match.player2.player.number;
            player2.appendChild(textitem2);
            player2.style.backgroundColor = match.player2.player.color;
        }

        let player1IMG = document.createElement('img');
        player1IMG.classList.add("RPS");
        if(round === "Final"){player1IMG.classList.add("FinalItem");}
        player1IMG.classList.add("Left");
        player1IMG.style.display = "none";
        let player2IMG = document.createElement('img');
        player2IMG.classList.add("RPS");
        if(round === "Final"){player2IMG.classList.add("FinalItem");}
        player2IMG.classList.add("Right");
        player2IMG.classList.add("RightPicture");
        player2IMG.style.display = "none";
        currentRound.display[i].appendChild(player1);
        currentRound.display[i].appendChild(player2);
        currentRound.display[i].appendChild(player1IMG);
        currentRound.display[i].appendChild(player2IMG);
    }
}

function resetRound() {
    let currentRound = getRound();
    for (let i = 0; i < currentRound.logic.length; i++) {
        currentRound.logic[i].player1.weapon = "";
        currentRound.logic[i].player2.weapon = "";
        if (currentRound.logic[i].winner === "tie"){
            currentRound.display[i].children[3].style.display = "none";
            currentRound.display[i].children[4].style.display = "none";
        }
    }
}

function displayWinner() {
    winner = getWinner(FinalMatch[0]).player;
    WinnerDisplay.style.display = "flex";
    WinnerDisplay.children[0].innerHTML = winner.number;
    WinnerDisplay.style.backgroundColor = winner.color;
}

function endGame() {
    let eliminated = [];
    for (let i = 0; i < thisPlayers.length; i++) {
        if (thisPlayers[i].player !== winner) {
            eliminated.push(thisPlayers[i].player);
        }
    }
    localStorage.setItem("eliminated", JSON.stringify(eliminated));
    window.location.href = "../../GameSelector.html";
}

function getRound() {
    switch (round) {
        case "16":
            return { logic: Round16Matches, display: roundOf16 };
        case "8":
            return { logic: Round8Matches, display: roundOf8 };
        case "4":
            return { logic: Round4Matches, display: roundOf4 };
        case "Final":
            return { logic: FinalMatch, display: Final };
        default:
            return null;
    }
}

function getIMGSrc(weapon) {
    switch (weapon) {
        case "rock":
            return "RockPaperScissorImages\\Rock.jpg";
            break;
        case "paper":
            return "RockPaperScissorImages\\Paper.jpg";
            break;
        case "scissors":
            return "RockPaperScissorImages\\Scissors.jpg";
            break;
        default:
            return "RockPaperScissorImages\\NoPic.png";
            break;
    }
}

function timeAction() {
    counter++;
    if (gameState === "deciding") {
        if (counter > 10 * DecisionTime) {
            counter = 0;
            resolveMatches();
            gameState = "resulting";
        }
    }
    else if (gameState === "resulting") {
        if (counter > 10 * ResultingTime) {
            counter = 0;
            if (roundIsOver) {
                if (round === "Final") {
                    displayWinner();
                    gameState = "winning";
                }
                else {
                    createNewRound();
                    roundIsOver = false;
                    displayRound();
                }

            } else {
                resetRound();
            }
            if (gameState !== "winning") { gameState = "deciding"; }
        }
    }
    else if (gameState === "winning") {
        if (counter > 10 * WinnerTime) {
            counter = 0;
            endGame();
        }
    }
}

function isAlivePlayer(user) {
    return thisPlayers.some(p => p.player.name === user);
}

FakeText.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleMessage(FakeUser.value, FakeText.value)
    }
});
FakeUser.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleMessage(FakeUser.value, FakeText.value)
    }
});