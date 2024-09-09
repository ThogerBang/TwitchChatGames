const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const CounterDown = document.getElementById('CounterDown');
const WordTable = document.getElementById("WordTable");
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');

const gameDuration = 90;

var players =  JSON.parse(localStorage.getItem("players"));
var isPlaying = true;
var counter = 0;
var countdown = gameDuration;
var isCounting = true;
var words = [];
var thisPlayers = [];
for (let i = 0; i<players.length; i++){
  if(players[i].alive){
      thisPlayers.push({player:players[i],word:""});
  }
}

const myInterval = setInterval(timeAction, 100);
CounterDown.innerHTML = ""+gameDuration;

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
FakeText.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
      handleMessage(FakeUser.value,FakeText.value)
  }
});

function handleMessage(user, message){
  if(isAlivePlayer(user) && isPlaying && message.split(" ").length <=1){
    let play = thisPlayers.find(p => p.player.name === user);
  }  
}


function endGame(){
}

function isAlivePlayer(user){
  return thisPlayers.some(p => p.player.name === user);
}

function timeAction(){
  if (isPlaying){
      counter++;
      if(counter>10){
          countdown--;
          CounterDown.innerHTML = countdown;
          if(countdown<=0){
              endGame();
          }
          counter = 0;
      }
  }
}
