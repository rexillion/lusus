const standardBoardToBuffered = [21,22,23,24,25,26,27,28,
                                 31,32,33,34,35,36,37,38,
                                 41,42,43,44,45,46,47,48,
                                 51,52,53,54,55,56,57,58,
                                 61,62,63,64,65,66,67,68,
                                 71,72,73,74,75,76,77,78,
                                 81,82,83,84,85,86,87,88,
                                 91,92,93,94,95,96,97,98];
const invertedBoardToStandard = [56,57,58,59,60,61,62,63,
                                 48,49,50,51,52,53,54,55,
                                 40,41,42,43,44,45,46,47,
                                 32,33,34,35,36,37,38,39,
                                 24,25,26,27,28,29,30,31,
                                 16,17,18,19,20,21,22,23,
                                  8, 9,10,11,12,13,14,15,
                                  0, 1, 2, 3, 4, 5, 6, 7];
const pieceNames = ["Empty","whiteKing","whiteQueen","whiteRook","whiteBishop","whiteKnight","whitePawn",
"blackKing","blackQueen","blackRook","blackBishop","blackKnight","blackPawn","Border"];
const castlingAvailabilityStringToCode = ["-","K","Q","KQ","k","Kk","Qk","KQk","q","Kq","Qq","KQq","kq","Kkq","Qkq","KQkq"];
const pieceSymbolToCode = ["K","Q","R","B","N","P","k","q","r","b","n","p"];
const colorToCode = ["w","b"];
const possibleEmptySquareNumbers = ["/","1","2","3","4","5","6","7","8"];
const fileNames = ["a","b","c","d","e","f","g","h"];
const directions = [10,11,1,-9,-10,-11,-1,9];
const codeToAlgebraicSymbol = ["","K","Q","R","B","N"];
 
function pieceToColor(pieceCode) {
    if (0 < pieceCode && pieceCode < 7) {return 0;}
    if (6 < pieceCode && pieceCode < 13) {return 1;}
}

function boardIndexToFile(index) {
    return index%10 - 1;
}
function boardIndexToRank(index) {
    return Math.floor(index/10) - 2;
}

function bufferedIndexToCoordinates(index) {
    return fileNames[boardIndexToFile(index)] + (boardIndexToRank(index)+1);
}
function coordinatesToStandardIndex(index) {
    indexCharacters = index.split("");
    return fileNames.indexOf(indexCharacters[0]) + ((+indexCharacters[1])-1)*8;
}

function moveToAlgebraic(move, legalMoves, board, isCheck, isCheckMate) {
    legalMoves.splice(legalMoves.indexOf(move), 1);
    let noPromotionMoves = removePromotionNotationFromMovelist(legalMoves, board);
    let moveParts = [Math.floor(move/100), move%100, promotionNotationToMove(move, board)%100];
    let returnString = "";
    returnString += codeToAlgebraicSymbol[board[moveParts[0]]%6];
    if ((board[moveParts[0]]%6 == 0 && board[moveParts[2]] != 0) || (noPromotionMoves.find(move => boardIndexToRank(move%100) == boardIndexToRank(moveParts[2]) && move%100 == moveParts[2] && board[Math.floor(move/100)] == board[moveParts[0]] && Math.floor(move/100)!=moveParts[0]) ?? 0 )!= 0) {
        returnString += fileNames[boardIndexToFile(moveParts[0])];
    }
    if (noPromotionMoves.find(move => boardIndexToFile(move%100) == boardIndexToFile(moveParts[2]) && move%100 == moveParts[2] && board[Math.floor(move/100)] == board[moveParts[0]] && Math.floor(move/100)!=moveParts[0]) ?? 0 != 0) {
        returnString += boardIndexToRank(moveParts[0])+1;
    }
    if (board[moveParts[2]] != 0) {
        returnString += 'x';
    }
    returnString += bufferedIndexToCoordinates(moveParts[2]);
    if (moveParts[2] != moveParts[1]) {
        returnString += "=";
        returnString += codeToAlgebraicSymbol[moveParts[1]%10];
    }
    if (isCheck || isCheckMate) {
        if (isCheckMate) {
            returnString += "#";
        } else {
            returnString += "+";
        }
    }
    
    return returnString;
}

