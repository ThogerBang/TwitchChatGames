const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";
const messages = [];


let words = [];
let isPlaying = false;
let msgTillNextMovingMsg = 0;

const Guess = document.getElementById('Guess');
const PlayButton = document.getElementById('PlayButton')
const GuessDiv = document.getElementById('GuessDiv')
//const GuessButton = document.getElementById('GuessButton')
//const Streamer = document.getElementById('Streamer');
const winText = document.getElementById('winText');
const podium = document.getElementById('podium');
const rows = podium.getElementsByTagName('tr');

var channel;


  
Guess.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkWin();
  }
});
/*document.getElementById('GuessButton').onclick = function() {
  console.log("button was clicked");
  checkWin();
};*/

document.getElementById("Eye").onclick = function() {
  var x = Guess;
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
};

PlayButton.onclick = function() {
  console.log("play button was clicked");
  restart();
};

socket.addEventListener('open', (event) => {
    socket.send(`PASS oauth:${oAuth}`);
    socket.send(`NICK ${nick}`);
    channel = sessionStorage.getItem('channel')
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
        //console.log(user + ": " + message)
        
        let split_message = message.split(" ");
        //console.log("split size " +split_message.length)
        

        for(let i=0; i < split_message.length; i++){
            let cleaned_word = cleanWord(split_message[i])
            if (words.some(e => e.word === cleaned_word)){
                let w = words.find(e => e.word === cleaned_word);
                let int = words.indexOf(w);
                words[int] = {word:cleaned_word,number:w.number+1}
                if (w.number >3000) break;
                words.sort((a, b) => b.number - a.number)
                //print5Highest();
            }
            else{
              //console.log(words.length);
                words[words.length] = {word:cleaned_word,number:1};
                words.sort((a, b) => b.number - a.number)
            }
            
        }
        //console.log(words.length);
        messages[messages.length]={user:user, message:message};
        
        createMovingBox(message)
        
      }  
    }
  })
  function endGame(){
    PlayButton.style.display = "block"
    podium.style.display = "block"
    GuessDiv.style.display = "none"
      Guess.value = null;
      isPlaying = false;
    
  }
  function createMovingBox(text) {
    // Create the box element
    const box = document.createElement('div');
    box.className = 'MovingBox';
    box.textContent = 'This box will move up through the screen over 5 seconds.';
    box.innerHTML = text;

    // Append the box to the body
    document.body.appendChild(box);

    // Add event listener to remove the box after the animation ends
    box.addEventListener('animationend', () => {
        box.remove();
    });
}
  function displayPodium(){
    for(let i=1; i<6;i++){
      let row = rows[i]; // Skip the header row
      let wordCell = row.getElementsByTagName('td')[0];
      wordCell.textContent = words[i-1].word + ": " + words[i-1].number;
    }
    //podium.innerHTML = "1. " + words[0].word + " 2. " + words[1].word + " 3. " + words[2].word + " 4. " + words[3].word + " 5. " + words[4].word
  }
  function cleanWord(word) {
    return word.split("\r\n")[0];
  }
  
  function checkWin() {
    if (words[0] != null){
      if (words.some(e => e.word.toLowerCase() === Guess.value.toLowerCase())){
        let w = words.find(e => e.word.toLowerCase() === Guess.value.toLowerCase());
        if (words[0].number === w.number){
          win()
        }
        else{
          lose();
        }
      }
      else{
        lose();
      }
      }
    }
    function win(){
      winText.innerHTML = "U win"
        console.log("U win");
        endGame();
        displayPodium();
    }
    function lose(){
      winText.innerHTML = "Wrong"
      Guess.value = null;
      console.log("U lose");
    }
  function restart() {
    
    if (channel !== null && channel !== ""){
    winText.innerHTML = ""
    words = [];
    
    //document.getElementById('PlayButton').disabled = true;
    PlayButton.style.display = "none";
    podium.style.display = "none";
    GuessDiv.style.display = "block";
    isPlaying = true;
    }
  }
  function print5Highest() {
    //I have no idea 
    /*console.log("hejsa")
    for (i = 0; i < 5; i++){
      console.log(words[i])
    }*/
    console.log(words[0]);
    console.log(words[1]);
    console.log(words[2]);
    console.log(words[3]);
    console.log(words[4]);
  }

  