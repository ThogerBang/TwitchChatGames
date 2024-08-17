const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const CounterDown = document.getElementById('CounterDown');
const PlayerArea = document.getElementById('PlayerArea');
const movingPictureBox = document.getElementById('movingPictureBox');

const GamesOptions = [
    {name:"Rock Paper Scissor",link: "RockPaperScissor\\RockPaperScissor.html",imgSrc:"GameSelectorImages\\RockPaperScissor.png",lowerCapacity: 8,upperCapacity: 16},
    {name:"Caught!",link: "h",imgSrc:"GameSelectorImages\\Caught.jpg",lowerCapacity:"d",upperCapacity:"j"},
    {name:"Word Game",link: "h",imgSrc:"GameSelectorImages\\WordGame.jpg",lowerCapacity:"20",upperCapacity:"100"},
    {name:"Chat Learns Counting",link: "Counting\\Counting.html",imgSrc:"GameSelectorImages\\WordGame.jpg",lowerCapacity:"20",upperCapacity:"60"}
];



var chosenGame = GamesOptions[Math.floor(Math.random() * (GamesOptions.length))];
var players =  JSON.parse(localStorage.getItem("players"));
var counter = 0;
var countdown = 5;
var isCounting = true;

var image = document.createElement("img");
image.id = "id";
image.className = "class";
image.src = chosenGame.imgSrc;
movingPictureBox.appendChild(image);

const myInterval = setInterval(timeAction, 100);

for(let i = 0; i<players.length;i++){
    if(players[i].alive){
        displayPlayer(i);
    }else{
        displayEmptyBox();
    }
}

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
    PlayerArea.appendChild(nextPlayer);
    //console.log(players[currentlyDisplaying].number +". "+ players[currentlyDisplaying].name);
}
function displayEmptyBox(){
    const nextPlayer = document.createElement('p');
    nextPlayer.textContent = " ";
    PlayerArea.appendChild(nextPlayer);
}