function getBoardDisplayString(board) {
    let chessPieceImageString = "";
    for (let outputBoardIndex = 21; outputBoardIndex < 99; outputBoardIndex++) {
        if (![1,2,3,4,5,6,7,8,9,10,11,12].includes(board[outputBoardIndex])) {
            continue;
        }
        chessPieceImageString += "<img class ='chessPieceImage' src='pieces/"
        +pieceNames[board[outputBoardIndex]]+".svg' style='bottom:"
        +(boardIndexToRank(outputBoardIndex)*10.625).toString()+"vh; left: "
        +(boardIndexToFile(outputBoardIndex)*10.625).toString()+"vh;'></img>";
    }
    return chessPieceImageString;
}
function displayBoard(board) {
    document.getElementById('chessPieceImageContainer').innerHTML=getBoardDisplayString(board);
}

function initializeBoard() {
    let boardArray = [];
    for (let boardArrayInitializationIndex = 0; boardArrayInitializationIndex < 120; boardArrayInitializationIndex++) {
        if (standardBoardToBuffered.includes(boardArrayInitializationIndex)) {
            boardArray.push(0);
            continue;
        }
        boardArray.push(13);
    }
    boardArray.push(0,0,0,0,0);
    return boardArray;
}
function promotionNotationToMove(move, board) {
    move = +move;
    let moveParts = Array(2);
    moveParts[0] = Math.floor(move/100);
    moveParts[1] = move%100;
    let colorMultiplier = board[120] * -2 + 1;
    if (boardIndexToRank(moveParts[0]) == [6,1][board[120]] && board[moveParts[0]] == [6,12][board[120]]) {
        moveParts[1] = moveParts[0] + colorMultiplier*([9,10,11][Math.floor(moveParts[1]/10)]);
    }
    return moveParts[0]*100+moveParts[1];
}
function removePromotionNotationFromMovelist(moveList, board) {
    let returnArray = [];
    for(move of moveList) {
        returnArray.push(promotionNotationToMove(move, board));
    }
    return returnArray;
}
function castlingCodeToArray(code) {
    return [code%2, Math.floor(code/2)%2, Math.floor(code/4)%2, Math.floor(code/8)];
}

function interpretFEN(FENString) {
    let FENStringParts = FENString.split(" ");
    let boardModificationIndex = 0;
    let FENStringCharacters = FENStringParts[0].split("");
    boardToReturn = initializeBoard();
    for (let FENStringAnalysisIndex = 0; FENStringAnalysisIndex < FENStringCharacters.length; FENStringAnalysisIndex++) {
        if (pieceSymbolToCode.includes(FENStringCharacters[FENStringAnalysisIndex])) {
            boardToReturn[standardBoardToBuffered[invertedBoardToStandard[boardModificationIndex]]] = pieceSymbolToCode.indexOf(FENStringCharacters[FENStringAnalysisIndex]) + 1;
            boardModificationIndex++;
            continue;
        }
        if (possibleEmptySquareNumbers.includes(FENStringCharacters[FENStringAnalysisIndex])) {
            boardModificationIndex += possibleEmptySquareNumbers.indexOf(FENStringCharacters[FENStringAnalysisIndex]);
            continue;
        }
        //if invalid character: return empty board
        return initializeBoard();
    }
    boardToReturn[120] = colorToCode.indexOf(FENStringParts[1]);
    boardToReturn[121] = castlingAvailabilityStringToCode.indexOf(FENStringParts[2]);
    boardToReturn[122] = standardBoardToBuffered[coordinatesToStandardIndex(FENStringParts[3])] ?? 0;
    boardToReturn[123] = +FENStringParts[4];
    boardToReturn[124] = (+FENStringParts[5]) - 1;
    return boardToReturn;
}

