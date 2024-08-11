const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const AddThøgers = document.getElementById('AddThøgers');
const PickPlayersButton = document.getElementById('PickPlayersButton');
const ResetButton = document.getElementById('Reset');
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const JoinText = document.getElementById('JoinText');
const PlayerArea = document.getElementById('PlayerArea');

const JoinOptions = ["Put me in coach!", "I'm that guy!", "Let's rumble big dog!", "I will sacrifice myself to the old gods"];

var isPlaying = false;
var wantToJoin = [];
var players = [];
var currentlyDisplaying = 0;
var gameCapacity = 100;

let HexLetters = "0123456789ABCDEF";

JoinText.innerHTML = "Type: \"" + JoinOptions[Math.floor(Math.random() * (JoinOptions.length))] +"\" To Join";
//"Type: <br />\"" + JoinMessage +"\"<br />To Join";

const myInterval = setInterval(displayPlayer, 100);

socket.addEventListener('open', (event) => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    let channel = sessionStorage.getItem('channel')
    if (channel===null || channel === ""){
      winText.innerHTML = "you forgot to write a channel name!";
    }
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
    if (!wantToJoin.includes(user)){
        if(message === JoinMessage){
            wantToJoin.push(user);
            //console.log(user + ", " + wantToJoin.length);
        }
    }
}

function reset(){
    isPlaying = false;
}

PickPlayersButton.onclick = function() {
    this.blur();
    pickPlayers();
    PickPlayersButton.style.display = "none";
    
};
ResetButton.onclick = function() {
    isPlaying = false;
    this.blur();
    PickPlayersButton.style.display = "inline";
    PlayerArea.innerHTML = "";
    players = [];
    wantToJoin = [];
    JoinText.innerHTML = "Type: \"" + JoinOptions[Math.floor(Math.random() * (JoinOptions.length))] +"\" To Join";
};
AddThøgers.onclick = function() {
    for(let i = 0; i < 200; i++){
        handleMessage("ThogerBang"+i,JoinMessage);
    }
};

function pickPlayers() {
    console.log(wantToJoin.length +", "+players.length);
    while(wantToJoin.length > 0 && players.length < gameCapacity){
        let randNum = Math.floor(Math.random() * (wantToJoin.length));
        let new_player = wantToJoin[randNum];
        wantToJoin.splice(randNum,1);
        let color = '#';
        for (let i = 0; i < 6; i++){
            color += HexLetters[(Math.floor(Math.random() * 16))];
        }
        players.push({name:new_player,number: players.length, color:color, alive:true});
    }
    currentlyDisplaying = 0;
    isPlaying = true;
  }
function displayPlayer(){
    if(!isPlaying){return;}
    if(currentlyDisplaying < players.length){
        const nextPlayer = document.createElement('p');
        nextPlayer.textContent = players[currentlyDisplaying].number +". "+ players[currentlyDisplaying].name;
        nextPlayer.style.color = players[currentlyDisplaying].color;
        PlayerArea.appendChild(nextPlayer);
        console.log(players[currentlyDisplaying].number +". "+ players[currentlyDisplaying].name);
        currentlyDisplaying += 1;
    }
}
    