/*-------------------------------- Constants --------------------------------*/
const winningCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

/*---------------------------- Variables (state) ----------------------------*/
let board, turn, winner, tie;

/*------------------------ Cached Element References ------------------------*/
const squareEls = document.querySelectorAll(`.sqr`);
const messageEl = document.querySelector(`#message`);
const playerButton = document.querySelector('#against-player');
const computerButton = document.querySelector('#against-computer');

/*----------------------------- Event Listeners -----------------------------*/
squareEls.forEach(squareEl => squareEl.addEventListener(`click`, handleClick));
playerButton.addEventListener(`click`, init);
computerButton.addEventListener(`click`, init);

/*-------------------------------- Functions --------------------------------*/
function init() {
  board = [null, null, null, null, null, null, null, null, null];
  turn = 1;
  winner = false;
  tie = false;
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
  winner === false && tie === false ? messageEl.innerHTML = `It is Player ${turn}'s turn.` : 
  winner === false && tie === true ? messageEl.innerHTML = `It is a tie!` :
  messageEl.innerHTML = `Player ${turn} wins!`;
};

function handleClick(evt) {
  const sqrIdx = evt.target.id.slice(2, 3);
  if (board[sqrIdx]) return;
  if (winner) return;
  placePiece(sqrIdx);
  checkForTie();
  checkForWinner();
  switchPlayerTurn();
  render();
};

function placePiece(idx) {
  board[idx] = turn;
};

function checkForTie() {
  board.includes(null) ? tie = false : tie = true;
};

function checkForWinner() {
  winningCombos.forEach(winningCombo => Math.abs(winningCombo.reduce((sqrsInARow, sqrId) => sqrsInARow + board[sqrId], 0)) === 3 ? winner = true : false);
};

function switchPlayerTurn() {
  if (winner === true) return;
  if (winner === false) turn *= -1;
};

init();