function generateMoves(board) {
    let moveList = [];
    let colorToPlay = board[120];
    let colorMultiplier = board[120] * -2 + 1;
    let emptySquares = Array();
    let occupiedSquares = Array();
    let friendlySquares = Array();
    let enemySquares = Array();
    let attackedSquares = [];
    let friendlyKingSquare = board.indexOf(6*colorToPlay+1);
    let checkingMoves = [];
    let squaresOfPinnedPieces = Array(8).fill(0);

    for (let squareCategorizationIndex = 21; squareCategorizationIndex < 99; squareCategorizationIndex++) {
        if (!standardBoardToBuffered.includes(squareCategorizationIndex)) {
            continue;
        }
        if (board[squareCategorizationIndex] == 0) {
            emptySquares.push(squareCategorizationIndex);
            continue;
        }
        if (pieceToColor(board[squareCategorizationIndex]) === colorToPlay) {
            friendlySquares.push(squareCategorizationIndex);
            occupiedSquares.push(squareCategorizationIndex);
            continue;
        }
        enemySquares.push(squareCategorizationIndex);
        occupiedSquares.push(squareCategorizationIndex);
    }

    board[120] = (board[120]+1)%2;
    let rawNextMoves = generateAttackedMap(board);
    board[120] = (board[120]+1)%2;
    for (let attackedSquareIndex = 0; attackedSquareIndex < rawNextMoves.length; attackedSquareIndex++) {
        attackedSquares.push(rawNextMoves[attackedSquareIndex]%100);
        if (rawNextMoves[attackedSquareIndex]%100 == friendlyKingSquare) {
            //King is under attack
            checkingMoves.push(rawNextMoves[attackedSquareIndex]);
        }
    }
    
    //Pinned piece locator
    for (let pinnedPieceSearchDirectionIndex = 0; pinnedPieceSearchDirectionIndex < 8; pinnedPieceSearchDirectionIndex++) {
        for (let moveIndexer = friendlyKingSquare + directions[pinnedPieceSearchDirectionIndex];
            board[moveIndexer] != 13; moveIndexer += directions[pinnedPieceSearchDirectionIndex]) {
            if (friendlySquares.includes(moveIndexer)){
                let pieceToBePinned = moveIndexer;
                moveIndexer += directions[pinnedPieceSearchDirectionIndex];
                while (board[moveIndexer] != 13 && !friendlySquares.includes(moveIndexer)) {
                    // [2,3,8,9] if vertical check
                    if ([2,3 + pinnedPieceSearchDirectionIndex%2,8,9 + pinnedPieceSearchDirectionIndex%2].includes(board[moveIndexer])) {
                        squaresOfPinnedPieces[pinnedPieceSearchDirectionIndex] = pieceToBePinned;
                        break;
                    }
                    if (enemySquares.includes(moveIndexer)) {
                        break;
                    }
                    moveIndexer += directions[pinnedPieceSearchDirectionIndex];
                } 
                break;
            }
            if (enemySquares.includes(moveIndexer)) {
                break;
            }
        }
    }

    let squaresToStartFrom = structuredClone(friendlySquares);

    //Rook
    for (let rookMoveGenerationIndexInFriendlySquares = 0; rookMoveGenerationIndexInFriendlySquares < squaresToStartFrom.length; rookMoveGenerationIndexInFriendlySquares++) {
        if (board[squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares]] != 3 + colorToPlay*6 
            && board[squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares]] != 2 + colorToPlay*6 ) {
            continue;
        }
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,10));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,1));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,-10));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,-1));
        if (board[squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares]] == 3 + colorToPlay*6) {
            squaresToStartFrom.splice(rookMoveGenerationIndexInFriendlySquares,1);
            rookMoveGenerationIndexInFriendlySquares--;
        }
    }

    //Bishop
    for (let bishopMoveGenerationIndexInFriendlySquares = 0; bishopMoveGenerationIndexInFriendlySquares < squaresToStartFrom.length; bishopMoveGenerationIndexInFriendlySquares++) {
        if (board[squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares]] != 4 + colorToPlay*6 
            && board[squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares]] != 2 + colorToPlay*6 ) {
            continue;
        }
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,11));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,-9));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,-11));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,9));
        squaresToStartFrom.splice(bishopMoveGenerationIndexInFriendlySquares,1);
        bishopMoveGenerationIndexInFriendlySquares--;
    }

    //Knight
    for (let knightMoveGenerationIndexInFriendlySquares = 0; knightMoveGenerationIndexInFriendlySquares < squaresToStartFrom.length; knightMoveGenerationIndexInFriendlySquares++) {
        if (board[squaresToStartFrom[knightMoveGenerationIndexInFriendlySquares]] != 5 + colorToPlay*6 ) {
            continue;
        }
        moveList = moveList.concat(findMappedMoves(squaresToStartFrom[knightMoveGenerationIndexInFriendlySquares], friendlySquares, [21,19,12,-12,-19,-21,-8,8],[]));
        squaresToStartFrom.splice(knightMoveGenerationIndexInFriendlySquares,1);
        knightMoveGenerationIndexInFriendlySquares--;
    }

    //Pawn
    for (let pawnMoveGenerationIndexInFriendlySquares = 0; pawnMoveGenerationIndexInFriendlySquares < squaresToStartFrom.length; pawnMoveGenerationIndexInFriendlySquares++) {
        if (board[squaresToStartFrom[pawnMoveGenerationIndexInFriendlySquares]] != 6 + colorToPlay*6 ) {
            continue;
        }
        moveList = moveList.concat(findPawnMoves(squaresToStartFrom[pawnMoveGenerationIndexInFriendlySquares], board, enemySquares, emptySquares));
        squaresToStartFrom.splice(pawnMoveGenerationIndexInFriendlySquares,1);
        pawnMoveGenerationIndexInFriendlySquares--;
    }

    //King
    moveList = moveList.concat(findMappedMoves(squaresToStartFrom[0], friendlySquares, directions,attackedSquares));

    //Castling
    let castlingAvailability = castlingCodeToArray(board[121]);
    let intermediateSquareIsOk  = (board[friendlyKingSquare+1] == 0 && !attackedSquares.includes(friendlyKingSquare+1));
    let destinationSquareIsOk = (board[friendlyKingSquare+2] == 0 && !attackedSquares.includes(friendlyKingSquare+2));
    //Kingside
    if (castlingAvailability[colorToPlay*2] == 1
    && intermediateSquareIsOk && destinationSquareIsOk && checkingMoves.length == 0) {
        moveList.push(friendlyKingSquare*100+friendlyKingSquare+2);
    }
    //QueenSide
    intermediateSquareIsOk = (board[friendlyKingSquare-1] == 0 && !attackedSquares.includes(friendlyKingSquare-1) && board[friendlyKingSquare-3] == 0);
    destinationSquareIsOk = (board[friendlyKingSquare-2] == 0 && !attackedSquares.includes(friendlyKingSquare-2));
    if (castlingAvailability[colorToPlay*2 + 1] == 1
        && intermediateSquareIsOk && destinationSquareIsOk && checkingMoves.length == 0) {
            moveList.push(friendlyKingSquare*100+friendlyKingSquare-2);
        }

    for (let pinnedPieceSearchDirectionIndex = 0; pinnedPieceSearchDirectionIndex < 8; pinnedPieceSearchDirectionIndex++) {
        for (let filteringIndex = 0; filteringIndex < moveList.length; filteringIndex++) {
            if (Math.floor(moveList[filteringIndex]/100) != squaresOfPinnedPieces[pinnedPieceSearchDirectionIndex]) {
                continue;
            } 
            let squareDifference = (Math.abs(Math.floor(moveList[filteringIndex]/100) - promotionNotationToMove(moveList[filteringIndex],board)%100));
            if (squareDifference%(directions[pinnedPieceSearchDirectionIndex]) == 0) {
                if (Math.abs(directions[pinnedPieceSearchDirectionIndex]) == 1 && boardIndexToRank(Math.floor(moveList[filteringIndex]/100)) != boardIndexToRank(moveList[filteringIndex]%100)) {
                    moveList.splice(filteringIndex,1);
                    filteringIndex--;
                }
                continue;
            }
            moveList.splice(filteringIndex,1);
            filteringIndex--;
        }
    }

    for (let checkingMoveIndex = 0; checkingMoveIndex < checkingMoves.length; checkingMoveIndex ++) {
        let checkOriginSquare = Math.floor(checkingMoves[checkingMoveIndex]/100);
        let interjectionSquares = [];
        if (1 < board[checkOriginSquare]%6 < 5) {
            //vertical move filewise
            if (checkOriginSquare%10 == friendlyKingSquare%10) {
                findInterjections(friendlyKingSquare, checkOriginSquare, board, interjectionSquares, 10)
            }
            //vertical move rankwise
            if (Math.round(checkOriginSquare/10) == Math.round(friendlyKingSquare/10)) {
                findInterjections(friendlyKingSquare, checkOriginSquare, board, interjectionSquares, 1)
            }
            //diagonal 11
            if ((checkOriginSquare-friendlyKingSquare)%11 == 0) {
                findInterjections(friendlyKingSquare, checkOriginSquare, board, interjectionSquares, 11)
            }
            //diagonal 9
            if ((checkOriginSquare-friendlyKingSquare)%9 == 0) {
                findInterjections(friendlyKingSquare, checkOriginSquare, board, interjectionSquares, 9)
            }
        }
        for (let filteringIndex = 1; filteringIndex-1 < moveList.length; filteringIndex++) {
            //king escape
            if (Math.floor(moveList[filteringIndex-1]/100) == friendlyKingSquare) {
                continue;
            }
            //capturing
            if (moveList[filteringIndex-1]%100 == checkOriginSquare) {
                continue;
            }
            //interjection
            if (interjectionSquares.includes(moveList[filteringIndex-1]%100)) {
                continue;
            }
            moveList.splice(filteringIndex-1,1);
            filteringIndex--;
        }
    }



    return moveList;
}

