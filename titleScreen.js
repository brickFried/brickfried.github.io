const tempCard = document.getElementsByClassName("encounterCard")[0];
const titleScreen = document.getElementById("titleScreen");
let cards = ["Easy AI","Medium AI","Hard AI"];

function CreateCard(diff)
{
	var cardInstance = tempCard.cloneNode(true);
    cardInstance.getElementsByClassName("encounterTitle")[0].textContent = cards[diff];
    var losses = localStorage.getItem("save0_"+diff+"l");
    var wins = localStorage.getItem("save0_"+diff+"w");
    wins =parseInt(wins?wins:0);
    losses = parseInt(losses?losses:0);
    cardInstance.getElementsByClassName("encounterWins")[0].textContent = wins;
    cardInstance.getElementsByClassName("encounterLoss")[0].textContent = losses;
    let total = losses+wins;
    console.log(total);
    if (total)
    cardInstance.getElementsByClassName("encounterRatio")[0].textContent = Math.round((wins/total)*1000)/10;
    else
    cardInstance.getElementsByClassName("encounterRatio")[0].textContent = 0;
    cardInstance.getElementsByClassName("playButton")[0].onclick = function(){OnEncounter(diff);}
    cardInstance.style.display = "inherit";
    titleScreen.appendChild(cardInstance);
}

for (let i = 0; i < cards.length; i++)
{
    CreateCard(i);
}

function OnEncounter(diff)
{
    window.location.href = "game.html?diff="+diff+"&m="+((document.getElementById("mirrorMode").checked)?1:0);
}