const NORMAL = '🙂';
const DEAD = '🤯';
const WINNER = '😎';
const LIFE = '❤️'
const HINT = '💡'

var gInterval = null;
var gLog=[]
var gHistoryIndex=0;
localStorage.easyRecord = Infinity;
localStorage.mediumRecord = Infinity;
localStorage.hardRecord = Infinity;



function changeSize(size) {
    gLevel.size = size
    var mines = 2;
    switch (size) {
        case 8: mines = 12;
            break;
        case 12: mines = 30;
            break;
    }
    gLevel.mines = mines;
    reset();
}
function reset() {
    gGame.firstClick = false
    gGame.isOn = false;
    gGame.lives = getLives(gLevel.size)
    document.querySelector('.restart-btn').innerHTML = NORMAL;
    gGame.hints = 3;
    gGame.safeClicks = 3
    gGame.manualMineInput=false;
    gGame.manualMode=false
    document.getElementById('safe-click').innerHTML = gGame.safeClicks;
    renderLives()
    resetStopWatch();
    init();
}
function openLoseMsg() {
    endStopWatch();
    document.querySelector('.restart-btn').innerHTML = DEAD;

}

function openWinMsg() {
    document.querySelector('.restart-btn').innerHTML = WINNER;
    endStopWatch();
}
function renderLives() {
    var strHTML = ''
    for (var i = 1; i <= gGame.lives; i++) {
        strHTML += LIFE + ' ';
    }
    document.querySelector('span.life').innerHTML = strHTML;
}
function getLives(size) {

    var lives = (size === 4) ? 2 : 3
    return lives
}
//------------------Stopwatch--------------//
function timeCycle() {

    gGame.secsPassed++;
    document.querySelector('.stopwatch').innerHTML = gGame.secsPassed;


}
function startStopWatch() {
    gInterval = setInterval(timeCycle, 1000);
}
function endStopWatch() {
    clearInterval(gInterval);
}
function resetStopWatch() {
    endStopWatch();
    gGame.secsPassed = 0;
    document.querySelector('.stopwatch').innerHTML = `00`
}
//--------------Hint Mode------------------//
function renderHints() {
    var strHTML = ''
    for (var i = 1; i <= gGame.hints; i++) {
        strHTML += `<span onclick="turnHintModeOn(this)">${HINT}  </span>`
    }
    document.getElementById('hint').innerHTML = strHTML;
}

function turnHintModeOn(elHint) {
    if(!gGame.isOn) return;
    gGame.hintMode = true;
    gGame.hints--;
    elHint.classList.add('hint-select');
}
function cellClickHintMode(board, idxI, idxJ) {
    expandShown(board, idxI, idxJ)
    setTimeout(closeExpansion, 1000)
    function closeExpansion() {
        idxI = +idxI;
        idxJ = +idxJ;
        for (var i = idxI - 1; i <= idxI + 1 && i < board.length; i++) {
            if (i < 0) continue
            for (var j = idxJ - 1; j <= idxJ + 1 && j < board[0].length; j++) {
                if (j < 0) continue
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.classList.remove('hint-open')
                if (board[i][j].isShown) continue
                if (board[i][j].isFlagged) elCell.innerHTML = FLAG;
                else elCell.innerHTML = '';
            }
        }
        gGame.hintMode = false;
        renderHints()
    }
}

//------------Best Scores------------------//

function updateLocalStorage() {

    var level = 'hardRecord';

    if (gLevel.size === 4 && gGame.secsPassed < localStorage.easyRecord) {
        localStorage.easyRecord = gGame.secsPassed;
        level = 'easyRecord';
        renderScores(level)
        return
    }
    else if (gLevel.size === 8 && gGame.secsPassed < localStorage.mediumRecord) {
        localStorage.mediumRecord = gGame.secsPassed;
        level = 'mediumRecord';
        renderScores(level)
        return
    }
    else if (gLevel.size === 12 && gGame.secsPassed < localStorage.hardRecord) {
        localStorage.hardRecord = gGame.secsPassed;
        renderScores(level)
        return
    }

    // if(gGame.secsPassed<localStorage[gLevel.size]){
    //     localStorage[gLevel.size]=gGame.secsPassed ;
    //     renderScores();
    // }
}

