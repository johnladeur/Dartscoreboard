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
            players.push($(elem).val());
        }) 

        // players = ["asjkdbaskdj", "qwe"]
        buildScoreBoard(players);
    });

    $(".value").on('click', ' [class^="player-"]', function(){
        // need player index and dart value
    });
});

const scoreBoardValues = ["20", "19", "18", "17", "16", "15", "B"];

function buildScoreBoard(players) {
    players.forEach(function (player, index) {
        addPlayerToScoreBoard(player, index);
    });
}

function addPlayerToScoreBoard(player, index) {
    addPlayerHeader(player, index);
    scoreBoardValues.forEach(function (value) {
        addPlayerRow(player, index, value);
    });
}

function addPlayerHeader(player, index) {
    const playerHeader = `<th scope="col" class="player-${index}">${player}</th>`;
    $("#game-board .header").append(playerHeader);
}

function addPlayerRow(player, index, value) {
    const row = `<th scope="col" class="player-${index}"></th>`;
    $(`#game-board .value-${value}`).append(row);
}