const queryString = window.location.search;


var gameState ={};
const deckA = document.getElementById("deckA");
const deckB = document.getElementById("deckB");
const healthA = document.getElementById("healthFillA");
const healthB = document.getElementById("healthFillB");
const hpA = document.getElementById("healthLabelA");
const hpB = document.getElementById("healthLabelB");
let animating =false;
const tempCard = document.getElementsByClassName("card")[0];
let pack = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
let diffVals = [0,1,3];

function StartGame(){
    gameState = {
        playerA: CreatePlayer(0),
        playerB: CreatePlayer(1)
    }
	InitializeCards(gameState.playerA);
	InitializeCards(gameState.playerB);
}

function shuffle(array) {
    let currentIndex = array.length;
	let randomIndex =0;
	
	let arrayCopy = [];
	for (let i = 0; i<array.length;i++ )
	{
		arrayCopy.push(array[i]);
	}
    while (currentIndex != 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [arrayCopy[currentIndex], arrayCopy[randomIndex]] = [arrayCopy[randomIndex], arrayCopy[currentIndex]];
    }
  
    return arrayCopy;
  }
  
function CreatePlayer(turn) {
	var deck;
	if (turn) deck = deckB;
	else deck=deckA;
	
    let playerA = {deckInstance: deck, health:100, turn:turn};
    let cards = shuffle(pack);
    playerA.cards = cards;
	playerA.hand = [cards[0],cards[1],cards[2],cards[3]];
    
    return playerA;
}

function InitializeCards(playerA)
{
	playerA.cardInstances = [];
    for (let i = 0; i < 4;i++)
    {
		InitializeCard(playerA,i);
    }
	
}
function InitializeCard(playerA, slot){
	var cardInstance = tempCard.cloneNode(true);

	playerA.cardInstances.push(cardInstance);
	
	if (!playerA.turn) { 
		cardInstance.onclick = function(){
			OnInput(slot);
		};
	}
	cardInstance.style.display = "flex";
	var cardobj = cardset[playerA.cards[slot]];
	if (cardobj.type==0)
	cardInstance.setAttribute("id", "type_money");
	if (cardobj.type==1)
	cardInstance.setAttribute("id", "type_gun");
	if (cardobj.type==2)
	cardInstance.setAttribute("id", "type_law");
	cardInstance.getElementsByClassName("cardDesc")[0].textContent = cardobj.desc;
	var otherPlayer = (playerA.turn)?gameState.playerA:gameState.playerB;
	cardInstance.getElementsByClassName("cardPower")[0].textContent = cardobj.calcPower(playerA,otherPlayer);
	cardInstance.getElementsByClassName("cardTitle")[0].textContent = cardobj.name;
	cardInstance.getElementsByClassName("cardImage")[0].src=cardobj.image;
	playerA.deckInstance.appendChild(cardInstance);
	
}

function Move(moveA,moveB,gs)
{
	if (!gameState.playerA.health||!gameState.playerB.health) return;
	let sim = true;
	if (!gs)
	{
		var gs = gameState;
		sim = false;
	}
	if (animating) return;
	
	let cardAId = gs.playerA.cards[moveA];
	let cardBId = gs.playerB.cards[moveB];

	var cardA = cardset[cardAId];
	var cardB = cardset[cardBId];
	if (!sim)
	console.log(cardA.name,cardB.name);
	var power = CalculatePower(cardA,cardB,gs.playerA,gs.playerB);
	
	let indexA = gs.playerA.cards.indexOf(cardAId);
	let indexB = gs.playerB.cards.indexOf(cardBId);

	if (indexA<4)
	{
		var getCard = gs.playerA.cards.splice(indexA, 1)[0];
		if (!cardA.consumable)
		gs.playerA.cards.push(getCard);

	}
	if (indexB<4)
	{
		var getCard = gs.playerB.cards.splice(indexB, 1)[0];
		if (!cardB.consumable)
		gs.playerB.cards.push(getCard);
	}
	
	cardA.onUse(gs.playerA,gs.playerB,power[0],cardB);
	cardB.onUse(gs.playerB,gs.playerA,power[1],cardA);

	gs.playerA.health = Math.max(Math.min(gs.playerA.health,100),0);
	gs.playerB.health = Math.max(Math.min(gs.playerB.health,100),0);
	
	if (sim) return;
	var cardInstanceA =gs.playerA.cardInstances[moveA];
	var cardInstanceB = gs.playerB.cardInstances[moveB]
	AnimateMove(cardInstanceA,cardInstanceB,power);
	
}