function renderScores(level) {
    document.getElementById(`${gLevel.size}`).innerHTML = localStorage[level]
}

//------------- Safe click----------------//

function safeClick() {
    if (!gGame.safeClicks) return
    var safeCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) safeCells.push(gBoard[i][j])
        }
    }
    var safeCell = drawCell(safeCells)
    var elSafeCell = document.querySelector(`[data-i="${safeCell.i}"][data-j="${safeCell.j}"]`)
    elSafeCell.classList.add('hint-open');
    setTimeout(function () { elSafeCell.classList.remove('hint-open'); }, 1000)

    gGame.safeClicks--;
    document.getElementById('safe-click').innerHTML = gGame.safeClicks;
}

function drawCell(cells) {
    var idx = getRandomInt(0, cells.length)
    var cell = cells[idx]
    cells.splice(idx, 1)
    return cell
}

//------------ manual Mine Deployment-----------//

function cellManualMine(elCell, cell) {
    console.log('manual mine function');
    cell.isMine = true;
    renderCelltoOPen(elCell, MINE)
    setTimeout(function () {
        elCell.classList.remove('open');
        elCell.innerHTML = '';
    }, 500);
}

function toggleManualMineMode(elManualBtn) {
    
    if (gGame.isOn) return
    gGame.manualMode=true;
    console.log(`toggle function`)
    elManualBtn.classList.toggle("manual-mode-on");
    gGame.manualMineInput = (gGame.manualMineInput) ? false : true;
}

//------------ Undo Feature-------------------//

// function updateLog(board,game){
// //HOW DO I COPY OBJECTS WITHOUT THE REFERENCES??????  
// gHistoryIndex++; 
// gLog[gHistoryIndex]={
//     html: document.querySelector('body').innerHTML,
//     gBoard : copyBoardObjects(board),
//     gGame : copyGgame(game),
// }
// // console.log(gLog[gHistoryIndex].html)
// }

// function undoStep(){
//     if(gHistoryIndex<=0) return
//     document.querySelector('body').innerHTML=gLog[gHistoryIndex-1].html
//     gBoard=updateGboardOriginal(gLog[gHistoryIndex-1].gBoard);
//     gGame=updategGame(gLog[gHistoryIndex-1].gGame);
//     gHistoryIndex--;
// }

// function copyBoardObjects(board){
//     var newBoard=[]
// for(var i=0;i<board.length;i++){
//     newBoard[i]=[];
//     for(var j=0;j<board.length;j++){
//         newBoard[i][j]=copyCell(board[i][j]);
//     }
// }
//     return newBoard;
// }

// function updateGboardOriginal(board){
//     for(var i=0;i<board.length;i++){
//         for(var j=0;j<board.length;j++){
//             gBoard[i][j]=copyCell(board[i][j]);
//         }
//     }
// }



// function copyCell(cell){
//     var cell={
//         minesAroundCount: cell.minesAroundCount,
//                 isShown: cell.isShown,
//                 isMine: cell.isMine,
//                 isFlagged: cell.isFlagged,
//                 i: cell.i,
//                 j: cell.j
//     }
//     return cell;
// }

// function updategGame(game){
//     gGame = {
//         isOn: game.isOn,
//         firstClick:game.firstClick,
//         shownCount: game.shownCount,
//         flagCount: game.flagCount,
//         secsPassed: game.secsPassed,
//         lives: game.lives,
//         hints:game.lives,
//         hintMode:game.hintMode,
//         safeClicks:game.safeClicks,
//         manualMode:game.manualMode,
//         manualMineInput:game.manualMineInput
//     }

// }

// function copyGgame(game){
//     var newGame={
//         isOn: game.isOn,
//         firstClick:game.firstClick,
//         shownCount: game.shownCount,
//         flagCount: game.flagCount,
//         secsPassed: game.secsPassed,
//         lives: game.lives,
//         hints:game.lives,
//         hintMode:game.hintMode,
//         safeClicks:game.safeClicks,
//         manualMode:game.manualMode,
//         manualMineInput:game.manualMineInput
//     }
//     return newGame;
// }