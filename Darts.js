class DartsGame {
    constructor(players, options = {}) {
        this.options = options;
        this.state = {};
        this.state.players = players.map((player) => Object.assign({}, player, this.initialPlayerState));
        this.updateStack = [];
    }

    get targets() {
        return [
            {key: '1', value: 1},
            {key: '2', value: 2},
            {key: '3', value: 3},
            {key: '4', value: 4},
            {key: '5', value: 5},
            {key: '6', value: 6},
            {key: '7', value: 7},
            {key: '8', value: 8},
            {key: '9', value: 9},
            {key: '10', value: 10},
            {key: '11', value: 11},
            {key: '12', value: 12},
            {key: '13', value: 13},
            {key: '14', value: 14},
            {key: '15', value: 15},
            {key: '16', value: 16},
            {key: '17', value: 17},
            {key: '18', value: 18},
            {key: '19', value: 19},
            {key: '20', value: 20},
            {key: 'B', value: 25}
        ];
    }

    get validTargets() {
        return this.targets;
    }

    update() {
        this.updateStack.push(arguments);
    }
}

class OhOne extends DartsGame {
    constructor(players, options = {initialScore: 301}) {
        super(players, options)
    }
    get initialPlayerState() {
        let playerState = {
                'score': this.options.initialScore,
                'history': []
            };
        return playerState;
    }

    update(playerIndex, score) {
        if (this.state.winner) {
            console.log('Someone already won this game');
            return this.winner;
        }
        super.update(playerIndex, score);
        const player = this.state.players[playerIndex];
        if (player && player.score >= score) {
            player.history.push(score);
            player.score -= score;
            return this.checkForWinner();
        }
    }

    undo() {
        const [playerIndex, score] = this.updateStack.pop();
        const player = this.state.players[playerIndex];
        player.history.pop();
        player.score += score;
        return this.checkForWinner();
    }

    checkForWinner() {
        // needs to have the highest score and have the whole board cleared out
        this.state.winner = this.state.players.find((player) => {
            return player.score === 0;
        });
        if (this.state.winner) {
            return this.state.winner;
        }
    }
}

class Cricket extends DartsGame {
    get validTargets() {
        return this.targets.filter((target) => {
            return ['15', '16', '17', '18', '19', '20', 'B'].indexOf(target.key) > -1;
        });
    }

    get initialPlayerState() {
        let playerState = {
            'score': 0,
            'boardState': {}
        };
        this.validTargets.forEach((target) => {
            playerState.boardState[target.key] = 0;
        });
        return playerState;
    }

    update(playerIndex, hitKey) {
        if (this.state.winner) {
            console.log('Someone already won this game');
            return this.winner;
        }
        super.update(playerIndex, hitKey);
        const hitTarget = this.validTargets.find((target) => target.key === hitKey);
        const player = this.state.players[playerIndex];
        if (hitTarget && player) {
            player.boardState[hitKey] += 1;

            if (player.boardState[hitKey] > 3) {
                this.updateScore(playerIndex, hitTarget);
            }
        }

        return this.checkForWinner();
    }

    updateScore(playerIndex, hitTarget) {
        if (this.canUpdateScore(playerIndex, hitTarget)) {
            this.state.players[playerIndex]['score'] += hitTarget.value;
        }
    }

    canUpdateScore(playerIndex, hitTarget) {
        return this.state.players.some((player, index) => {
            if (playerIndex === index) {
                return false;
            }

            return player.boardState[hitTarget.key] < 3;
        });
    }

    undo() {
        const [playerIndex, hitKey] = this.updateStack.pop();
        const hitTarget = this.validTargets.find((target) => target.key === hitKey);
        const player = this.state.players[playerIndex];
        if (hitTarget && player) {
            player.boardState[hitKey] -= 1;

            if (player.boardState[hitKey] >= 3) {
                if (this.canUpdateScore(playerIndex, hitTarget)) {
                    this.state.players[playerIndex]['score'] -= hitTarget.value;
                }
            }
        }

        return this.checkForWinner();
    }

    checkForWinner() {
        // needs to have the highest score and have the whole board cleared out
        this.state.winner = this.state.players.find((player, index) => {
            // check this player completed the board

            const completedBoard = this.validTargets.every((validTarget) => {
                return player.boardState[validTarget.key] >= 3;
            });

            if (completedBoard) {
                const highestScore = this.state.players.every((opponent) => {
                    return player['score'] >= opponent['score'];
                });

                return highestScore;
            };

            return false;
        });
        if (this.state.winner) {
            return this.state.winner;
        }
    }
}

