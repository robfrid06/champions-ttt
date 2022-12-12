/*-------------------------------- Constants --------------------------------*/
const winningCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const moveCombos = [[4], [0, 2, 6, 8], [1, 3, 5, 7], [0, 1, 2, 3, 4, 5, 6, 7, 8]];
const winSums = [null, null, null, null, null, null, null, null];

/*---------------------------- Variables (state) ----------------------------*/
let board, turn, winner, tie, againstPlayer, checkCombo, checkmateCombo;

/*------------------------ Cached Element References ------------------------*/
const everyDiv = document.querySelectorAll(`.desktop :not(.sqr)`);
const paperEl = document.querySelector(`.paper`);
const gameBoard = document.querySelector(`.board`);
const squareEls = document.querySelectorAll(`.sqr`);
const messageEl = document.querySelector(`#message-writing`);
const optionButtons = document.querySelectorAll(`.option-button`);

/*----------------------------- Event Listeners -----------------------------*/
squareEls.forEach(squareEl => squareEl.addEventListener(`click`, handleClick));
optionButtons.forEach(optionButton => optionButton.addEventListener(`click`, init));

/*-------------------------------- Functions --------------------------------*/
function initMenu() {
  rotateEveryElement();
  runAnimation(paperEl, `1s moveIn`);
  gameBoard.style.visibility = `hidden`;
};

function init(evt) {
  resetAllAnimations();
  runAnimation(paperEl, `1s moveOut`);
  setTimeout(() => {
    gameBoard.style.visibility = `visible`;
    messageEl.innerHTML = ``;
    board = [null, null, null, null, null, null, null, null, null];
    winner = false;
    tie = false;
    checkCombo = null;
    checkmateCombo = null;
    if (evt.target.id === `against-player`) {
      againstPlayer = true;
      turn = {id: 1, name: `Student One`};
    } else {
      againstPlayer = false;
      turn = {id: 1, name: `Loser`};
    };
    render();
    rotateEveryElement();
    runAnimation(paperEl, `1s moveIn`);
  }, 1000);
};

function render() {
  updateBoard();
  updateMessage();
};

function updateBoard() {
  if (againstPlayer === true) {
    board.forEach((square, i) => {
      if (square === 1) {
        runAnimation(squareEls[i], `.25s textFadeIn`);
        squareEls[i].innerHTML = `X`;
      } else if (square === -1) {
        runAnimation(squareEls[i], `.25s textFadeIn`);
        squareEls[i].innerHTML = `O`; 
      } else {
        squareEls[i].innerHTML = ``;
      };
    });
  } else {
    board.forEach((square, i) => {
      if (square === 1) {
        runAnimation(squareEls[i], `.25s textFadeIn`);
        squareEls[i].innerHTML = `<span id="special-X">X<span>`;
      } else if (square === -1) {
        runAnimation(squareEls[i], `.25s textFadeIn`);
        squareEls[i].innerHTML = `<span id="special-O">O<span>`; 
      } else {
        squareEls[i].innerHTML = ``;
      };
    });
  };
};

function updateMessage() {
  runAnimation(messageEl, `.5s textFadeOut`);
  setTimeout(() => {
    if (againstPlayer === true) {
      if (winner === false && tie === false) {
        runAnimation(messageEl, `.5s textFadeIn`);
        messageEl.innerHTML = `Hurry up, ${turn.name}!`;
      } else if (winner === false && tie === true) {
        runAnimation(messageEl, `.5s textFadeIn`);
        messageEl.innerHTML = `You both lose!`;
      } else {
        runAnimation(messageEl, `.5s textFadeIn`);
        messageEl.innerHTML = `${turn.name} wins!`
      };
    } else {
      if (winner === false && tie === false && turn.id === 1) {
        runAnimation(messageEl, `.5s textFadeIn`);
        messageEl.innerHTML = `Good luck, ${turn.name}!`; 
      } else if (winner === false && tie === false && turn.id === -1) {
        runAnimation(messageEl, `.5s textFadeIn`);
        messageEl.innerHTML = `${turn.name} is deciding...`;
      } else if (winner === false && tie === true) {
        runAnimation(messageEl, `.5s textFadeIn`);
        messageEl.innerHTML = `You'll never beat<br><span class="champion">"The Champion"</span>!`;
      } else {
        runAnimation(messageEl, `.5s textFadeIn`);
        messageEl.innerHTML = `${turn.name} wins again!`;
      };
    };
  }, 500);
};

function handleClick(evt) {
  const sqrIdx = +evt.target.id.slice(2, 3);
  if (board[sqrIdx]) return;
  if (winner) return;
  placePiece(sqrIdx);
  checkForTie();
  checkForWinner();
  switchPlayerTurn();
  render();
  if (!againstPlayer) {
    squareEls.forEach(squareEl => squareEl.removeEventListener(`click`, handleClick));
    setTimeout(() => {
      const compIdx = calcCompIdx(sqrIdx);
      if (board[compIdx]) return;
      if (winner || tie) return;
      placePiece(compIdx);
      checkForTie();
      checkForWinner();
      switchPlayerTurn();
      render();
      squareEls.forEach(squareEl => squareEl.addEventListener(`click`, handleClick));
    }, 2000);
  };
};

