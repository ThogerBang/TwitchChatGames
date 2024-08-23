const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const CounterDown = document.getElementById('CounterDown');
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const MiddleBox = document.getElementById('MiddleBox');
const SmallBoxes = [document.getElementById('SmallBox1'),document.getElementById('SmallBox2'),document.getElementById('SmallBox3'),document.getElementById('SmallBox4'),document.getElementById('SmallBox6'),document.getElementById('SmallBox7'),document.getElementById('SmallBox8'),document.getElementById('SmallBox9')];

const isInteger = /^-?\d+$/;

const hidingTime = 20;

var players =  JSON.parse(localStorage.getItem("players"));
var isPlaying = true;
var inHidingphase = true;
var counter = 0;
var countdown = hidingTime;
var isCounting = true;
var words = [];
var thisPlayers = [];
var playerBoxes = [];
for (let i = 0; i<players.length; i++){
  if(players[i].alive){
    thisPlayers.push({player:players[i],spot:0});
    playerBoxes.push(document.createElement('div')); 
    playerBoxes[i].classList.add('small-element');
    const posX = Math.floor(Math.random() * (MiddleBox.clientWidth - 20));
    const posY = Math.floor(Math.random() * (MiddleBox.clientHeight - 20));
    playerBoxes[i].style.left = `${posX}px`;
    playerBoxes[i].style.top = `${posY}px`;
    playerBoxes[i].style.backgroundColor = thisPlayers[i].player.color;
    playerBoxes[i].textContent = thisPlayers[i].player.number;
    MiddleBox.appendChild(playerBoxes[i]);
  }
}
const myInterval = setInterval(timeAction, 100);
CounterDown.innerHTML = ""+hidingTime;

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
FakeUser.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
      handleMessage(FakeUser.value,FakeText.value)
  }
});

function handleMessage(user, message){
  if(isAlivePlayer(user) && isPlaying && inHidingphase && message.split(" ").length <=1){
    let play = thisPlayers.find(p => p.player.name === user);
    if (isInteger.test(message)){
      let integer = parseInt(message);
      if (integer>0 && integer <9){
        play.spot = integer;
        playerBoxes[thisPlayers.indexOf(play)].remove();
        playerBoxes[thisPlayers.indexOf(play)] = "null";
      } 
    }
  }  
}


function endGame(){
  isPlaying = false;
  let eliminated = [];
  //add eliminated players
  localStorage.setItem("eliminated",JSON.stringify(eliminated));
  window.location.href = "../GameSelector.html";
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
          }
          counter = 0;
      }
  }
}
