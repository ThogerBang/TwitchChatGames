const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const CurrentCount = document.getElementById("CurrentCount");
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const PlayerArea = document.getElementById('PlayerArea');

const patterns = ["Plus1","Fibonacci","Primes","Times7","1one2two","even","1upFaster","minus8","bigJump","1foward2back"];
const listOfPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173,
    179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281];
const firstNumberInPattern = [1,1,2,7,1,2,1,8,2,2];
const initialClue = ["1","1","2","7","1","2","1","16, 8","0, 999, 2","1, 2"];

const isInteger = /^-?\d+$/;

const survivePercentage = 0.1;

var players =  JSON.parse(localStorage.getItem("players"));
var thisPlayers = [];
var isPlaying = false;
var currentSequence = "";
var formernumber = 0;
var currentNumber = 1;
var nextNumber = 1;
var backCounter = 0;
var numberOfSurvivors = 0; 
var Survivors = [];
var pattern = 0; 
for (let i = 0; i<players.length; i++){
    if(players[i].alive){
        thisPlayers.push(players[i]);
    }
}

numberOfSurvivors = Math.floor(thisPlayers.length * survivePercentage);
rollNewPattern();
checkValidPattern();
console.log(patterns[pattern]);
currentNumber = firstNumberInPattern[pattern];
currentSequence += initialClue[pattern];
if (patterns[pattern] === "bigJump") { formernumber = 999;}
getNextNumber();
CurrentCount.innerHTML = currentSequence;

isPlaying = true;


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
  if(isAlivePlayer(user) && !Survivors.includes(user) && isPlaying){
    if (!isInteger.test(message)) {return;}
    if (parseInt(message) === nextNumber){
      updateCurrentNumber();
      Survivors.push(user);
      let thisPlayer = thisPlayers.find(p => p.name === user);
      displayPlayer(thisPlayer.number);
      if (Survivors.length >= numberOfSurvivors){
        endGame();
      }
      if(isPlaying){
        getNextNumber();
      }
      console.log("next: "+nextNumber+ " nrS: " +Survivors.length);
      }  
    }
}

FakeText.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleMessage(FakeUser.value,FakeText.value)
    }
  });


function endGame(){
  isPlaying = false;
  console.log("The game has ended");
  let eliminated = [];
  for(let i = 0; i < thisPlayers.length; i++){
    if(!Survivors.includes(thisPlayers[i].name)){
      eliminated.push(thisPlayers[i]);
    }
  }
  localStorage.setItem("eliminated",JSON.stringify(eliminated));
  window.location.href = "../../GameSelector.html";
}
function updateCurrentNumber(){
    formernumber = currentNumber;
    currentNumber = nextNumber;
    currentSequence += ", " +currentNumber;
    CurrentCount.innerHTML = currentSequence;
}
function isAlivePlayer(user){
  return thisPlayers.some(p => p.name === user);
}
function getNextNumber(){
    switch(patterns[pattern]) {
        case "Plus1":
          nextNumber++;
          break;
        case "Fibonacci":
          nextNumber = currentNumber + formernumber;
          break;
        case "Primes":
          nextNumber = listOfPrimes[Survivors.length];
          break;
        case "Times7":
          nextNumber = currentNumber + 7;
          break;
        case "1one2two":
          nextNumber = one1two2Sequence(Survivors.length+2);
          break;
        case "even":
          nextNumber = currentNumber + 2;
          break;
        case "1upFaster":
          nextNumber += (Survivors.length+2);
          break;
        case "minus8":
          nextNumber = currentNumber - 8;
          break;
        case "bigJump":
          if (currentNumber < 500){
            nextNumber = formernumber - (Survivors.length+3);
          }
          else{
            nextNumber = formernumber + (Survivors.length+3);
          }
          break;
        case "1foward2back":
            nextNumber = foward2back1Sequence(Survivors.length + 3);
            break;
        default:
      }
}
function one1two2Sequence(n) {
    let CurrentNumber = 1;
    let position = 0;
    while (position < n) {
        position += CurrentNumber;
        if (position >= n) {
            return CurrentNumber;
        }
        CurrentNumber++;
    }
}
function foward2back1Sequence(n) {
    let CurrentNumber = 0;
    let step = 2;
    let position = 0;
    while (position < n) {
        for (let i = 0; i < step; i++) {
            if (position === n) {return CurrentNumber;}
            CurrentNumber++;
            position++;
        }
        if (position === n) {return CurrentNumber;}
        CurrentNumber--;
        position++;
        step++;
    }

    return CurrentNumber;
}
function checkValidPattern(){
    while(patterns[pattern] === "Fibonacci" && numberOfSurvivors > 30 || patterns[pattern] === "bigJump" && numberOfSurvivors > 40 ){
        rollNewPattern();
    }
}
function rollNewPattern(){
    pattern = Math.floor(Math.random() * (patterns.length));
}
function displayPlayer(p){
  const nextPlayer = document.createElement('p');
  nextPlayer.textContent = players[p].number +". "+ players[p].name;
  nextPlayer.style.color = players[p].color;
  PlayerArea.appendChild(nextPlayer);
  //console.log(players[currentlyDisplaying].number +". "+ players[currentlyDisplaying].name);
}
 