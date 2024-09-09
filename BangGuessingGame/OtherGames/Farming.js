const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

const oAuth = "bbxuasj3p1vaid6o0h2oye3lvnwh3n";
const nick = "bang";

const PlayButton = document.getElementById('PlayButton')
const FakeText = document.getElementById('FakeText');
const FakeUser = document.getElementById('FakeUser');

const Chicken = document.getElementById('chicken');
const Wheat = document.getElementById('wheat');
var assignments = ["","","","","","","","","","","","","","","","","","","","","","","","","","","",""];
var everyoneAssignment = "";

var isPlaying = false;
let regex = /^[a-zA-Z]+$/;
let numbertest = /\d/;
const alphaVal = (s) => s.toLowerCase().charCodeAt(0) - 97;

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

  
  Chicken.getElementsByClassName('Input')[0].addEventListener('input', function() {
    let split = Chicken.getElementsByClassName('Input')[0].value.split(",");
    let valid = checkValidAssignment(split,"Chicken");
    setErrorText(valid, Chicken);
    if (valid){
        assignJobs("Chicken",split);
    }
    console.log(assignments);
    console.log(everyoneAssignment);
});
Wheat.getElementsByClassName('Input')[0].addEventListener('input', function() {
    let split = Wheat.getElementsByClassName('Input')[0].value.split(",");
    let valid = checkValidAssignment(split,"Wheat");
    setErrorText(valid, Wheat);
    if (valid){
        assignJobs("Wheat",split);
    }
    console.log(assignments);
    console.log(everyoneAssignment);
});

function handleMessage(user, message){
    if (everyoneAssignment === ""){
        let userLetter = user.substr(0, 1);
        if (regex.test(userLetter)){
            doJob(assignments[alphaVal(userLetter)],message);
        }else if (numbertest.test(userLetter)) {
            doJob(assignments[26],message);
        }else{
            doJob(assignments[27],message);
        }
    }else{
        doJob(everyoneAssignment,message);
    }
  }
  function doJob(job, message){
    console.log(job+", "+message);
  }
function assignJobs(assignment,input){
    for(let i = 0; i < assignments.length; i++){
        if (assignments[i] === assignment){
            assignments[i] = "";
        }
    }
    if (everyoneAssignment === assignment){
        everyoneAssignment = "";
    }
    for(let i = 0; i < input.length; i++){
        if (input[i].length === 1){
            assignments[alphaVal(input[i])] = assignment;
        }
        else if (input[i].includes("-")){
            assignMultiple(assignment,input[i]);
        }
        else if (input[i] === "nr"){
            assignments[26] = assignment;
        }
        else if (input[i] === "others"){
            assignments[27] = assignment;
        }
        else if (input[i] === "EVERYONE"){
            everyoneAssignment = assignment;
        }
    }
    
}
function assignMultiple(assignment,input){
    for (let i = alphaVal(input.substr(0, 1)); i < alphaVal(input.substr(2, 1))+1;i++){
        assignments[i] = assignment;
    }

}
function setErrorText(valid, element){
    let input = element.getElementsByClassName('Input')[0];
    let text = element.getElementsByClassName('errorText')[0];
    if (!valid){
        input.style.color = "#ef2424";
        input.style.fontWeight = "bold";
        text.innerHTML = "invalid assignment";
    }
    else{
        input.style.color = "black";
        input.style.fontWeight = "normal";
        text.innerHTML = "";
    }
}

function checkValidAssignment(array,assignment){
    let valid = true;
    if(array.length === 1 && array[0] === ""){return true;}
    //TODO Check for overlap with other assignments
    //TODO Check for overlap everyone assignment
    for (let i = 0; i < array.length; i++){
        if (!((array[i].length === 1 && regex.test(array[i]) && (assignments[alphaVal(array[i])] === "" || assignments[alphaVal(array[i])] === assignment)) || (array[i].length === 3 && regex.test(array[i][0]) && array[i][1] === '-' && regex.test(array[i][2]) && alphaVal(array[i][2]) >= alphaVal(array[i][0]) && checkForOverlap(array[i][0],array[i][2], assignment))|| array[i]==="nr" && (assignments[26] === "" || assignments[26] === assignment) || array[i] === "EVERYONE" && (everyoneAssignment === "" ||  everyoneAssignment === assignment) || array[i] === "others" && (assignments[27] === "" || assignments[27] === assignment))){
            valid = false;
        }
    }
    return valid;
}
function checkForOverlap(a,b,assignment){
    let valid = true;
    for (let i = alphaVal(a); i < alphaVal(b)+1;i++){
        if(assignments[i] !== "" && assignments[i] !== assignment){
            valid = false;
        }
    }
    return valid;
}
function reset(){
    isPlaying = false;
    PlayButton.style.display = "block";
    currentProgress = "";
}

PlayButton.onclick = function() {
    this.blur();
    start();
    
};

function start() {
    PlayButton.style.display = "none";
    isPlaying = true;
  }
