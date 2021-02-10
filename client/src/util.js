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
    // default to 0 if offset not set
    if (!dx) {
        dx = 0
    }
    if (!dy) {
        dy = 0
    }

    state.ctx.drawImage(state.sprites, x * size, y * size, size, size, i * size + dx, j * size + dy, size, size)
}

const drawPieces = () => {    
    const spriteLocations = ["pawn", "bishop", "knight", "rook", "king", "queen"]
  
    state.game.pieces.forEach((p) => { 
        const spriteX = spriteLocations.indexOf(p.name)
        const spriteY = p.color === "white" ? 0 : 1     
        const boardX = state.color === "white" ? p.boardX : 7 - p.boardX
        const boardY = state.color === "white" ? p.boardY : 7 - p.boardY
        drawPiece(spriteX, spriteY, boardX, boardY, p.offsetX, p.offsetY)
    })    
}

function idxToSquare(x, y) {
    let file = String.fromCharCode(x + 97);
    let rank = 8 - y;
    return file + rank;
}

export {
    drawBoard,
    drawPieces,
    idxToSquare
}