const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const CounterDown = document.getElementById('CounterDown');
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const RaceCourt = document.getElementById('RaceCourt');

const DecisionTime = 10;

const Snails = [{name:"Bob",html:document.getElementById("Snail1"),distance:0,speed:50,counter:0},{name:"Bert",html:document.getElementById("Snail2"),distance:0,speed:25,counter:0},{name:"Benny",html:document.getElementById("Snail3"),distance:0,speed:15,counter:0},{name:"Frederik",html:document.getElementById("Snail4"),distance:0,speed:10,counter:0}];

var players =  JSON.parse(localStorage.getItem("players"));
var isPlaying = false;
var counter = 0;
var countdown = DecisionTime;
var isCounting = true;

var thisPlayers = [];
for (let i = 0; i<players.length; i++){
  if(players[i].alive){
      thisPlayers.push({player:players[i],word:""});
  }
}
for(let i = 0; i < Snails.length; i++){
  let rect = RaceCourt.getBoundingClientRect();
  const posY = rect.top + (RaceCourt.clientHeight*(i*0.25))+10;
  Snails[i].html.style.top = `${posY}px`;
  Snails[i].html.children[1].innerHTML = Snails[i].name;
  const posX = rect.left + ((RaceCourt.clientWidth-100)*(Snails[i].distance/100)) + 20;
  Snails[i].html.style.left = `${posX}px`;
}

const myInterval = setInterval(timeAction, 100);
CounterDown.innerHTML = "The race starts in: " + DecisionTime;


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
  if(isAlivePlayer(user) && message.split(" ").length <=1 && Snails.some(s => s.name.toLowerCase() === message.toLowerCase())){
    if(isCounting){
      console.log("here");
    }else if (isPlaying){
      console.log("here2");
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
  window.location.href = "../../GameSelector.html";
}

function isAlivePlayer(user){
  return thisPlayers.some(p => p.player.name === user);
}

function timeAction(){
  if (isPlaying){
    for(let i = 0; i < Snails.length; i++){
      Snails[i].counter++
      if(Snails[i].counter > ((105-Snails[i].speed)/5)){
        Snails[i].counter = 0;
        Snails[i].distance += 1;
        let rect = RaceCourt.getBoundingClientRect();
        const posX = rect.left + ((RaceCourt.clientWidth-100)*(Snails[i].distance/100)) + 20;
        Snails[i].html.style.left = `${posX}px`;
      }
      
    }
  }else if(isCounting){
    counter++;
      if(counter>10){
          countdown--;
          CounterDown.innerHTML = "The race starts in: "+countdown;
          if(countdown<=0){
              isPlaying = true;
              isCounting = false;
          }
          counter = 0;
      }
  }
}

