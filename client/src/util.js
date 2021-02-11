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

const drawPromotionMenu = (color, x) => {
    // reflect x position for black
    if (color === "black") {
        x = 7 - x
    }

    const spriteLocations = ["pawn", "bishop", "knight", "rook", "king", "queen"]
    
    state.ctx.fillstyle = "white"
    state.ctx.fillRect(100 * x, 0, 100, 400)
    const spriteY = color === "white" ? 0 : 1
    drawPiece(spriteLocations.indexOf("queen"),  spriteY, x, 0)
    drawPiece(spriteLocations.indexOf("rook"),   spriteY, x, 1)
    drawPiece(spriteLocations.indexOf("knight"), spriteY, x, 2)
    drawPiece(spriteLocations.indexOf("bishop"), spriteY, x, 3)
}

const idxToSquare = (x, y) => {
    let file = String.fromCharCode(x + 97)
    let rank = 8 - y
    return file + rank
}

export {
    drawBoard,
    drawPieces,
    drawPromotionMenu,
    idxToSquare
}