class CrickteCutthroat extends Cricket {
    undo() {
        const [playerIndex, hitKey] = this.updateStack.pop();
        const hitTarget = this.validTargets.find((target) => target.key === hitKey);
        const player = this.state.players[playerIndex];
        if (hitTarget && player) {
            player.boardState[hitKey] -= 1;

            if (player.boardState[hitKey] >= 3) {
                this.state.players.forEach((player, index) => {
                    if (playerIndex !== index && player.boardState[hitTarget.key] < 3) {
                        this.state.players[index]['score'] -= hitTarget.value;
                    }
                });
            }
        }

        return this.checkForWinner();
    }
    updateScore(playerIndex, hitTarget) {
        this.state.players.forEach((player, index) => {
            if (playerIndex !== index && player.boardState[hitTarget.key] < 3) {
                this.state.players[index]['score'] += hitTarget.value;
            }
        });
    }

    checkForWinner() {
        // needs to have the highest score and have the whole board cleared out
        this.state.winner = this.state.players.find((player, index) => {
            // check this player completed the board
            const completedBoard = this.validTargets.every((validTarget) => {
                return player.boardState[validTarget.key] >= 3;
            });

            if (completedBoard) {
                const lowestScore = this.state.players.every((opponent) => {
                    return player['score'] <= opponent['score'];
                });

                return lowestScore;
            };

            return false;
        });
        if (this.state.winner) {
            return this.state.winner;
        }
    }
}

class GameFactory {
    constructor() {
        this.cricketFactory = new CricketFactory();
    }
    createGame(gameType, players, options) {
        if (gameType === 'Cricket') {
            return this.cricketFactory.createGame(players, options);
        } else if (gameType === 'OhOne') {
            return new OhOne(players, options);
        }

        throw `Invalid Gametype ${gameType}`;
    }
}

class CricketFactory {
    createGame(players, options = {}) {
        if (options.cutthroat) {
            return new CrickteCutthroat(players, options);
        }

        return new Cricket(players, options);
    }
}


const gameFactory = new GameFactory();
function runTests() {
    runCricketTests();
    runCutthroutCricketTests();
    runOhOneTests();
}

function runCricketTests() {
    let game = gameFactory.createGame('Cricket', [{name: '1'}, {name: '2'}, {name: '3'}]);
    checkPlayersScore(game.state, [0,0,0]);
    game.update(0, "20");
    checkPlayersScore(game.state, [0,0,0]);
    game.update(0, "20");
    game.update(0, "20");
    checkPlayersScore(game.state, [0,0,0]);
    game.update(0, "20");
    checkPlayersScore(game.state, [20,0,0]);
    game.update(0, "20");
    checkPlayersScore(game.state, [40,0,0]);
    game.undo();
    game.undo();
    game.undo();
    checkPlayersScore(game.state, [0,0,0]);
    game.update(0, "20");
    game.update(0, "20");
    game.update(0, "20");
    checkPlayersScore(game.state, [40,0,0]);
    game.update(1, "20");
    game.update(1, "20");
    game.update(1, "20");
    game.update(1, "20");
    checkPlayersScore(game.state, [40,20,0]);
    game.undo();
    checkPlayersScore(game.state, [40,0,0]);
    game.update(1, "20");
    checkPlayersScore(game.state, [40,20,0]);
    game.update(2, "20");
    game.update(2, "20");
    game.update(2, "20");
    game.update(2, "20");
    checkPlayersScore(game.state, [40,20,0]);
    game.update(0, "20");
    checkPlayersScore(game.state, [40,20,0]);

    game.validTargets.forEach((target) => {
        game.update(0, target.key);
        game.update(0, target.key);
        game.update(0, target.key);
    });
    checkPlayersScore(game.state, [40,20,0]);
    checkWinner(game.state, 0);

    game.undo();

    checkPlayersScore(game.state, [40,20,0]);
    checkWinner(game.state, -1);

    game.update(0, "B");

    checkPlayersScore(game.state, [40,20,0]);
    checkWinner(game.state, 0);

    game.update(0, "19");
    checkPlayersScore(game.state, [40,20,0]);
}

