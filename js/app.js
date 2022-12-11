/*-------------------------------- Constants --------------------------------*/
const winningCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const moveCombos = [[4], [0, 2, 6, 8], [1, 3, 5, 7], [0, 1, 2, 3, 4, 5, 6, 7, 8]];
const winSums = [null, null, null, null, null, null, null, null];

/*---------------------------- Variables (state) ----------------------------*/
let board, turn, winner, tie, againstPlayer, checkCombo, checkmateCombo;

/*------------------------ Cached Element References ------------------------*/
const gameBoard = document.querySelector(`.board`);
const squareEls = document.querySelectorAll(`.sqr`);
const messageEl = document.querySelector(`#message`);
const optionButtons = document.querySelectorAll(`.option-button`);

/*----------------------------- Event Listeners -----------------------------*/
squareEls.forEach(squareEl => squareEl.addEventListener(`click`, handleClick));
optionButtons.forEach(optionButton => optionButton.addEventListener(`click`, init));

/*-------------------------------- Functions --------------------------------*/
function initMenu() {
  gameBoard.style.visibility = `hidden`;
};

function init(evt) {
  gameBoard.style.visibility = `visible`;
  board = [null, null, null, null, null, null, null, null, null];
  winner = false;
  tie = false;
  checkCombo = null;
  checkmateCombo = null;
  if (evt.target.id === `against-player`) {
    againstPlayer = true;
    turn = {id: 1, name: `One`};
  } else {
    againstPlayer = false;
    turn = {id: 1, name: `Human`};
  };
  render();
};

function render() {
  updateBoard();
  updateMessage();
};

function updateBoard() {
  board.forEach((square, i) => {
    square === 1 ? squareEls[i].innerHTML = `X` : 
    square === -1 ? squareEls[i].innerHTML = `O` : 
    squareEls[i].innerHTML = ``;
  });
};

function updateMessage() {
  winner === false && tie === false ? messageEl.innerHTML = `It is Player ${turn.name}'s turn.` : 
  winner === false && tie === true ? messageEl.innerHTML = `It is a tie!` :
  messageEl.innerHTML = `Player ${turn.name} wins!`;
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
    const compIdx = calcCompIdx(sqrIdx);
    if (board[compIdx]) return;
    if (winner) return;
    placePiece(compIdx);
    checkForTie();
    checkForWinner();
    switchPlayerTurn();
    render();
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
      turn.name === `One` ? turn.name = `Two` : turn.name = `One`;  
    } else {
      turn.name === `Human` ? turn.name = `Computer` : turn.name = `Human`;  
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

initMenu();