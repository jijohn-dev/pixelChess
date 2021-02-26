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

const coordsToNotation = (x, y) => {
    const file = String.fromCharCode(x + 97)
    const rank = 8 - y
    return file + rank
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

const createPiece = (pieces, color, name, boardX, boardY) => {
    pieces.push({
        color,
        name,        
        boardX,
        boardY,        
        hasMoved: false,
        delete: false 
    })
}

// create pieces in their starting configuration
const initializePieces = pieces => {
    // pawns
    for (let i = 0; i < 8; i++) {
        createPiece(pieces, "white", "pawn", i, 6)
        createPiece(pieces, "black", "pawn", i, 1)
    }

    // bishops
    createPiece(pieces, "white", "bishop", 2, 7)
    createPiece(pieces, "white", "bishop", 5, 7)
    createPiece(pieces, "black", "bishop", 2, 0)
    createPiece(pieces, "black", "bishop", 5, 0)

    // knights
    createPiece(pieces, "white", "knight", 1, 7)
    createPiece(pieces, "white", "knight", 6, 7)
    createPiece(pieces, "black", "knight", 1, 0)
    createPiece(pieces, "black", "knight", 6, 0)

    // rooks
    createPiece(pieces, "white", "rook", 0, 7)
    createPiece(pieces, "white", "rook", 7, 7)
    createPiece(pieces, "black", "rook", 0, 0)
    createPiece(pieces, "black", "rook", 7, 0)

    // kings
    createPiece(pieces, "white", "king", 4, 7)
    createPiece(pieces, "black", "king", 4, 0)

    // queens
    createPiece(pieces, "white", "queen", 3, 7)
    createPiece(pieces, "black", "queen", 3, 0)
}

const loadBoard = board => {
    const pieces = []
    board.forEach((square, index) => {        
        if (square !== '_') {
            const color = square === square.toUpperCase() ? "black" : "white"
            createPiece(pieces, color, charToName(square), index % 8, Math.floor(index / 8))
        }
    })

    return pieces
}

const charToName = char => {
    const c = char.toLowerCase()
    const chars = ['p', 'b', 'n', 'r', 'q', 'k']
    const names = ["pawn", "bishop", "knight", "rook", "queen", "king"]
    const idx = chars.indexOf(c)
    return names[idx] 
}

module.exports = {
    validSquare,
    coordsToNotation,
    isOccupied,
    isBlocked,
	parseMove,
    initializePieces,
    loadBoard,
    charToName
}