function exploreSlidingDirection(startSquare, board, friendlySquares, enemySquares, squareDifference) {
    let slideMoves = [];
    for (let slideExplorationIndex = startSquare + squareDifference; 
        board[slideExplorationIndex] != 13 && !friendlySquares.includes(slideExplorationIndex); slideExplorationIndex += squareDifference) {
            if (enemySquares.includes(slideExplorationIndex)) {
                slideMoves.push(startSquare*100 + slideExplorationIndex);
                break;
            }
            slideMoves.push(startSquare*100 + slideExplorationIndex);
    }
    return slideMoves;
}

function generateAttackedMap(board) {
    let moveList = [];
    let colorToPlay = board[120];
    let emptySquares = Array();
    let occupiedSquares = Array();
    let friendlySquares = Array();
    let enemySquares = Array();
    let friendlyKingSquare = board.indexOf(6*colorToPlay+1);

    for (let squareCategorizationIndex = 21; squareCategorizationIndex < 99; squareCategorizationIndex++) {
        if (!standardBoardToBuffered.includes(squareCategorizationIndex)) {
            continue;
        }
        if (board[squareCategorizationIndex] == 0) {
            emptySquares.push(squareCategorizationIndex);
            continue;
        }
        if (pieceToColor(board[squareCategorizationIndex]) === colorToPlay) {
            friendlySquares.push(squareCategorizationIndex);
            occupiedSquares.push(squareCategorizationIndex);
            continue;
        }
        enemySquares.push(squareCategorizationIndex);
        occupiedSquares.push(squareCategorizationIndex);
    }

    let squaresToStartFrom = structuredClone(friendlySquares);
    enemySquares.splice(enemySquares.indexOf(board.indexOf(6*((colorToPlay+1)%2)+1)),1);
    enemySquares = enemySquares.concat(friendlySquares);
    friendlySquares = [];
    //Rook
    for (let rookMoveGenerationIndexInFriendlySquares = 0; rookMoveGenerationIndexInFriendlySquares < squaresToStartFrom.length; rookMoveGenerationIndexInFriendlySquares++) {
        if (board[squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares]] != 3 + colorToPlay*6 
            && board[squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares]] != 2 + colorToPlay*6 ) {
            continue;
        }
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,10));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,1));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,-10));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,-1));
        if (board[squaresToStartFrom[rookMoveGenerationIndexInFriendlySquares]] == 3 + colorToPlay*6) {
            squaresToStartFrom.splice(rookMoveGenerationIndexInFriendlySquares,1);
            rookMoveGenerationIndexInFriendlySquares--;
        }
    }

    //Bishop
    for (let bishopMoveGenerationIndexInFriendlySquares = 0; bishopMoveGenerationIndexInFriendlySquares < squaresToStartFrom.length; bishopMoveGenerationIndexInFriendlySquares++) {
        if (board[squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares]] != 4 + colorToPlay*6 
            && board[squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares]] != 2 + colorToPlay*6 ) {
            continue;
        }
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,11));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,-9));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,-11));
        moveList = moveList.concat(exploreSlidingDirection(squaresToStartFrom[bishopMoveGenerationIndexInFriendlySquares],board,friendlySquares,enemySquares,9));
        squaresToStartFrom.splice(bishopMoveGenerationIndexInFriendlySquares,1);
        bishopMoveGenerationIndexInFriendlySquares--;
    }

    //Knight
    for (let knightMoveGenerationIndexInFriendlySquares = 0; knightMoveGenerationIndexInFriendlySquares < squaresToStartFrom.length; knightMoveGenerationIndexInFriendlySquares++) {
        if (board[squaresToStartFrom[knightMoveGenerationIndexInFriendlySquares]] != 5 + colorToPlay*6 ) {
            continue;
        }
        moveList = moveList.concat(findMappedMoves(squaresToStartFrom[knightMoveGenerationIndexInFriendlySquares], friendlySquares, [21,19,12,-12,-19,-21,-8,8],[]));
        squaresToStartFrom.splice(knightMoveGenerationIndexInFriendlySquares,1);
        knightMoveGenerationIndexInFriendlySquares--;
    }

    //Pawn
    for (let pawnMoveGenerationIndexInFriendlySquares = 0; pawnMoveGenerationIndexInFriendlySquares < squaresToStartFrom.length; pawnMoveGenerationIndexInFriendlySquares++) {
        if (board[squaresToStartFrom[pawnMoveGenerationIndexInFriendlySquares]] != 6 + colorToPlay*6 ) {
            continue;
        }
        moveList = moveList.concat(findPawnAttackMap(board, squaresToStartFrom[pawnMoveGenerationIndexInFriendlySquares]));
        squaresToStartFrom.splice(pawnMoveGenerationIndexInFriendlySquares,1);
        pawnMoveGenerationIndexInFriendlySquares--;
    }

    //King
    moveList = moveList.concat(findMappedMoves(squaresToStartFrom[0], [], directions, []));



    return moveList;
}

