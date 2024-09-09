const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const CounterDown = document.getElementById('CounterDown');
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const MiddleBox = document.getElementById('MiddleBox');
const SmallBoxes = [document.getElementById('SmallBox1'),document.getElementById('SmallBox2'),document.getElementById('SmallBox3'),document.getElementById('SmallBox4'),document.getElementById('SmallBox6'),document.getElementById('SmallBox7'),document.getElementById('SmallBox8'),document.getElementById('SmallBox9')];

const isInteger = /^-?\d+$/;

const hidingTime = 15;
const killTime = 2;
const defaultSpot = 10;

var players =  JSON.parse(localStorage.getItem("players"));
var isPlaying = true;
var inHidingphase = true;
var isKilling = false;
var counter = 0;
var countdown = hidingTime;
var isCounting = true;
var words = [];
var thisPlayers = [];
var found = [];
var playerBoxes = [];
var revealed = [];

for (let i = 0; i<players.length; i++){
  if(players[i].alive){
    thisPlayers.push({player:players[i],spot:defaultSpot});
    playerBoxes.push(document.createElement('div')); 
    playerBoxes[i].classList.add('small-element');
    const posX = Math.floor(Math.random() * (MiddleBox.clientWidth - 20));
    const posY = Math.floor(Math.random() * (MiddleBox.clientHeight - 20));
    playerBoxes[i].style.left = `${posX}px`;
    playerBoxes[i].style.top = `${posY}px`;
    playerBoxes[i].style.backgroundColor = thisPlayers[i].player.color;
    playerBoxes[i].textContent = thisPlayers[i].player.number;
    MiddleBox.appendChild(playerBoxes[i]);
    found.push(false);
  }
}
const myInterval = setInterval(timeAction, 100);
CounterDown.innerHTML = ""+ hidingTime;

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

for (let i = 0; i < SmallBoxes.length; i++){
  const int = i;
  SmallBoxes[i].addEventListener('click',(event)=>{
    boxClicked(int);
  });
}

function handleMessage(user, message){
  if(isAlivePlayer(user) && isPlaying && inHidingphase && message.split(" ").length <=1){
    let play = thisPlayers.find(p => p.player.name === user);
    if (isInteger.test(message) && !found[play.player.number]){
      let integer = (parseInt(message));
      if (integer>0 && integer <9 && !revealed.includes(integer-1)){
        play.spot = integer-1;
        playerBoxes[thisPlayers.indexOf(play)].style.display = "none";
        /*window.requestAnimationFrame(() => {
          playerBoxes[thisPlayers.indexOf(play)].left = "300px";
          playerBoxes[thisPlayers.indexOf(play)].style.top = "200px";
      });*/
      } 
    }
  }  
}

function boxClicked(i){
  if(!inHidingphase && !isKilling &&!revealed.includes(i)){
    SmallBoxes[i].children[0].style.display = "none";
    revealed.push(i);
    revealBox(i);
    isKilling = true;
    countdown = killTime;
  }
}

function revealBox(j){
  for (let i = 0; i<thisPlayers.length; i++){
    if(thisPlayers[i].spot === j){
      let rect = SmallBoxes[j].getBoundingClientRect();
      playerBoxes[i].style.display = "block";
      //const posY = rect.top - (SmallBoxes[j].clientHeight/2) + 10;
      const posX = Math.floor(Math.random() * (SmallBoxes[j].clientWidth - 20));
      const posY = Math.floor(Math.random() * (SmallBoxes[j].clientHeight - 20));
      playerBoxes[i].style.left = `${posX}px`;
      playerBoxes[i].style.top = `${posY}px`;
      SmallBoxes[j].appendChild(playerBoxes[i]);
      found[i] = true;
    }
    if(thisPlayers[i].spot === defaultSpot){
      playerBoxes[i].style.display = "none";
      found[i] = true;
    }
  }
}


function endGame(){
  isPlaying = false;
  let eliminated = [];
  for(let i = 0; i < thisPlayers.length; i++){
    if(found[i]){
      eliminated.push(thisPlayers[i].player);
    }
  }
  localStorage.setItem("eliminated",JSON.stringify(eliminated));
  window.location.href = "../../GameSelector.html";
}

function isAlivePlayer(user){
  return thisPlayers.some(p => p.player.name === user);
}

function countDownAction(){
  if(inHidingphase){
    endHidingPhase();
  }
  else if(isKilling){
    endKillingPhase();
  }
}

function endKillingPhase(){
  if (revealed.length >= 3){
    endGame();
  }else{
    inHidingphase = true;
    countdown = hidingTime;
  }
  for (let i = 0; i<thisPlayers.length; i++){
    if(!found[i]){
      playerBoxes[i].style.display = "block";
      //const posY = rect.top - (SmallBoxes[j].clientHeight/2) + 10;
      const posX = Math.floor(Math.random() * (MiddleBox.clientWidth - 20));
      const posY = Math.floor(Math.random() * (MiddleBox.clientHeight - 20));
      playerBoxes[i].style.left = `${posX}px`;
      playerBoxes[i].style.top = `${posY}px`;
      MiddleBox.appendChild(playerBoxes[i]);
      thisPlayers[i].spot = defaultSpot;
    }
  }
}

function endHidingPhase(){
  inHidingphase = false;
  isKilling = false;
  for (let i = 0; i<thisPlayers.length; i++){
    if(thisPlayers[i].spot === defaultSpot){
      playerBoxes[i].style.display = "none";
      found[i] = true;
    }
  }
}


function timeAction(){
  if (isPlaying){
    if (inHidingphase || isKilling){
      counter++;
      if(counter>10){
          countdown--;
          if (inHidingphase){
            CounterDown.innerHTML = countdown;
          }
          if(countdown <= 0){
            countDownAction();
          }
          counter = 0;
      }
    }
  }
}
