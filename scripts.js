$(document).ready(function() {
    $("#add-player").click(function(){
        // TODO: look into jquery clear input value
        const cloned = $("#players-group").find('input').first().clone();
        cloned.appendTo("#players-group");
    });


    $("#start-game").click(function(){
        $("#new-game-form").hide();
        let players = [];
        $(".player-input").each((index, elem) => {
            const player = {name: $(elem).val()};
            players.push(player);
        });
    
        game = gameFactory.createGame('Cricket', players);
        $("#game-board").show();
        buildScoreBoard(game);
        updateBoardState(game)
    });

    $(".value").on('click', ' [class^="player-"]', function(event){
        const player = $(this).data("player");
        const value = $(this).data("value");
        const winner = game.update(player, value);
        updateBoardState(game);
        if (winner) {
            // look into twitter bootstrap modal
            // show winner ask to start new game
            alert("WINNER!", winner.name)
        }
    });


    $("#undo").click(function(){
        game.undo();
    });
});

function buildScoreBoard(game) {
    game.state.players.forEach(function (player, index) {
        addPlayerToScoreBoard(game, player, index);
    });
}

function addPlayerToScoreBoard(game, player, index) {
    addPlayerHeader(player, index);
    game.validTargets.forEach(function (target) {
        addPlayerRow(player, index, target.key);
    });
    addPlayerScore(player, index);
}

function addPlayerHeader(player, index) {
    const playerHeader = `<th scope="col" class="player-${index}">${player.name}</th>`;
    $("#game-board .header").append(playerHeader);
}

function addPlayerRow(player, index, value) {
    const row = `<th scope="col" data-player="${index}" data-value="${value}" class="player-${index}"></th>`;
    $(`#game-board .value-${value}`).append(row);
}

function addPlayerScore(player, index) {
    const row = `<th scope="col" class="player-${index}"></th>`;
    $(`#game-board .score`).append(row);
}

function updateBoardState(game){
    game.state.players.forEach(function (player, index) {
        updatePlayer(player, index);
    });
}

function updatePlayer(player, index){
    Object.keys(player.boardState).forEach(function (targetKey){
        const value = player.boardState[targetKey];
        // instead of inserting scothe value, look at value and set the right icon based on value
        // bootstrap might have icons for this. Might just need to set a special class
        $(`.value-${targetKey} .player-${index}`).html(value);
    });

    $(`.score .player-${index}`).html(player.score);
}

document.getElementById("game-board").style.display = "none";