const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

//const howToPlayText = "<span class=\"Purple\">Streamer</span>: Control the bunny by moving your mouse <br><br> <span class=\"Purple\">Chat</span>: You can shoot at the bunny by writing shoot then either \"left\", \"right\", \"top\" or \"bottom\" and then a number from 0 to 100 to decide how far along the line to shoot.<br> \"shoot left 50\" will shoot from the middle of the left side.";

var isPlaying = false;
var bunnyPos = {x: 0,y: 0};
var mousePos = {x: 0,y: 0};
var shoots = [];
var myInterval;
var timer = 0;
var timeAdded = 0;
var xdiff;
var ydiff;

//var sidebarIsOut = false;

const PlayButton = document.getElementById('PlayButton')
const TimerText = document.getElementById('timer');
const GameBox = document.getElementById('GameBox');
const Bunny = document.getElementById('Bunny');
const FakeText = document.getElementById('FakeText');
const test = document.getElementById('TemplateShot');


myInterval = setInterval(function(){ 
    if (isPlaying){
        checkCollisions(); 
    timer++;
    timeAdded++;
    if (timeAdded>=5) 
        {
        timeAdded = 0;
        TimerText.innerHTML = (timer/50)+"0";
    }
    }
}, 20);

document.addEventListener('mousemove', function(event) {
    if (!isPlaying) { return;}
    const rect = GameBox.getBoundingClientRect();
    mousePos.x=event.clientX;
    mousePos.y=event.clientY;
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    let bunnyPosX = Math.max(Math.min(mouseX - Bunny.width / 2,(rect.left + (rect.width/2)) - Bunny.width),(rect.left - (rect.width/2)+4));
    let bunnyPosY = Math.max(Math.min(mouseY - Bunny.height / 2,(rect.top+ (rect.height/2)) - Bunny.height),(rect.top - (rect.height/2)+4));
    //console.log(shoots.length);
    Bunny.style.left = `${bunnyPosX}px`;
    Bunny.style.top = `${bunnyPosY}px`;
    bunnyPos.x = bunnyPosX;
    bunnyPos.y = bunnyPosY;
    
});
  

PlayButton.onclick = function() {
    this.blur();
  console.log("play button was clicked");
  restart();
};


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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleMessage("ThogerBang",FakeText.value)
    }
  });

  function checkCollisions(){
    for(let i = 0; i < shoots.length; i++){
        let rect = GameBox.getBoundingClientRect();
        let rect2 = shoots[i].getBoundingClientRect();
        //console.log((rect2.top-rect.top)+", "+(rect2.left- rect.left));
        //console.log(bunnyPos.y+", "+bunnyPos.x);
        xdiff = Math.abs((rect2.left- rect.left - (test.width)) - (bunnyPos.x));
        ydiff = Math.abs((rect2.top- rect.top- (test.width)) - bunnyPos.y);
        //console.log(xdiff + ", " + ydiff);
            if(xdiff <= (Bunny.width/2) && ydiff <= (Bunny.height/2)){
                shoots[i].style.backgroundColor = 'transparent';
                endGame();
            }
        
    }
  }

  function handleMessage(user, message){
    let split = message.split(" ");
    if (usefullMessage(split)){
        createMovingBox(split[1],split[2]);
    }
    else {console.log("invalid message!");}
  }
  function createMovingBox(side,pos) {
    // Create the box element
    const box = document.createElement('div');
    let poss = Math.min(98,pos);
    if (side === "left" || side === "right"){
        box.className = 'MovingBoxHor';
        box.style.top = poss+"%";
    }else{
        box.className = 'MovingBoxVer';
        box.style.left = poss+"%";
    }
    box.style.animation = "moveBox"+ side +" 3s linear forwards"
    
    // Append the box to the body
    box.addEventListener('animationend', () => {
        if (shoots.includes(box)){
        var int = shoots.indexOf(box);
        shoots.splice(int,1);
        }
        box.remove();
    });
    box.addEventListener('animationstart', () => {
        shoots[shoots.length] = box;
    });
    GameBox.appendChild(box);

    
}
  function usefullMessage(split){
    return (split.length === 3 && split[0]=== "shoot" && (split[1]=== "left" || split[1]=== "right" || split[1]=== "top" || split[1]=== "bottom")&& isValidInteger(split[2]));
  }
  function isValidInteger(str) {
    var n = parseInt(str, 10);
    return !isNaN(n) && String(n) === str;
}
  function endGame(){
    console.log("Game has ended");
    PlayButton.style.display = "block"
    isPlaying = false;
    TimerText.innerHTML = (timer/50)
  }
  function restart() {
    timer = 0;
    timeAdded = 0;
    PlayButton.style.display = "none";
    isPlaying = true;
  }



  