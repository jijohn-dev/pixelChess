// is the square at indices x,y on the board?
const validSquare = (x, y) => {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7
}

// convert chess notation (file rank file rank) to x,y,x,y
const parseMove = move => {
	let pieceX = move.charCodeAt(0) - 97
	let pieceY = 7 - (parseInt(move[1]) - 1)

	let targetX = move.charCodeAt(2) - 97
	let targetY = 7 - (parseInt(move[3]) - 1)

    const parsed = { pieceX, pieceY, targetX, targetY }
    // console.log(`move: ${move} parsed: ${pieceX} ${pieceY} ${targetX} ${targetY}`)
	return parsed
}

// return true if a piece is located at x,y
const isOccupied = (pieces, x, y) => {
    let occupied = false
    pieces.forEach(p => {        
        if (p.boardX === x && p.boardY === y) {            
            occupied = true
        }
    })    
    return occupied
}

// return true is piece of same color is located at x,y
const isBlocked = (pieces, color, x, y) => {
    let blocked = false
    pieces.forEach(p => {        
        if (p.color === color && p.boardX === x && p.boardY === y) {            
            blocked = true
        }
    })    
    return blocked
}

const createPiece = (pieces, color, name, spriteX, spriteY, boardX, boardY) => {
    pieces.push({
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

// create pieces in their starting configuration
const initializePieces = pieces => {
    // pawns
    for (let i = 0; i < 8; i++) {
        createPiece(pieces, "white", "pawn", 0, 0, i, 6)
        createPiece(pieces, "black", "pawn", 0, 1, i, 1)
    }

    // bishops
    createPiece(pieces, "white", "bishop", 1, 0, 2, 7)
    createPiece(pieces, "white", "bishop", 1, 0, 5, 7)
    createPiece(pieces, "black", "bishop", 1, 1, 2, 0)
    createPiece(pieces, "black", "bishop", 1, 1, 5, 0)

    // knights
    createPiece(pieces, "white", "knight", 2, 0, 1, 7)
    createPiece(pieces, "white", "knight", 2, 0, 6, 7)
    createPiece(pieces, "black", "knight", 2, 1, 1, 0)
    createPiece(pieces, "black", "knight", 2, 1, 6, 0)

    // rooks
    createPiece(pieces, "white", "rook", 3, 0, 0, 7)
    createPiece(pieces, "white", "rook", 3, 0, 7, 7)
    createPiece(pieces, "black", "rook", 3, 1, 0, 0)
    createPiece(pieces, "black", "rook", 3, 1, 7, 0)

    // kings
    createPiece(pieces, "white", "king", 0, 2, 4, 7)
    createPiece(pieces, "black", "king", 1, 2, 4, 0)

    // queens
    createPiece(pieces, "white", "queen", 2, 2, 3, 7)
    createPiece(pieces, "black", "queen", 3, 2, 3, 0)
}

module.exports = {
    validSquare,
    isOccupied,
    isBlocked,
	parseMove,
	initializePieces
}