async function AnimateMove(cardInstanceA,cardInstanceB, power) {
	
	animating=true;
	cardInstanceA.style.left = "41vh";
	cardInstanceA.style.top = "-24vh";
	cardInstanceB.style.left = "70vh";
	cardInstanceB.style.top= "49vh";
	await new Promise(resolve => setTimeout(resolve, 500));
	if (power[0])
	{
		cardInstanceA.style.animation = "attackright 0.4s ease 1";
		cardInstanceB.style.animation = "dies 0.4s ease 1";
	}
	else if (power[1])
	{
		cardInstanceB.style.animation = "attackleft 0.4s ease 1"
		cardInstanceA.style.animation = "dies 0.4s ease 1"
	}
	healthFillA.style.width=gameState.playerA.health+"%";
	healthFillB.style.width=gameState.playerB.health+"%";
	hpA.textContent=gameState.playerA.health;
	hpB.textContent = gameState.playerB.health;
	await new Promise(resolve => setTimeout(resolve, 600));
	cardInstanceA.style.animation = "fade 0.5s ease 1"
	cardInstanceB.style.animation = "fade 0.5s ease 1"
	
	await new Promise(resolve => setTimeout(resolve, 450));
	if (!gameState.playerA.health || !gameState.playerB.health)
	{
		OnGameEnd();
	}
	UpdateCards(gameState.playerA);
	UpdateCards(gameState.playerB);
	animating =false;
}

function UpdateCards(player)
{
	let _cardset = new Set();
	let handset = new Set();

	for (let i =0 ; i< 4; i++)
	{
		_cardset.add(player.cards[i]);
		handset.add(player.hand[i]);
	}
	let i = 0;
	for (let n =0 ; n< 4; n++)
	{
		if (!_cardset.has(player.hand[n]))
		{
			player.cardInstances[i].remove();
			player.cardInstances.splice(i,1);
			
			continue;
		}
		i++;
	}
	let oldInstances = player.cardInstances.slice();
	player.cardInstances=[];
	let oldIndex = 0;
	for (let i =0 ; i< 4; i++)
	{
		if (!handset.has(player.cards[i]))
		{
			InitializeCard(player,i);
			continue;
		}
		player.cardInstances.push(oldInstances[oldIndex]);
		player.cardInstances[i].style.left = "";
		player.cardInstances[i].style.top = "";
		var otherPlayer = player.turn?gameState.playerA:gameState.playerB;
		player.cardInstances[i].getElementsByClassName("cardPower")[0].textContent = cardset[player.cards[i]].calcPower(player,otherPlayer);
		if (!player.turn)
		player.cardInstances[i].onclick = function(){
			OnInput(i);
		};
		oldIndex++;
	}
	player.hand=[player.cards[0],player.cards[1],player.cards[2],player.cards[3]];
}


function CalculatePower(cardA, cardB, user,opponent)
{
	if (cardA.type==cardB.type)
		return [Math.max(cardA.calcPower(user,opponent)-cardB.calcPower(opponent,user),0),Math.max(cardB.calcPower(opponent,user)-cardA.calcPower(user,opponent),0)];
	if ((cardA.type==0&&cardB.type==1)||(cardA.type==1&&cardB.type==2)||(cardA.type==2&&cardB.type==0))
	return [0,cardB.calcPower(opponent,user)];
	return [cardA.calcPower(user,opponent),0];
}

function OnGameEnd()
{
	let key = "save0_"+product;
	console.log(key);
	if (gameState.playerA.health)
	{
		if (localStorage.getItem(key+"w"))
		{
			localStorage.setItem(key+"w",parseInt(localStorage.getItem(key+"w"))+1);
			return;
		}
		localStorage.setItem(key+"w",1);
		return;
	}
	if (gameState.playerB.health)
	{
		if (localStorage.getItem(key+"l"))
		{
			localStorage.setItem(key+"l",parseInt(localStorage.getItem(key+"l"))+1);
			return;
		}
		localStorage.setItem(key+"l",1);
		return;

	}
}
const urlParams = new URLSearchParams(queryString);
const product = urlParams.get('diff')
let diffVal = 0;
diffVal = diffVals[product];
function OnInput(slot)
{
	let gs = cloneGs(gameState,true);
	
	Move(slot,calcMove(gameState,diffVal,true));
}
StartGame();
