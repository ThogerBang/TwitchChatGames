const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

let scores = [];
let peopleCaught = 0;


let isPlaying = false;

const PlayButton = document.getElementById('PlayButton')
const RecentlyCaught = document.getElementById('RecentlyCaught');
const podium = document.getElementById('podium');
const rows = podium.getElementsByTagName('tr');
const ToMenuButton = document.getElementById('ToMenuButton');




  
ToMenuButton.onclick = function() {
  navigateToMenu();
};

PlayButton.onclick = function() {
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
        //console.log(user + ": " + message)
        if (scores.some(e => e.user === user)){
            let u = scores.find(e => e.user === user);
            if (u.going){
                let int = scores.indexOf(u);
                let stillGoing = keepGoing({user:user,score:u.score+1});
                scores[int] = {user:user,score:u.score+1, going: stillGoing}
                scores.sort((a, b) => ArraySort(a,b));
            }
        }
        else{
            let stillGoing = keepGoing({user:user,score:1});
            scores[scores.length] = {user:user,score:1,going:stillGoing};
            //scores.sort((a, b) => b.score - a.score)
            scores.sort((a, b) => ArraySort(a,b));
        }
        
        updatePodium();
      }  
    }
  })
  function keepGoing(user){
    let keepGoing = (Math.random()> 0.2);
    if (!keepGoing) {
        peopleCaught++;
        displayCaught(user);
    }
    return keepGoing;
  }
  function ArraySort(a, b){
    if (a.score > b.score) return -1;
	if (a.score < b.score) return 1;
    if (a.going) return -1;
    return 1;

  }
  function displayCaught(user){
    RecentlyCaught.innerHTML = user.user + " was caught at " + user.score + " messages 👮‍♂️";
  }
  function endGame(){
      isPlaying = false;
  }
  function updatePodium(){
    for(let i=1; i<6;i++){
        if (scores[i-1] === undefined) { continue;}
        let row = rows[i]; // Skip the header row
        let wordCell = row.getElementsByTagName('td')[0];
        let colorCell = row.getElementsByTagName('td')[1];
        wordCell.textContent = scores[i-1].user + ": " + scores[i-1].score;
        if (scores[i-1].going){
            colorCell.style.backgroundColor = 'green';
        }
        else{
            colorCell.style.backgroundColor = 'red';
        }
        
    }
  }
  function restart() {
    isPlaying = true;
    peopleCaught = 0;
    scores = [];
    updatePodium();
  }
  
  function navigateToMenu() {
    window.location.href = 'menu.html';
}

  