

var gBoard;
var gSize;
var gGame = {
    isOn: false,
    firstClick: false,
    shownCount: 0,
    flagCount: 0,
    secsPassed: 0,
    lives: 3,
    hints: 3,
    hintMode: false,
    safeClicks: 3,
    manualMode: false,
    manualMineInput: false
}
var gLevel = {
    size: 8,
    mines: 12
}
const MINE = '💣'
const FLAG = '🇮🇱'

function init() {
    gBoard = createBoard(gLevel.size)
    renderBoard(gBoard);
    renderLives();
    renderHints();
}

function createBoard(size) {
    board = [];
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isFlagged: false,
                i: i,
                j: j
            }
        }
    }
    // deployMines(board, size)
    // setMinesNegsCount(board)
    return board;
}
function deployMines(board, size) {
    var mines = 2;
    switch (size) {
        case 8: mines = 12;
            break;
        case 12: mines = 30;
            break;
    }
    var minesCount = 0;
    while (minesCount < mines) {
        var idxI = getRandomInt(0, size)
        var idxJ = getRandomInt(0, size)
        if (!board[idxI][idxJ].isMine && !board[idxI][idxJ].isShown) {
            board[idxI][idxJ].isMine = true;
            minesCount++;
        }
        else continue
    }
}
function setMinesNegsCount(board) {
    //runs on all the board, updating each cell with the function. 
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setCellMinesCount(board[i][j], board);
        }
    }
}

function setCellMinesCount(cell, board) {
    var mineNegCounter = 0;
    for (var i = cell.i - 1; i <= cell.i + 1 && i < board.length; i++) {
        if (i < 0) continue
        for (var j = cell.j - 1; j <= cell.j + 1 && j < board[0].length; j++) {
            if (j < 0) continue
            if (j === cell.j && i === cell.i) continue
            if (board[i][j].isMine) mineNegCounter++;
        }
    }
    return mineNegCounter;
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < board[0].length; j++) {
            strHTML += `<td class="cell" onmousedown="cellClicked(this,event)" data-i="${i}" data-j="${j}"></td>`
        }
        strHTML += `</tr>`
    }
    var elTable = document.querySelector('table');
    elTable.innerHTML = strHTML;
}

function cellClicked(elCell, event) {
    var idxI = elCell.getAttribute('data-i');
    var idxJ = elCell.getAttribute('data-j');
    var cell = gBoard[idxI][idxJ];
    if (gGame.manualMineInput) {
        cellManualMine(elCell, cell)
        return
    }
    if (event.button === 2) {
        // updateLog(gBoard,gGame)
        markCell(elCell)
        checkGameWon()
        return;
    }
    else if (cell.isFlagged || cell.isShown) return;
    if (gGame.hintMode) {
        cellClickHintMode(gBoard, idxI, idxJ);
        return;
    }
    //first click initializer
    if (!gGame.firstClick) {
        firstClick(elCell);
        cell.isShown = true;
        // updateLog(gBoard,gGame)
    }
    if (!gGame.isOn) return;
    //mark cell 
    //hintMode

    var value = cell.minesAroundCount;
    //clicked on mine 
    if (cell.isMine) {
        value = MINE;
        gGame.lives--;
        renderLives();
        // updateLog(gBoard,gGame)
        if (!gGame.lives) {
            gGame.isOn = false
            showAllMines();
            openLoseMsg();
            return
        }
    }
    //empty cell : can't be a bomb because of else. 
    else if (!cell.minesAroundCount) {
        expandShown(gBoard, idxI, idxJ);
        // updateLog(gBoard,gGame)
        checkGameWon()
        return
    }
    cell.isShown = true;
    checkGameWon();
    renderCelltoOPen(elCell, value)
    // updateLog(gBoard,gGame)
}
function firstClick(elCell) {
    renderCelltoOPen(elCell, '');
    startStopWatch();
    if (!gGame.manualMode) deployMines(gBoard, gLevel.size)
    setMinesNegsCount(gBoard)
    gGame.firstClick = true;
    gGame.isOn = true;
}

function renderCelltoOPen(elCell, value) {

    if (!gGame.hintMode) elCell.classList.add('open');
    else elCell.classList.add('hint-open');
    elCell.innerHTML = value;
}

function markCell(elCell) {
    var idxI = elCell.getAttribute('data-i');
    var idxJ = elCell.getAttribute('data-j');
    console.log(`flagCell Function Called`)
    if (!gBoard[idxI][idxJ].isFlagged) {
        gBoard[idxI][idxJ].isFlagged = true;
        gGame.flagCount++;
        elCell.innerHTML = FLAG
    }
    else {
        elCell.innerHTML = '';
        gGame.flagCount--;
        gBoard[idxI][idxJ].isFlagged = false;
    }
}

function showAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                renderCelltoOPen(elCell, MINE);
            }
        }
    }
}

function checkGameWon() {

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine && !cell.isShown) {
                if (!cell.isFlagged) return//mine and not shown-has to be a flag
            }
            else if (!cell.isShown) return;
        }
    }
    // all mines are marked, all other cells are shown
    gGame.isOn = false;
    updateLocalStorage();
    openWinMsg();
}

function expandShown(board, idxI, idxJ) {
    idxI = +idxI;
    idxJ = +idxJ;
    for (var i = idxI - 1; i <= idxI + 1 && i < board.length; i++) {
        if (i < 0) continue
        for (var j = idxJ - 1; j <= idxJ + 1 && j < board[0].length; j++) {
            if (j < 0) continue
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
            var cell = board[i][j]
            var value = (cell.minesAroundCount) ? cell.minesAroundCount : '';
            if (gGame.hintMode) {
                if (cell.isMine) value = MINE;
                renderCelltoOPen(elCell, value);
                continue
            }
            if (cell.isFlagged) continue
            if (!cell.minesAroundCount && !cell.isShown && !cell.isMine) {
                cell.isShown = true;
                expandShown(board, i, j);
            }
            renderCelltoOPen(elCell, value)
            cell.isShown = true;
        }
    }
}

