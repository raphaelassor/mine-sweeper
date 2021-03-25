//------------- FUNCTIONS ON NUMS ----------//


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length - 1);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}



function drawNum2() {
    var idx = getRandomInt(0, gNums2.length)
    var num = gNums2[idx]
    gNums2.splice(idx, 1)
    return num
}



//------------- MULTI DIMENSIONAL ARRAYS--------//
function createRandomSymetric(rowsCols){

    var mat = [];
    for (var i = 0; i < rowsCols; i++) {
        mat[i] = [];
    }
    for (var i = 0; i < rowsCols; i++){
        for (var j =0; j <rowsCols; j++) {
           var num = getRandomInt(0, 100);
            mat[i][j] = num;
            mat[j][i] = num;
        }
    }
    return mat
}



function randomMat(cols, rows) {

    var mat = [];
    for (var i = 0; i < rows; i++) {
        mat[i] = [];
        for (var j = 0; j < cols; j++) {
            mat[i][j] = getRandomInt(0, 10);
        }
    }


    return mat;

}

function getObjectMap(mat) {

    var counterMap = {};

    for (var i = 0; i < mat.length; i++) {

        for (var j = 0; j < mat[0].length; j++) {
            var key = mat[i][j];
            var counter = counterMap[key];
            counterMap[key] = (counter) ? counter + 1 : 1;
        }
    }
    return counterMap;
}

function getArrayfromCols(mat, colsIdx) {
    var colsArr = [];
    for (var i = 0; i < mat.length; i++) {
        colsArr[i] = mat[i][colsIdx];
    }

    return colsArr;
}

//----------- OBJECTS ----------------//

function getObjectMap(txt) {
    var txtArr = txt.split(' ');

    var counterMap = {};

    for (var i = 0; i < txtArr.length; i++) {

        var word = txtArr[i];
        var counter = counterMap[word];

        counterMap[word] = (counter) ? ++counter : 1;

    }
    return counterMap;
}