function findMappedMoves(startSquare, friendlySquares, destinationDifferences,attackedSquares) {
    let mappedDestinations = destinationDifferences;
    let mappedMoves = [];
    for (let mappedDestinationIndex = 0; mappedDestinationIndex < 8; mappedDestinationIndex++) {
        if (!standardBoardToBuffered.includes(startSquare + mappedDestinations[mappedDestinationIndex])
        || friendlySquares.includes(startSquare + mappedDestinations[mappedDestinationIndex])
        || attackedSquares.includes(startSquare + mappedDestinations[mappedDestinationIndex])) {
            continue;
        }
        mappedMoves.push(startSquare*100+startSquare + mappedDestinations[mappedDestinationIndex]);
    }
    return mappedMoves;
}
function findPawnMoves(startSquare, board, enemySquares, emptySquares) {
    let pawnMoves = [];
    //0 -> 1
    //1 -> -1
    let colorMultiplier = board[120] * -2 + 1;
    let enPassantTarget = board[122];
    if (enPassantTarget != 0) {
    enemySquares.push(enPassantTarget);
    }
    //PROMOTION
    if (boardIndexToRank(startSquare) == [6,1][board[120]]) {
        if (enemySquares.includes(startSquare + 9*colorMultiplier)) {
            pawnMoves.push(startSquare*100+2);
            pawnMoves.push(startSquare*100+3);
            pawnMoves.push(startSquare*100+4);
            pawnMoves.push(startSquare*100+5);
        }
        if (enemySquares.includes(startSquare + 11*colorMultiplier)) {
            pawnMoves.push(startSquare*100+22);
            pawnMoves.push(startSquare*100+23);
            pawnMoves.push(startSquare*100+24);
            pawnMoves.push(startSquare*100+25);
        }
        if (emptySquares.includes(startSquare + 10*colorMultiplier)) {
            pawnMoves.push(startSquare*100+12);
            pawnMoves.push(startSquare*100+13);
            pawnMoves.push(startSquare*100+14);
            pawnMoves.push(startSquare*100+15);
        }
        return pawnMoves;
    }

    if (enemySquares.includes(startSquare + 9*colorMultiplier)) {
        pawnMoves.push(startSquare*100+startSquare + 9*colorMultiplier);
    }
    if (enemySquares.includes(startSquare + 11*colorMultiplier)) {
        pawnMoves.push(startSquare*100+startSquare + 11*colorMultiplier);
    }
    if (enPassantTarget != 0) {
        enemySquares.pop();
    }

    if (emptySquares.includes(startSquare + 10*colorMultiplier)) {
        pawnMoves.push(startSquare*100+startSquare + 10*colorMultiplier);
    } else {
        return pawnMoves;
    }
    if (emptySquares.includes(startSquare + 20*colorMultiplier) && boardIndexToRank(startSquare) == board[120]*5+1) {
        pawnMoves.push(startSquare*100+startSquare + 20*colorMultiplier);
    }
    return pawnMoves;
}

