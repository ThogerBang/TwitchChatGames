const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const PlayButton = document.getElementById('PlayButton')
const FakeText = document.getElementById('FakeText');
const Sentence = document.getElementById('Sentence');
const Progress = document.getElementById('Progress');
const Loser = document.getElementById('Loser');

const maxRows = 8;
const lineHeight = 35; 

var isPlaying = false;
var hardMode = true;
var sentence = [];
var correctWords = 0;
var currentProgress = "";

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
        handleMessage("ThogerBang",FakeText.value)
    }
  });

  function handleMessage(user, message){
    if (!isPlaying){return;}
    let split = message.split(" ");
    if (hardMode){
        if (split.length > 0 ){
            if (split[0].toLowerCase() !== "pausechamp"){
                if (split[0] === sentence[correctWords]){
                    currentProgress += "<span class=\"Green\">"+ sentence[correctWords] +"</span> ";
                    correctWords++;
                    Progress.innerHTML = currentProgress;
                    if (correctWords === sentence.length){
                        WinGame();
                    }
                    console.log("correct");
                }
                else
                {
                    console.log("wrong");
                    currentProgress += "<span class=\"Red\">"+ split[0] +"</span> ";
                    Progress.innerHTML = currentProgress;
                    lostGame(user);
                }
                
            }
            else{
                console.log("Pausechamp");
            }
        }
    }
  }

Sentence.addEventListener('input', function() {
    this.style.height = 'auto';
    const newHeight = this.scrollHeight;
    const maxHeight = maxRows * lineHeight;
    this.style.height = Math.min(newHeight, maxHeight) + 'px';
    if (newHeight > maxHeight) {
       this.style.overflowY = 'auto';
    } else {
       this.style.overflowY = 'hidden';
    }
    sentence = Sentence.value.split(" ");
    for(let i = 0; i<sentence.length; i++){
        if (sentence[i] === ""){
            sentence.splice(i,1);
        }
    }
    reset();
});

document.addEventListener('click', function(){
    if (Loser.style.display === "block"){
        Loser.style.display = "none";
    }
})

function checkValidSentence(){
    return sentence.some((element, index) => sentence.indexOf(element) !== index);
}

function WinGame(user){
    Loser.innerHTML = "YOU DID IT <br> YOU COMPLETED A SENTENCE WITH " + correctWords + "words!";
    Loser.style.display = "block";
    reset();
}

function lostGame(user){
    Loser.innerHTML = user + " HAS LOST US THE GAME!";
    Loser.style.display = "block";
    reset();
}

function reset(){
    isPlaying = false;
    correctWords = 0;
    PlayButton.style.display = "block";
    currentProgress = "";
}

PlayButton.onclick = function() {
    if (!checkValidSentence()){
        this.blur();
        start(); 
    }else{
        Progress.innerHTML = "<span class=\"Red\"> Sentence cannot contain 2 of the same word </span> ";
    }
    
};

function start() {
    PlayButton.style.display = "none";
    isPlaying = true;
    Progress.innerHTML = "";
  }