const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const WinCondition = document.getElementById('WinCondition');
const CounterDown = document.getElementById('CounterDown');
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const RaceCourt = document.getElementById('RaceCourt');
const BoostLanes = [document.getElementById('BoostLane1'),document.getElementById('BoostLane2'),document.getElementById('BoostLane3'),document.getElementById('BoostLane4')];

const DecisionTime = 30;
const boostTime = 5;
const endTime = 5;
const snailGeneralSpeed = 9;

const Snails = [
  {name:"Bob",html:document.getElementById("Snail1"),distance:0,speed:25,counter:0,bet:document.getElementById("Snail1Bets"),nrOfBets:0,supporters:0},
  {name:"Bert",html:document.getElementById("Snail2"),distance:0,speed:25,counter:0,bet:document.getElementById("Snail2Bets"),nrOfBets:0,supporters:0},
  {name:"Benny",html:document.getElementById("Snail3"),distance:0,speed:25,counter:0,bet:document.getElementById("Snail3Bets"),nrOfBets:0,supporters:0},
  {name:"Frederik",html:document.getElementById("Snail4"),distance:0,speed:25,counter:0,bet:document.getElementById("Snail4Bets"),nrOfBets:0,supporters:0}
];

var players =  JSON.parse(localStorage.getItem("players"));
var gameState = "choosing";
var counter = 0;
var countdown = DecisionTime;
var totalSpeedBoosts = 0;
var winningSnail = "";
var snailTimer = 0;
var boostUsed = false;
var boosted = null;

var thisPlayers = [];
for (let i = 0; i<players.length; i++){
  if(players[i].alive){
      thisPlayers.push({player:players[i],bet:""});
  }
}
for(let i = 0; i < Snails.length; i++){
  let rect = RaceCourt.getBoundingClientRect();
  const posY = rect.top + (RaceCourt.clientHeight*(i*0.25))+10;
  Snails[i].html.style.top = `${posY}px`;
  Snails[i].bet.style.top = `${posY}px`;
  Snails[i].html.children[1].innerHTML = Snails[i].name;
  const posX = rect.left + ((RaceCourt.clientWidth*0.87)*(Snails[i].distance/100)) + (RaceCourt.clientWidth*0.03);
  Snails[i].html.style.left = `${posX}px`;
  Snails[i].bet.style.left = `${posX-15}px`;
}

const myInterval = setInterval(timeAction, 100);
CounterDown.innerHTML = "The race starts in: " + DecisionTime;

for(let i = 0; i < BoostLanes.length; i++){
  let nr = i;
  BoostLanes[nr].addEventListener('click', (event) => {
    boost(nr);
  });
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
      if (gameState === "playing"){
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
    if(gameState === "choosing"){
      if (message.split(" ").length <=1 && Snails.some(s => s.name.toLowerCase() === message.toLowerCase()) && isAlivePlayer(user)){
        betOnSnail(user,message);
      }
    }else if (gameState === "playing"){
      let lowMes = message.toLowerCase();
      for(let i = 0; i < Snails.length; i++){
        if (lowMes.includes(Snails[i].name.toLowerCase())){
          Snails[i].supporters += 1;
          totalSpeedBoosts += 1;
        }
      }
    }
}

function boost(lane){
  if(boostUsed){ return; }
  for(let j = 0; j < BoostLanes.length; j++){
    if (!(lane === j)){
      BoostLanes[j].style.opacity = "0";
    }
  }
  BoostLanes[lane].children[0].style.display = "none";
  BoostLanes[lane].style.backgroundColor ="lightgrey";
  BoostLanes[lane].style.opacity ="0.5";
  boostUsed = true;
  boosted = lane;
}

function betOnSnail(user,snail){
  let play = thisPlayers.find(p => p.player.name === user);
  if(Snails.some(s => s.name.toLowerCase() === play.bet.toLowerCase())){
    let oldSnail = Snails.find(s => s.name.toLowerCase() === play.bet.toLowerCase());
    oldSnail.nrOfBets -= 1;
    oldSnail.bet.innerHTML = oldSnail.nrOfBets;
  }
  let newSnail = Snails.find(s => s.name.toLowerCase() === snail.toLowerCase());
  newSnail.nrOfBets += 1;
  newSnail.bet.innerHTML = newSnail.nrOfBets;
  play.bet = snail;
}

function beginRace(){
  gameState = "playing";
  CounterDown.innerHTML = "0";
  snailTimer = 0;
  for(let i = 0; i < BoostLanes.length; i++){
    BoostLanes[i].style.display = 'flex';
  }
  WinCondition.innerHTML = "Chat, cheer for your fauvorite snail to speed him up";
}

function moveSnail(i){
  Snails[i].counter = 0;
  Snails[i].distance += 1;
  let rect = RaceCourt.getBoundingClientRect();
  const posX = rect.left + ((RaceCourt.clientWidth*0.87)*(Snails[i].distance/100)) + (RaceCourt.clientWidth*0.03);
  Snails[i].html.style.left = `${posX}px`;
  if(Snails[i].distance >= 100){
    endRace(i);
  }
}

function endRace(i){
  WinCondition.innerHTML = "The Winner is " + Snails[i].name + "!";
  winningSnail = Snails[i].name;
  console.log(winningSnail);
  gameState = "end"
  for(let j = 0; j < BoostLanes.length; j++){
    BoostLanes[j].style.opacity = "0";
  }
}

function endGame(){
  let eliminated = [];
  for(let i = 0; i < thisPlayers.length; i++){
    console.log(thisPlayers[i].bet.toLowerCase() +", " + winningSnail.toLowerCase());
    if(thisPlayers[i].bet.toLowerCase() !== winningSnail.toLowerCase()){
      eliminated.push(thisPlayers[i].player);
    }
  }
  localStorage.setItem("eliminated",JSON.stringify(eliminated));
  window.location.href = "../../GameSelector.html";
}

function isAlivePlayer(user){
  return thisPlayers.some(p => p.player.name === user);
}

function timeAction(){
  switch(gameState){
    case"playing":
      if(totalSpeedBoosts >= 5){
        for(let i = 0; i < Snails.length; i++){
          if(boosted === i) {Snails[i].counter++}
          Snails[i].counter++
          if(Snails[i].counter > ((105-(100*(Snails[i].supporters/totalSpeedBoosts)))/snailGeneralSpeed)){
            moveSnail(i);
          }
        }
      }
      snailTimer++;
      CounterDown.innerHTML = (snailTimer/10).toFixed(2);
      if(boosted !== null){
        counter++;
        if (counter >= boostTime*10){
          BoostLanes[boosted].style.opacity = "0";
          boosted = null;
          counter = 0;
        }
      }
    break;
    case "choosing":
      counter++;
      if(counter>10){
          countdown--;
          CounterDown.innerHTML = "The race starts in: " + countdown;
          if(countdown<=0){
              beginRace();
          }
          counter = 0;
      }
      break;
    case "end":
      counter++;
      if (counter >= endTime*10){
        counter = 0;
        endGame();
      }
      break;
  }
}

