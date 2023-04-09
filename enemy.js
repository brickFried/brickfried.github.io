function cloneGs(gs, reverse)
{
    if (reverse)
    return {
        playerB: clonePlayer(gs.playerA),
        playerA: clonePlayer(gs.playerB),
    }
    return {
        playerA: clonePlayer(gs.playerA),
        playerB: clonePlayer(gs.playerB),
    }
}
function clonePlayer(player)
{
    return {
        health:player.health,
        maxHealth: player.maxHealth,
        cards:player.cards.slice()
    }
}

function calcMove(gs1, level, isTop)
{
    let move = 0;
    let lowestDistance = Infinity;
    let scores = [];
    for (let i =0; i < 4; i ++)
    {
        let highestDistance = 0;
        let addedGarbage = 0;
        for (let j =0; j < 4; j++)
        {
            let gs = cloneGs(gs1);

            Move(j,i,gs);
            
            if (!gs.playerA.health&&gs.playerB.health) continue;
            if (gs.playerB.health==0) {
                addedGarbage+= Math.pow(10000,level+1);
                continue;
            }

            let x = gs.playerA.health;
            let y = gs.playerB.health-100;

            let dist;
            if (level)
                dist = calcMove(gs,level-1,false);
            else
                dist = x*x+y*y;
            
            highestDistance = Math.max(highestDistance,dist);
        }
        highestDistance+=addedGarbage;
        if (highestDistance<lowestDistance)
        {
            lowestDistance = highestDistance;
            move = i;
        }
        if (highestDistance==lowestDistance && Math.random() > 0.5)
            move = i;
        if (isTop)
        scores.push(highestDistance);
    }
    if (isTop)
    {
        return move;
    }
    return lowestDistance;
}

function cheatMove(gs1, playerMove, level,isTop)
{
    let move = 0;
    let lowestDistance = Infinity;
    for (let i = 0; i < 4; i++)
    {
        let gs = cloneGs(gs1);
        Move(playerMove,i,gs);
        if (!gs.playerA.health) {
            if (isTop)
            return i;
            return 0;
        }
        if (gs.playerB.health==0) {
            continue;
        }

        let x = gs.playerA.health;
        let y = gs.playerB.health-100;

        let dist=0;
        if (level > 0)
        {
            for (let j = 0; j < 4; j++)
            {
                dist = Math.max(cheatMove(gs,j,level-1,false),dist);
            }
        }
        else
            dist = x*x+y*y;
        if (dist < lowestDistance) {
            lowestDistance = dist;
            move = i;
        }
    }
    if (isTop)
    return move;
    return lowestDistance;
}

function SimGame()
{
    let newGame = cloneGs(gameState);
    while (newGame.playerA.health&&newGame.playerB.health)
    {
        let reverseGs = cloneGs(newGame,true);
        Move(calcMove(reverseGs,0,true),calcMove(newGame,3,true),newGame);
    }

    if (!newGame.playerA.health)
    {
        if (!newGame.playerB.health)
        return "tie";
        return "playerB";
    }
    return "playerA";
}