function placePiece(idx) {
    board[idx] = turn.id;
};

function checkForTie() {
  board.includes(null) ? tie = false : tie = true;
};

function checkForWinner() {
  winningCombos.forEach(winningCombo => Math.abs(winningCombo.reduce((sqrsInARow, sqrId) => sqrsInARow + board[sqrId], 0)) === 3 ? winner = true : false);
};

function switchPlayerTurn() {
  if (winner === true) return;
  if (winner === false) {
    turn.id *= -1;
    if (againstPlayer) {
      turn.name === `Student One` ? turn.name = `Student Two` : turn.name = `Student One`;  
    } else {
      turn.name === `Loser` ? turn.name = `<span class="champion">"The Champion"</span>` : turn.name = `Loser`;  
    };
  };
};

/*---------------------------- Algorithm Functions ----------------------------*/

function calcCompIdx() {
  if (checkForCheckmate()) {
    return checkmate();
  } else if (checkForCheck()) {
    return cancelCheckmate();
  } else {
    return findOptimalMove();
  };
};

function checkForCheck() {
  return winningCombos.find((combo) => combo.reduce((sqrsInARow, sqrId) => sqrsInARow + board[sqrId], 0) === 2 ? checkCombo = combo : null);
};

function cancelCheckmate() {
  return checkCombo.find(sqrId => {
    return !board[sqrId];
  });
};

function checkForCheckmate() {
  return winningCombos.find((combo) => combo.reduce((sqrsInARow, sqrId) => sqrsInARow + board[sqrId], 0) === -2 ? checkmateCombo = combo : null);
};

function checkmate() {
  return checkmateCombo.find(sqrId => {
    return !board[sqrId];
  });
};

function checkCorners() {
  if (moveCombos[1].reduce((cornersOcc, cornerId) => board[cornerId] === -1 ? ++cornersOcc : cornersOcc,0) === 1) {
    return true;
  } else {
    return false;
  }
};

function findOptimalMove() {
  let availableMoves = moveCombos[3].filter(move => !board[move]);
  let optimalMoves = [];
  availableMoves.forEach(move => {
    if (optimalMoves.length === 0) {
      optimalMoves.push(move);
      return;
    };
    if (runSimulation(move, 1) === runSimulation(optimalMoves[0], 1)) {
      optimalMoves.push(move);
      return;
    } else if (runSimulation(move, 1) > runSimulation(optimalMoves[0], 1)){
      optimalMoves = [];
      optimalMoves.push(move);
    };
  });
  let filteredOptimalMoves = filterByMoveHierarchy(optimalMoves);
  return filteredOptimalMoves[Math.floor(Math.random() * filteredOptimalMoves.length)];
};

function runSimulation(move, turnValue) {
  let simulationBoard = Object.values(board);
  let simulationWinSums = Object.values(winSums);
  simulationBoard[move] = turnValue;
  updateWinSums(simulationBoard, simulationWinSums);
  return countWinSumsAtTwo(simulationWinSums);
};

function updateWinSums(boardName, sumList) {
  sumList.forEach(() => winningCombos.forEach((winningCombo, idx) => sumList[idx] = winningCombo.reduce((sqrsInARow, sqrId) => sqrsInARow + boardName[sqrId], 0)));
};

function countWinSumsAtTwo(sumList) {
  return sumList.reduce((totalWinSumsAtTwo, winSum) => {
    if (winSum === 2) {
      return totalWinSumsAtTwo + 1;
    } else {
      return totalWinSumsAtTwo;
    };
  }, 0);
};

function filterByMoveHierarchy(moves) {
  if (moves.includes(4)) {
    return [4];
  } else if (!moves.includes(4) && checkForIncludes(moves, 1)) {
    return moves.filter(move => {
      if (moveCombos[1].includes(move)) {
        return ++move;
      };
    });
  } else {
    return moves;
  };
};

function checkForIncludes(arr, comboId) {
  return arr.some(move => {
    if (moveCombos[comboId].includes(move)) {
      return true;
    };
  });
};

/*---------------------------- CSS Functions ----------------------------*/

function rotateEveryElement() {
  everyDiv.forEach(eachDiv => {
    eachDiv.style.transform = `rotate(${pickRandomNumber(-5, 5)}deg)`;
  });
};

function pickRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
};

function runAnimation(elementRef, animationName) {
  elementRef.style.animation = animationName;
}

function resetAllAnimations() {
    squareEls.forEach(squareEls => {
      squareEls.style.animation = ``;
    });
    everyDiv.forEach(eachDiv => {
      eachDiv.style.animation = ``;
    });
};

/*---------------------------- Start Function ----------------------------*/

initMenu();