function findPawnAttackMap(board, startSquare) {
    let pawnMoves = [];
    let colorMultiplier = board[120] * -2 + 1;
    if (standardBoardToBuffered.includes(startSquare + 9*colorMultiplier)) {
        pawnMoves.push(startSquare*100+startSquare + 9*colorMultiplier);
    }
    if (standardBoardToBuffered.includes(startSquare + 11*colorMultiplier)) {
        pawnMoves.push(startSquare*100+startSquare + 11*colorMultiplier);
    }
    return pawnMoves;
}
function findInterjections(friendlyKingSquare, checkOriginSquare, board, interjectionSquares, squareDifference) {
    if (friendlyKingSquare > checkOriginSquare) {
        for (let moveIndexer = checkOriginSquare + squareDifference; moveIndexer != friendlyKingSquare && board[moveIndexer] != 13; moveIndexer += squareDifference) {
            interjectionSquares.push(moveIndexer);
        }
    }
    if (friendlyKingSquare < checkOriginSquare) {
        for (let moveIndexer = checkOriginSquare - squareDifference; moveIndexer != friendlyKingSquare && board[moveIndexer] != 13; moveIndexer -= squareDifference) {
            interjectionSquares.push(moveIndexer);
        }
    }
}

function makeMove(move,board,legalMoves) {
    if (!legalMoves.includes(move)) {
        return [false];
    }
    let capturedPiece = 0;
    let previousEnPassantSquare = board[122];
    let colorMultiplier = board[120] * -2 + 1;
    let castlingAvailability = castlingCodeToArray(board[121]);
    moveParts = move.toString().match(/\d{2}/g);
    //en passant case
    if (+moveParts[1] == board[122] && board[moveParts[0]] % 6 == 0) {
        capturedPiece = board[moveParts[1] - 10 * (board[120] * -2 + 1)];
        board[moveParts[1] - 10 * (board[120] * -2 + 1)] = 0;
    }
    board[122] = 0;
    //double pawn push
    if (Math.abs(moveParts[0]-moveParts[1]) == 20 && board[moveParts[0]] % 6 == 0) {
        board[122] = moveParts[1] - 10 * (board[120] * -2 + 1);
    }
    //promotion
    if (boardIndexToRank(moveParts[0]) == [6,1][board[120]] && board[moveParts[0]]%6 == 0) {
        board[moveParts[0]] = moveParts[1]%10 + board[120]*6;
        moveParts[1] = +moveParts[0] + colorMultiplier*[9,10,11][Math.floor(moveParts[1]/10)];
    }
    //capturing
    if (board[moveParts[1]] != 0) {
        capturedPiece = board[moveParts[1]];
    }
    //castling
    if (board[moveParts[0]]%6 == 1) {
        //kingside
        if (moveParts[1]-moveParts[0] == 2) {
            [board[+moveParts[0]+1], board[+moveParts[1]+1]] = [board[+moveParts[1]+1], 0];
        }
        //queenside
        if (moveParts[1]-moveParts[0] == -2) {
            [board[+moveParts[0]-1], board[+moveParts[1]-2]] = [board[+moveParts[1]-2], 0];
        }

    }
    //remove castling rights after king move
    if (board[moveParts[0]]%6 == 1) {
        castlingAvailability[board[120]*2] = 0;
        castlingAvailability[board[120]*2+1] = 0;
    }
    //remove right on roo kcaputer
    if ([28,21,98,91].includes(+moveParts[1])) {
        castlingAvailability[[28,21,98,91].indexOf(+moveParts[1])] = 0;
    }
    //remove right on rook move
    if ([28,21,98,91].includes(+moveParts[0])) {
        castlingAvailability[[28,21,98,91].indexOf(+moveParts[0])] = 0;
    }
    [board[moveParts[1]], board[moveParts[0]]] = [board[moveParts[0]], 0];
    board[121] = castlingAvailability[0]+castlingAvailability[1]*2+castlingAvailability[2]*4+castlingAvailability[3]*8
    board[120] = (board[120]+1)%2;
    return [true,capturedPiece, previousEnPassantSquare];
}

