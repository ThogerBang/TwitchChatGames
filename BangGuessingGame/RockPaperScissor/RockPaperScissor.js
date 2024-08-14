const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const CounterDown = document.getElementById('CounterDown');
const PlayerArea = document.getElementById('PlayerArea');
const testBox = document.getElementById('testBox');

var players =  JSON.parse(localStorage.getItem("players"));
var counter = 0;
var countdown = 5;
var isCounting = true;
var thisPlayers = [];
for (let i = 0; i<players.length; i++){
    if(players[i].alive){
        thisPlayers.push({number:players[i].number,wins:0,losses:0});
    }
}
addPlayersToBox(testBox,thisPlayers);


const myInterval = setInterval(timeAction, 100);


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

function addPlayersToBox(box, groupOfPlayers){
    let isEven = (groupOfPlayers.length % 2) === 0;
    console.log(Math.floor(groupOfPlayers.length/2));
    for (let i = 0; i < Math.floor(groupOfPlayers.length/2); i++){
            const nextPlayer = document.createElement('p');
            nextPlayer.textContent = groupOfPlayers[i].number+" vs "+groupOfPlayers[(groupOfPlayers.length-1)-i].number;
            box.appendChild(nextPlayer);
    }
}

function timeAction(){
    counter++;
        if(counter>10){
            counter = 0;
        }
    
}