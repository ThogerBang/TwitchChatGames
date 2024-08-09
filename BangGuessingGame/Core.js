
const otherGamesButton = document.getElementById('otherGames');
const howToPlayButton = document.getElementById('howToPlay');
const closeButton = document.getElementById('closeButton');
const sidebar = document.getElementById('sidebar');
const howToPlayText = document.getElementById('howToPlayText');
const otherGamesDiv = document.getElementById('otherGamesDiv');


  howToPlayButton.addEventListener('click', function() {
    sidebar.style.width = '250px';
    howToPlayText.style.display = "block";
    otherGamesDiv.style.display = "none";
    //sidebarText.innerHTML= howToPlayText;
});
otherGamesButton.addEventListener('click', function() {
    sidebar.style.width = '250px';
    howToPlayText.style.display = "none";
    otherGamesDiv.style.display = "block";
});

    
    
closeButton.addEventListener('click', function() {
    closeSidebar();
});

function closeSidebar(){
    sidebar.style.width = '0';
}