function unmakeMove(move, board, capturedPiece, previousEnPassantSquare) {
    moveParts = move.toString().match(/\d{2}/g); 

    if (+moveParts[1] == previousEnPassantSquare && board[moveParts[1]] % 6 == 0) {
        board[moveParts[1] - 10 * (board[120] * -2 + 1)] = capturedPiece;
    }
    board[122] = previousEnPassantSquare;
    [board[moveParts[0]], board[moveParts[1]]] = [board[moveParts[1]], capturedPiece];
    board[120] = (board[120]+1)%2;
}

function squareClickEvent(square, board, promotionValue) {
    let bufferedSquare = standardBoardToBuffered[invertedBoardToStandard[square]];
    if (clickedSquare == 0) {
        clickedSquare = bufferedSquare;
        highlightSquare(clickedSquare, "#ff000040");
        return;
    }
    if (bufferedSquare == clickedSquare) {
        highlightSquare(clickedSquare, "#00000000");
        clickedSquare = 0;
        return;
    }
    if (board[clickedSquare]%6 == 0 && boardIndexToRank(bufferedSquare) == [7,0][board[120]]) {
        if (![9,10,11,-9,-10,-11].includes(bufferedSquare-clickedSquare)) {
            return;
        }
        bufferedSquare = +promotionValue+([9,10,11,-9,-10,-11].indexOf(bufferedSquare-clickedSquare)%3)*10;
    }
    if (makeMove(clickedSquare*100+bufferedSquare,board,generateMoves(board))[0]) {
        clearInterfaceChessboard();
        highlightMoveList(removePromotionNotationFromMovelist(generateMoves(board),board));
        highlightSquare(clickedSquare, "#00000000");
        clickedSquare = 0;
        displayBoard(board);
    }
}

