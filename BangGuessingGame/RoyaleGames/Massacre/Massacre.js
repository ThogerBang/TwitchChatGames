const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";


const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');
const Borders = document.getElementById('Borders');
const Scope = document.getElementById('Scope');

const possibleDirections = ["left", "right", "up", "down", "upleft", "downright", "upright", "downleft", "stop"];
const killPercentage = 0.1;
const bulletSize = 5;

var players = JSON.parse(localStorage.getItem("players"));
var thisPlayers = [];

for (let i = 0; i < players.length; i++) {
  if (players[i].alive) {
    thisPlayers.push({ player: players[i], html: null, direction: "stop", alive: true });
  }
}

for (let i = 0; i < thisPlayers.length; i++) {
  thisPlayers[i].html = (document.createElement('div'));
  thisPlayers[i].html.classList.add('small-element');
  const posX = Math.floor(Math.random() * (Borders.clientWidth - 20));
  const posY = Math.floor(Math.random() * (Borders.clientHeight - 20));
  thisPlayers[i].html.style.left = `${posX}px`;
  thisPlayers[i].html.style.top = `${posY}px`;
  thisPlayers[i].html.style.backgroundColor = thisPlayers[i].player.color;
  thisPlayers[i].html.textContent = thisPlayers[i].player.number;
  document.getElementById("body").appendChild(thisPlayers[i].html);
}

const nrOfKilled = Math.floor(thisPlayers.length * killPercentage);



socket.addEventListener('open', (event) => {
  socket.send(`PASS oauth:${oAuth}`);
  socket.send(`NICK ${nick}`);
  let channel = sessionStorage.getItem('channel')
  socket.send(`JOIN #${channel}`);
});

socket.addEventListener('message', event => {
  if (event.data.includes("PING")) socket.send("PONG");
  if (event.data.includes("PRIVMSG")) {
    let split = event.data.split(":");
    let message = split[2];
    let user = split[1].split("!")[0];
    handleMessage(user, message);
  }
})

document.addEventListener('mousemove', function (event) {
  const rect = Borders.getBoundingClientRect();
  let mouseX = event.clientX;
  let mouseY = event.clientY;
  let scopePosX = (mouseX - (Scope.offsetWidth / 2));
  let scopePosY = mouseY - (Scope.offsetHeight / 2);
  Scope.style.left = `${scopePosX}px`;
  Scope.style.top = `${scopePosY}px`;

});

document.addEventListener('click', function (event) {
  const rect = Borders.getBoundingClientRect();
  let mouseX = event.clientX;
  let mouseY = event.clientY;
  //console.log(mouseX + ", " + mouseY);
  for (let i = 0; i < thisPlayers.length; i++) {
    if (thisPlayers[i].alive) {
      let playerPosX = parseInt(thisPlayers[i].html.style.left.replace('px', '')) + (thisPlayers[i].html.clientWidth / 2);
      let playerPosY = parseInt(thisPlayers[i].html.style.top.replace('px', '')) + (thisPlayers[i].html.clientHeight / 2);
      //console.log(playerPosX + ", " +playerPosY);
      let distance = getDistance(mouseX, mouseY, playerPosX, playerPosY);
      if (distance <= bulletSize) {
        playerShot(thisPlayers[i]);
      }
      //console.log("distance is: " + distance);
    }
  }
});



function handleMessage(user, message) {
  if (isAlivePlayer(user)) {
    let play = thisPlayers.find(p => p.player.name === user);
    if(possibleDirections.includes(message)){
      play.direction = message;
    }else{
      play.direction = possibleDirections[Math.floor(Math.random()*possibleDirections.length)];
    }
  }
}

FakeText.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleMessage(FakeUser.value, FakeText.value)
  }
});

function playerShot(player) {
  console.log(player.player.number + " has been shot");
  player.alive = false;
  player.html.style.display = "none";
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((Math.abs(x1 - x2) ^ 2) + (Math.abs(y1 - y2) ^ 2));
}

function endGame() {
  isPlaying = false;
  console.log("The game has ended");
  let eliminated = [];
  for (let i = 0; i < thisPlayers.length; i++) {
    if (!Survivors.includes(thisPlayers[i].name)) {
      eliminated.push(thisPlayers[i]);
    }
  }
  localStorage.setItem("eliminated", JSON.stringify(eliminated));
  window.location.href = "../../GameSelector.html";
}
function isAlivePlayer(user) {
  return thisPlayers.some(p => p.player.name === user);
}
