const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const PickPlayersButton = document.getElementById('PickPlayersButton');
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const JoinText = document.getElementById('JoinText');

const JoinOptions = ["Put me in coach!", "I'm that guy!", "Let's rumble big dog!"];

const JoinMessage = JoinOptions[Math.floor(Math.random() * (JoinOptions.length))];
var isPlaying = false;
var wantToJoin = [];
var players = [];
JoinText.innerHTML = "Type: \"" + JoinMessage +"\" To Join";
//"Type: <br />\"" + JoinMessage +"\"<br />To Join";

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
            console.log(user + ", " + wantToJoin.length);
        }
    }
}

function reset(){
    isPlaying = false;
    PlayButton.style.display = "block";
}

PickPlayersButton.onclick = function() {
    this.blur();
    pickPlayers();
    
};

function pickPlayers() {
    PickPlayersButton.style.display = "none";
    while(wantToJoin.length > 0 && players.length < 100){
        let randNum = Math.floor(Math.random() * (wantToJoin.length));
        let new_player = wantToJoin[randNum];
        console.log(new_player);
        wantToJoin.splice(randNum,1);
        players.push(new_player);
        console.log(players[players.length-1]);
    }
    isPlaying = true;
  }