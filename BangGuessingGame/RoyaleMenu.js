const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const AddThøgers = document.getElementById('AddThøgers');
const PickPlayersButton = document.getElementById('PickPlayersButton');
const CounterDown = document.getElementById('CounterDown');
const ResetButton = document.getElementById('Reset');
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const JoinText = document.getElementById('JoinText');
const PlayerArea = document.getElementById('PlayerArea');
const Reminder = document.getElementById('Reminder');

const JoinOptions = ["Put me in coach!", "I'm that guy!", "Let's rumble big dog!", "I will sacrifice myself", "I am the greatest chatter of all time"];

var JoinMessage = JoinOptions[Math.floor(Math.random() * (JoinOptions.length))];
var isPlaying = false;
var wantToJoin = [];
var players = [];
var currentlyDisplaying = 0;
var gameCapacity = 100;
var counter = 0;
var countdown = 5;
var isCounting = false;

let HexLetters = "0123456789ABCDEF";

JoinText.innerHTML = "Type: \"" + JoinMessage +"\" To Join";
//"Type: <br />\"" + JoinMessage +"\"<br />To Join";

const myInterval = setInterval(timeAction, 100);

socket.addEventListener('open', (event) => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    let channel = sessionStorage.getItem('channel')
    if (channel===null || channel === ""){
      JoinText.innerHTML = "you forgot to write a channel name!";
      ResetButton.style.display = "none";
      PlayerArea.style.display = "none";
      AddThøgers.style.display = "none";
      PickPlayersButton.style.display = "none";
      Reminder.style.display = "none";
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
    if (isPlaying){
        isCounting = true;
        PickPlayersButton.style.display = "none";
        CounterDown.innerHTML = countdown;
    }else{
        pickPlayers();
        PickPlayersButton.innerHTML = "Start The Games!";
    }
    
    
};
ResetButton.onclick = function() {
    this.blur();
    PickPlayersButton.innerHTML = "Pick Random Players";
    PlayerArea.innerHTML = "";
    players = [];
    wantToJoin = [];
    var JoinMessage = JoinOptions[Math.floor(Math.random() * (JoinOptions.length))];
    JoinText.innerHTML = "Type: \"" + JoinMessage +"\" To Join";
    CounterDown.innerHTML = "";
    PickPlayersButton.style.display = "inline"
    counter = 0;
    countdown = 5;
    isCounting = false;
    isPlaying = false;
};
AddThøgers.onclick = function() {
    for(let i = 0; i < 100; i++){
        handleMessage("ThogerBang"+i,JoinMessage);
    }
};

function pickPlayers() {
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
function timeAction(){
    if(!isPlaying){return;}
    if(currentlyDisplaying < players.length){
        displayPlayer();
    }
    if(isCounting){
        counter++;
        if(counter>10){
            countdown--;
            CounterDown.innerHTML = countdown;
            if(countdown<=0){
                startGames();
                isCounting = false;
            }
            counter = 0;
        }
    }
}
function startGames(){
    localStorage.setItem("players",JSON.stringify(players));
    console.log("Starting Games");
    navigateToGameSelector();
    //const userInfoParsed = JSON.parse(localStorage.getItem("players"));
    //console.log(userInfoParsed[0].name);
}
function navigateToGameSelector() {
    window.location.href = 'GameSelector.html';
}
function displayPlayer(){
    const nextPlayer = document.createElement('p');
    nextPlayer.textContent = players[currentlyDisplaying].number +". "+ players[currentlyDisplaying].name;
    nextPlayer.style.color = players[currentlyDisplaying].color;
    PlayerArea.appendChild(nextPlayer);
    //console.log(players[currentlyDisplaying].number +". "+ players[currentlyDisplaying].name);
    currentlyDisplaying += 1;
}
    