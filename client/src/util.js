import { state } from './gameState'

// draw the board
function drawBoard() {  
    state.ctx.fillStyle = '#7C5CBF';
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);

    // draw light squares
    state.ctx.fillStyle = 'beige';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if ((i+j) % 2 == 0) {
                state.ctx.fillRect(100 * i, 100 * j, 100, 100);
            }
        }
    }
}

// sx, sy, dx, dy
function drawPiece(x, y, i, j, dx, dy) {
    let size = state.size
    state.ctx.drawImage(state.sprites, x * size, y * size, size, size, i * size + dx, j * size + dy, size, size);
}

function drawPieces() {    
    if (state.color === "white") {
        state.pieces.forEach((p) => {
            drawPiece(p.spriteX, p.spriteY, p.boardX, p.boardY, p.offsetX, p.offsetY);
        });
    }
    else {
        state.pieces.forEach((p) => {
            drawPiece(p.spriteX, p.spriteY, 7 - p.boardX, 7 - p.boardY, p.offsetX, p.offsetY);
        });
    }
}

function createPiece(color, name, spriteX, spriteY, boardX, boardY) {
    state.pieces.push({
        color,
        name,
        spriteX,
        spriteY,
        boardX,
        boardY,
        offsetX: 0,
        offsetY: 0,
        hasMoved: false,
        delete: false 
    })
}

function changeToMove() {    
    if (state.toMove === "white") {
        state.toMove = "black";
    }
    else {
        state.toMove = "white";
    }    
}

function idxToSquare(x, y) {
    let file = String.fromCharCode(x + 97);
    let rank = 8 - y;
    return file + rank;
}

function saveState() {
    let newState = [];
    state.pieces.forEach(p => {
        let copy = JSON.parse(JSON.stringify(p));
        newState.push(copy);
    })
    state.history.push(newState);
}

function loadState() {
    state.pieces = [];
    state.history[state.history.length - 1].forEach(p => {
        pieces.push(JSON.parse(JSON.stringify(p)));
    })
}

function resetGame() {
    state.pieces = [];
    initializePieces();
    state.history = [];     
    saveState();
    drawBoard();
    drawPieces();
    state.toMove = "white";
    console.log("reset");
}

function undoMove() {
    console.log("undo");
    if (state.history.length > 1) {
        state.history.pop();
        loadState();
        drawBoard();
        drawPieces();
        changeToMove();
    }
}

function initializePieces() {
    // pawns
    for (let i = 0; i < 8; i++) {
        createPiece("white", "pawn", 0, 0, i, 6);
        createPiece("black", "pawn", 0, 1, i, 1);
    }

    // bishops
    createPiece("white", "bishop", 1, 0, 2, 7);
    createPiece("white", "bishop", 1, 0, 5, 7);
    createPiece("black", "bishop", 1, 1, 2, 0);
    createPiece("black", "bishop", 1, 1, 5, 0);

    // knights
    createPiece("white", "knight", 2, 0, 1, 7);
    createPiece("white", "knight", 2, 0, 6, 7);
    createPiece("black", "knight", 2, 1, 1, 0);
    createPiece("black", "knight", 2, 1, 6, 0);

    // rooks
    createPiece("white", "rook", 3, 0, 0, 7);
    createPiece("white", "rook", 3, 0, 7, 7);
    createPiece("black", "rook", 3, 1, 0, 0);
    createPiece("black", "rook", 3, 1, 7, 0);

    // kings
    createPiece("white", "king", 0, 2, 4, 7);
    createPiece("black", "king", 1, 2, 4, 0);

    // queens
    createPiece("white", "queen", 2, 2, 3, 7);
    createPiece("black", "queen", 3, 2, 3, 0);
}

export {
    initializePieces,
    saveState,
    drawBoard,
    drawPieces,
    idxToSquare,
    changeToMove
}