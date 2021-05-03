// Factory Function
const Player = (sign) => {
    let score = 0;

    const getSign = () => sign;
    const getScore = () => score;
    const increaseScore = () => score++;

    return {getSign, getScore, increaseScore};
};

const PlayerCPU = (sign) => {
    const prototype = Player(sign);
    const getNextMove = () => {
        let move = 0;
        while (true) {
            move = Math.random(0, 9);
            if(board[move] == "") return move;
        }
    }

    return Object.assign({}, prototype, {getNextMove});
}

// MODULES
const gameboard = (() => {
    const board = ["","","","","","","","","",];

    const getField = (index) => {
        if(index < board.length) return board[index];
    }

    const setField = (index, sign) => {
        if (index < board.length) {
            board[index] = sign;
        }
    }

    const reset = () => {
        for (let index = 0; index < board.length; index++) {
            board[index] = "";            
        }
    }

    return {getField, setField, reset};
})();

//displayController
const displayController = (() => {
    const fieldElements = document.querySelectorAll(".field");
    const restartButton = document.getElementById("restart-button");    
    const messageElement = document.getElementById("message");
    const playerXScore = document.getElementById("playerXScore");
    const playerOScore = document.getElementById("playerOScore");
    const modeSelector = document.getElementById("playmode");
    

    fieldElements.forEach(field => 
        field.addEventListener("click", (event) => {
            if(gameplay.isGameOver() || field.textContent !== "") return;
            gameplay.playRound(parseInt(event.target.dataset.index));
            updateGameboard();

            if (modeSelector.value == "CPU" && gameplay.isGameOver() == false) {
                gameplay.playCPURound();
                updateGameboard();
            }

            if (modeSelector.value == "CPU-hard" && gameplay.isGameOver() == false) {
                gameplay.playCPURound();
                updateGameboard();
            }
        })
    );

    modeSelector.addEventListener("click", (e) => {
        reset();    
    })

    restartButton.addEventListener("click", (e) => {
        reset();
    });

    const reset = () => {
        gameboard.reset();
        gameplay.resetGame();
        updateGameboard();
        setMessage("Player X's turn");
    }

    const updateGameboard = () => {
        for (let i = 0; i < fieldElements.length; i++) {
            fieldElements[i].textContent = gameboard.getField(i);            
        }
    };

    const setMessage = (message) => {
        messageElement.textContent = message;
    }

    const setScore = (player, score) => {
        if(player === "X") playerXScore.textContent = score;
        if(player === "O") playerOScore.textContent = score;
    }

    return {setMessage, setScore, updateGameboard}
})();


// Gameplay
const gameplay = (() => {
    const playerX = Player("X");
    const playerO = Player("O"); 
    let round = 1;
    let gameOver = false;

    const playRound = (fieldIndex) => {
        gameboard.setField(fieldIndex, getCurrentPlayerSign());
        checkLastMove(fieldIndex);
    }

    const playCPURound = () => {
        let move = 0;
        while (true) {
            move = Math.floor(Math.random() * 9);
            if(gameboard.getField(move) == "") {
                gameboard.setField(move, getCurrentPlayerSign());
                displayController.updateGameboard();
                break;
            }
        }
        checkLastMove(move);        
    };

    const checkLastMove = (lastMove) => {
        if(checkWinner(lastMove)) {
            updateCurrentPlayerScore();
            displayController.setScore(getCurrentPlayerSign(), getCurrentPlayerScore());
            displayController.setMessage(`Player ${getCurrentPlayerSign()} Wins!`);
            gameOver = true;
            return;
        } 
        else if (round >= 9) {
            gameOver = true;
            displayController.setMessage("Draw!");
            return;
        }

        round++;
        displayController.setMessage(`Player ${getCurrentPlayerSign()}'s turn`);
    }

    const getCurrentPlayerSign = () => {
        return round % 2 == 1 ? playerX.getSign() : playerO.getSign();
    };

    const updateCurrentPlayerScore = () => {
        if (round % 2 == 1) {
            playerX.increaseScore();
        } 
        else {
            playerO.increaseScore();
        }
    };

    const getCurrentPlayerScore = () => {
        return round % 2 == 1 ? playerX.getScore() : playerO.getScore();
    };

    const checkWinner = (fieldIndex) => {
        var winConditions = [[0,1,2], [3,4,5], [6,7,8], // Row
                            [0,3,6], [1,4,7], [2,5,8],  // Column
                            [0,4,8], [6,4,2]];          // Diagonal

        return winConditions
            .filter((combination) => combination.includes(fieldIndex))
            .some((possibleCombination) =>
                possibleCombination.every(
                (index) => gameboard.getField(index) === getCurrentPlayerSign()
                )
            );
    };

    const isGameOver = () => {
        return gameOver;
    };

    const resetGame = () => {
        round = 1;
        gameOver = false;
    };

    return {playRound, isGameOver, resetGame, playCPURound}
})();


