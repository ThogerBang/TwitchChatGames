


const Streamer = document.getElementById('Streamer');
const GuessFavouriteWordButton = document.getElementById('GuessFavouriteWordButton');
const CaughtButton = document.getElementById('CaughtButton');
const KKonaButton = document.getElementById('KKonaButton');
const PauseChampButton = document.getElementById('PauseChampButton');

Streamer.value=sessionStorage.getItem('channel');
GuessFavouriteWordButton.onclick = function() {
    navigateToGuessFavouriteWord();
  };
CaughtButton.onclick = function() {
    navigateToCaught();
  };
  KKonaButton.onclick = function() {
    navigateToKKona();
  };
  PauseChampButton.onclick = function() {
    navigateToPauseChamp();
  };



Streamer.addEventListener('keyup', (event) => {
    sessionStorage.removeItem('channel');
    sessionStorage.setItem('channel',cleanChannel(Streamer.value));
});

function cleanChannel(name){
    return name.replaceAll(' ', '')
}
  
function navigateToGuessFavouriteWord() {
    window.location.href = 'favouriteWord.html';
}
function navigateToCaught() {
    window.location.href = 'caught.html';
}
function navigateToKKona() {
    window.location.href = 'KKona.html';
}
function navigateToPauseChamp() {
    window.location.href = 'PauseChamp.html';
}