function runCutthroutCricketTests() {
    let game = gameFactory.createGame('Cricket', [{name: '1'}, {name: '2'}, {name: '3'}], {cutthroat: true});
    checkPlayersScore(game.state, [0,0,0]);
    game.update(0, "20");
    checkPlayersScore(game.state, [0,0,0]);
    game.update(0, "20");
    game.update(0, "20");
    checkPlayersScore(game.state, [0,0,0]);
    game.update(0, "20");
    checkPlayersScore(game.state, [0,20,20]);
    game.update(0, "20");
    checkPlayersScore(game.state, [0,40,40]);
    game.undo();
    game.undo();
    game.undo();
    checkPlayersScore(game.state, [0,0,0]);
    game.update(0, "20");
    game.update(0, "20");
    game.update(0, "20");
    checkPlayersScore(game.state, [0,40,40]);
    game.update(1, "20");
    game.update(1, "20");
    game.update(1, "20");
    game.update(1, "20");
    checkPlayersScore(game.state, [0,40,60]);
    game.undo();
    checkPlayersScore(game.state, [0,40,40]);
    game.update(1, "20");
    checkPlayersScore(game.state, [0,40,60]);
    game.update(2, "20");
    game.update(2, "20");
    game.update(2, "20");
    game.update(2, "20");
    checkPlayersScore(game.state, [0,40,60]);
    game.update(0, "20");
    checkPlayersScore(game.state, [0,40,60]);

    game.validTargets.forEach((target) => {
        game.update(0, target.key);
        game.update(0, target.key);
        game.update(0, target.key);
    });
    checkPlayersScore(game.state, [0,40,60]);
    checkWinner(game.state, 0);

    game.undo();

    checkPlayersScore(game.state, [0,40,60]);
    checkWinner(game.state, -1);

    game.update(0, "19");
    checkPlayersScore(game.state, [0,59,79]);
    game.update(0, "B");

    checkPlayersScore(game.state, [0,59,79]);
    checkWinner(game.state, 0);

    game.update(0, "19");
    checkPlayersScore(game.state, [0,59,79]);

}

function runOhOneTests() {
    let game = gameFactory.createGame('OhOne', [{name: '1'}, {name: '2'}, {name: '3'}], {initialScore: 301});
    checkPlayersScore(game.state, [301,301,301]);
    game.update(0, 20);
    checkPlayersScore(game.state, [281,301,301]);
    game.undo();
    checkPlayersScore(game.state, [301,301,301]);
    game.update(0, 20);
    checkPlayersScore(game.state, [281,301,301]);
    game.update(0, 20);
    game.update(0, 20);
    game.update(0, 20);
    checkPlayersScore(game.state, [221,301,301]);
    game.update(0, 60);
    checkPlayersScore(game.state, [161, 301, 301]);
    game.update(1, 60);
    checkPlayersScore(game.state, [161, 241, 301]);
    game.update(1, 60);
    checkPlayersScore(game.state, [161, 181, 301]);
    game.update(1, 60);
    game.update(1, 60);
    game.update(1, 60);
    checkPlayersScore(game.state, [161, 1, 301]);
    game.update(1, 1);
    checkPlayersScore(game.state, [161, 0, 301]);
    checkWinner(game.state, 1);
    game.undo();
    checkPlayersScore(game.state, [161, 1, 301]);
    checkWinner(game.state, -1);
    game.undo();
    checkPlayersScore(game.state, [161, 61, 301]);
    game.update(1, 15);
    game.update(1, 15);
    game.update(1, 15);
    game.update(1, 16);
    checkPlayersScore(game.state, [161, 0, 301]);
    checkWinner(game.state, 1);
    game.update(1, 16);

    game = gameFactory.createGame('OhOne', [{name: '1'}, {name: '2'}, {name: '3'}], {initialScore: 100});
    checkPlayersScore(game.state, [100,100,100]);
    checkWinner(game.state, -1);
    game.update(1, 50);
    checkWinner(game.state, -1);
    game.update(1, 50);
    checkWinner(game.state, 1);
}

function checkPlayersScore(state, scores) {
    const playerScores = state.players.map((player) => player.score);
    const result = playerScores.every((score, index) => {
        return score === scores[index];
    });

    if (!result) {
        throw `Invalid Score. Expected scores: ${scores} Current scores: ${playerScores}`;
    }
}

function checkWinner(state, winnerIndex) {
    if (winnerIndex >= 0 && !state.winner) {
        throw `Expected a winner but none was set`;
    } else if (winnerIndex < 0 && state.winner) {
        throw `Expected no winner but one was set`;
    } else if (winnerIndex >= 0 && state.winner) {
        const expectedWinner = state.players[winnerIndex];
        // expected winner does not exist or does not match actual winner
        if (!expectedWinner || expectedWinner !== state.winner) {
            throw `Incorrect winner. Expected winner ${expectedWinner} but ${state.winner} was set`;
        }
    } else {
        // will only fall in here if winner index is not valid and winner is not set
    }
}