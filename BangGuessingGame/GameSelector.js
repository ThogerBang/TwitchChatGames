const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const CounterDown = document.getElementById('CounterDown');
const PlayerArea = document.getElementById('PlayerArea');
const movingPictureBox = document.getElementById('movingPictureBox');

const allTheP = [];

const GamesOptions = [
    {name:"Rock Paper Scissor",link: "RoyaleGames\\RockPaperScissor\\RockPaperScissor.html",imgSrc:"GameSelectorImages\\RockPaperScissor.png",lowerCapacity: 8,upperCapacity: 16, isFinal: true},
    {name:"Caught!",link: "h",imgSrc:"GameSelectorImages\\Caught.jpg",lowerCapacity:"d",upperCapacity:"j", isFinal: false},
    {name:"Runner-Up",link: "RoyaleGames\\Wordy\\Wordy.html",imgSrc:"GameSelectorImages\\WordGame.jpg",lowerCapacity:"20",upperCapacity:"100", isFinal: false},
    {name:"Chat Learns To Count",link: "RoyaleGames\\Counting\\Counting.html",imgSrc:"GameSelectorImages\\WordGame.jpg",lowerCapacity:"20",upperCapacity:"60", isFinal: false}
];

const eliminationTime = 1;
const countdownTime = 55;

var chosenGame = GamesOptions[Math.floor(Math.random() * (GamesOptions.length))];
var players =  JSON.parse(localStorage.getItem("players"));
var eliminated = JSON.parse(localStorage.getItem("eliminated"));
var counter = 0;
var countdown = eliminationTime;
var isCounting = false;
var isEliminating = true;

var image = document.createElement("img");
image.id = "id";
image.className = "class";
image.src = chosenGame.imgSrc;
movingPictureBox.appendChild(image);

if (eliminated !== null){
    for(let i = 0; i < eliminated.length; i++){
        players[eliminated[i].number].justEliminated = true;
        players[eliminated[i].number].alive = false;
    }
}


const myInterval = setInterval(timeAction, 100);

for(let i = 0; i<players.length;i++){
    if(players[i].alive){
        displayPlayer(i);
    } else if(players[i].justEliminated){
        displayJustEliminated(i);
    }
    else{
        displayEmptyBox();
    }
}

localStorage.setItem("players",JSON.stringify(players));
localStorage.removeItem("eliminated");

socket.addEventListener('open', (event) => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    let channel = sessionStorage.getItem('channel')
    socket.send(`JOIN #${channel}`);
});
  
socket.addEventListener('message', event =>{
    if (event.data.includes("PING")) socket.send("PONG");
    if (event.data.includes("PRIVMSG")) {
      if (isPlaying){
        let split = event.data.split(":");
        let message = split[2];
        let user = split[1].split("!")[0];
        handleMessage(user, message);
      }  
    }
})


function handleMessage(user, message){
    
}

function timeAction(){
    if (isCounting){
        counter++;
        if(counter>10){
            countdown--;
            CounterDown.innerHTML = countdown;
            if(countdown<=0){
                startGame();
                isCounting = false;
            }
            counter = 0;
        }
    } else if (isEliminating) {
        counter++;
        if(counter>10){
            countdown--;
            if(countdown<=0){
                removeRedBackground();
                isEliminating = false;
                countdown = countdownTime;
                isCounting = true;
            }
            counter = 0;
        }
    }
}
function startGame(){
    console.log(chosenGame.name);
    window.location.href = GamesOptions[0].link;
}

function displayPlayer(i){
    const nextPlayer = document.createElement('p');
    nextPlayer.textContent = players[i].number +". "+ players[i].name;
    nextPlayer.style.color = players[i].color;
    nextPlayer.style.backgroundColor = "white";
    allTheP.push(nextPlayer);
    PlayerArea.appendChild(nextPlayer);
    //console.log(players[currentlyDisplaying].number +". "+ players[currentlyDisplaying].name);
}
function displayEmptyBox(){
    const nextPlayer = document.createElement('p');
    nextPlayer.textContent = " ";
    nextPlayer.style.backgroundColor = "white";
    allTheP.push(nextPlayer);
    PlayerArea.appendChild(nextPlayer);
}
function displayJustEliminated(i){
    const nextPlayer = document.createElement('p');
    nextPlayer.textContent = players[i].number +". "+ players[i].name;
    nextPlayer.style.color = players[i].color;
    nextPlayer.style.backgroundColor = "red"
    allTheP.push(nextPlayer);
    PlayerArea.appendChild(nextPlayer);
}
function removeRedBackground(){
    for(let i = 0; i < allTheP.length; i++){
        if(players[i].justEliminated)
        allTheP[i].textContent = " ";
        allTheP[i].style.backgroundColor = "white";
        players[i].justEliminated = false;
    }
    localStorage.setItem("players",JSON.stringify(players));
}
