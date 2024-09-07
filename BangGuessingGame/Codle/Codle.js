const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const PlayButton = document.getElementById('PlayButton');
const invalidCode = document.getElementById('invalidCode');
const CodeInput = document.getElementById('CodeInput');
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const CodeBoxes = [document.getElementById('Code1'),document.getElementById('Code2'),document.getElementById('Code3'),document.getElementById('Code4')];
const AnswerContainers = [document.getElementById('AnswerContainer1'),document.getElementById('AnswerContainer2'),document.getElementById('AnswerContainer3')]

const survivePercentage = 0.1;

var players =  JSON.parse(localStorage.getItem("players"));
var isPlaying = false;
var revealed = false;
var code = "";
var valid;
var answerPos = 0;
var safe = [];
var numberOfSurvivors = 0; 

const isInteger = /^-?\d+$/;

var words = [];
var thisPlayers = [];
for (let i = 0; i<players.length; i++){
  if(players[i].alive){
      thisPlayers.push({player:players[i],word:""});
  }
}

numberOfSurvivors = Math.ceil(thisPlayers.length * survivePercentage);


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

PlayButton.addEventListener('click', (event) => {
  isPlaying = "true";
  CodeInput.setAttribute('disabled', '');
  PlayButton.style.display = "none";
  console.log("plad");
});

CodeInput.addEventListener('keyup', (event) => {
  code = CodeInput.value;
  valid = isValid(code);
  for(let i = 0; i < CodeBoxes.length; i++){
    if(code.length <= i){
      CodeBoxes[i].innerHTML = "";
    }
    else{
      CodeBoxes[i].innerHTML = "●";
    }
  }
  if(valid){
    invalidCode.style.display = "none";
    PlayButton.removeAttribute('disabled');
  }else{
    invalidCode.style.display = "block";
    PlayButton.setAttribute('disabled', '');
  }
});

function handleMessage(user, message){
  if(isAlivePlayer(user) && isPlaying && message.split(" ").length <=1 && isValid(message) && !safe.includes(user) && (safe.length < numberOfSurvivors)){
    console.log("in");
    addGuessBox(message);
    if (message === code){
      safe.push(user)
      if (safe.length >= numberOfSurvivors){
        endGame();
      }
      if(!revealed){
        revealCode();
      }
      revealed = true;
    }
  }  
}

function endGame(){
  isPlaying = false;
  let eliminated = [];
  for(let i = 0; i < thisPlayers.length; i++){
    if(!safe.some(p => thisPlayers[i].player.name === p)){
      eliminated.push(thisPlayers[i].player);
    }
  }
  localStorage.setItem("eliminated",JSON.stringify(eliminated));
  window.location.href = "../GameSelector.html";
}

function isAlivePlayer(user){
  return thisPlayers.some(p => p.player.name === user);
}

function addGuessBox(codeGuess){
  let guessBox = document.createElement('div');
  guessBox.classList.add('GuessBox');
  for(let i = 0; i<CodeBoxes.length;i++){
    let codeBox = document.createElement('div');
    codeBox.textContent = codeGuess.charAt(i);
    codeBox.style.backgroundColor = getColor(codeGuess.charAt(i),i);
    codeBox.classList.add('CodeBox');
    guessBox.append(codeBox);
  }
  AnswerContainers[answerPos].prepend(guessBox);
  if (answerPos >= 2){
    answerPos = 0;
  }else{
    answerPos += 1
  }
  let children = AnswerContainers[answerPos].children;
  if(children.length >=10){
    AnswerContainers[answerPos].removeChild(children[children.length-1]);
  }
}

function revealCode(){
  for(let i = 0; i < CodeBoxes.length; i++){
    CodeBoxes[i].innerHTML = code.charAt(i);
  }
}

function isValid(code){
  let Valid = (code.length === CodeBoxes.length);
  for(let i = 0; i < CodeBoxes.length; i++){
    if (!isInteger.test(code[i])){
      Valid = false;
    }
  }
  return Valid;
}

function getColor(char,pos){
  if (!code.includes(char)){
    return 'lightgrey';
  }else if(code.charAt(pos) === char){
    return 'green'
  }else{
    return 'yellow'
  }
}