function clearInterfaceChessboard() {
    for (let colorClearIndex = 0; colorClearIndex < 64; colorClearIndex++) {
        highlightSquare(standardBoardToBuffered[colorClearIndex], "#00000000");
    }
  }
function highlightMoveList(moveList) {
    for (let highlightingIndex in moveList) {
        highlightSquare(moveList[highlightingIndex]%100,"#0000ff40");
    }
}
function highlightSquare(bufferedSquare, colorForHighlight) {
    document.getElementById("square"+invertedBoardToStandard.indexOf(standardBoardToBuffered.indexOf(bufferedSquare))).style.backgroundColor = colorForHighlight;
}

function generatePossiblePositions(board, depth, showPerMove=false) {
    if (depth == 0) {
        return [board];
    }
    let moves = generateMoves(board);
    moves.sort((a,b)=>a-b);
    let positions = [];
    for (let moveToMake of moves) {
        let temporaryBoard = structuredClone(board);
        makeMove(moveToMake, temporaryBoard, [moveToMake]);
        newMoves = generatePossiblePositions(temporaryBoard, depth - 1);
        positions = positions.concat(newMoves);
        if (showPerMove) {
            console.log(bufferedIndexToCoordinates(Math.floor(moveToMake/100))+(bufferedIndexToCoordinates(promotionNotationToMove(moveToMake,board)%100)+": " + newMoves.length))
        }
    }
    
    return positions;
}
function perft(board, maxLayer, moreInfo= false) {
    let currentDepth = 0;
    while (currentDepth-1 < maxLayer) {
        let start = Date.now();
        console.log(currentDepth + ": " + generatePossiblePositions(board,currentDepth,moreInfo).length + "(in "+(-start+Date.now())+"ms)");
        currentDepth++;
    }
}

var clickedSquare = 0;
var mainBoard = interpretFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
mainBoard = interpretFEN('8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -');