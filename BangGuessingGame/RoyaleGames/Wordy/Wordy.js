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
    let oldWord = play.word;
    play.word = message;
    updateWord(oldWord,message);
    updateTable();
  }  
}

function updateWord(oldWord,newWord){
  if(words.some(w => w.word === oldWord)){
    let oWord = words.find(w => w.word === oldWord);
    if(oWord.amount <=1){
      words.splice(words.indexOf(oWord),1)
    }else{
      words[words.indexOf(oWord)] = {word:oWord.word,amount:oWord.amount-1};
    }
  }
  if(words.some(w => w.word === newWord)){
    let Word = words.find(w => w.word === newWord);
    words[words.indexOf(Word)] = {word:Word.word,amount:Word.amount+1};
  }else{
    words.push({word:newWord,amount:1})
  }
  words.sort(function(a, b){return b.amount - a.amount});
}

function updateTable(){
  WordTable.innerHTML = "<tr><th style=\"width:80%;  text-align: middle;\" colspan=\"2\">LeaderBoard</th><th style=\"width:20%;  text-align: middle;\">Votes</th></tr>";
  for(let i = 0; i < words.length; i++){
    const tr = document.createElement('tr');
    if(i === 1){
      tr.style.backgroundColor = "green";
    }
    const th = document.createElement('th');
    th.textContent = ((i+1)+".");
    const td1 = document.createElement('td');
    td1.textContent = (words[i].word);
    const td2 = document.createElement('td');
    td2.textContent = (words[i].amount);
    tr.appendChild(th);
    tr.appendChild(td1);
    tr.appendChild(td2);
    WordTable.appendChild(tr);
  }
}

function endGame(){
  isPlaying = false;
  let eliminated = [];
  let winningWord = "Claude";
  if(words.length >= 2){
    winningWord = words[1];
  }
  console.log(winningWord);
  for(let i = 0; i < thisPlayers.length; i++){
    if(thisPlayers[i].word !== winningWord.word){
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
