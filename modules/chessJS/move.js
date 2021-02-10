const { parseMove, initializePieces, charToName } = require('./utils')
const { pathClear, kingInCheck, checkmate } = require('./attacking')

const makeMove = (pieces, move) => {
    // parse move notation
    const { pieceX, pieceY, targetX, targetY } = parseMove(move)    

    // castling
    if (move === "e1g1" || move === "e8g8") {
        const rook = pieces.find(p => p.boardX === 7 && p.name === "rook")
        rook.boardX = 5        
    }
    if (move === "e1c1" || move === "e8c8") {
        const rook = pieces.find(p => p.boardX === 0 && p.name === "rook")
        rook.boardX = 3
    }

    // get piece
    const piece = pieces.find(p => p.boardX === pieceX && p.boardY === pieceY)

    // promotion (f7f8=q)
    const backRank = piece.color === "white" ? 0 : 7
    if (targetY === backRank) {
        piece.name = charToName(move[5])
    }

    // delete captured piece if capture is made
    const captured = pieces.find(p => p.boardX === targetX && p.boardY === targetY)
    if (captured) {
        // console.log("capture")
        captured.delete = true        
    }
    pieces = pieces.filter(p => p.delete === false)    

    // update piece position
    piece.boardX = targetX
    piece.boardY = targetY
    piece.hasMoved = true

    return pieces
}

const legalMove = (pieces, move, lastMove) => {
    // parse move notation
    const { pieceX, pieceY, targetX, targetY } = parseMove(move)

    // get piece
    const piece = pieces.find(p => p.boardX === pieceX && p.boardY === pieceY)

    if (!piece) {
        console.log(`no piece on ${pieceX} ${pieceY}`)
        return false
    }

    // check if target is occupied
    let occupied = false
    pieces.forEach(p => {
        if (p.color === piece.color && p.boardX === targetX && p.boardY === targetY) {            
            occupied = true
        }
    })

    if (occupied) {
        // console.log("occupied")
        return false
    }

    let valid = canMove(pieces, piece, targetX, targetY, move, lastMove)
    if (!valid) {
        return false
    }
    // save piece position
    let lastX = piece.boardX
    let lastY = piece.boardY

    // check if capture occurs
    const capturedPiece = pieces.find(p => p.boardX === targetX && p.boardY === targetY)
    // TODO: en passant capture

    // move piece
    piece.boardX = targetX
    piece.boardY = targetY

    // get position of king    
    let kingX
    let kingY
    pieces.forEach(p => {
        if (p.color === piece.color && p.name === "king") {
            kingX = p.boardX
            kingY = p.boardY
        }
    })

    // TODO: hide captured piece if capture occurs
    if (capturedPiece) {
        capturedPiece.delete = true
    }
    let check = kingInCheck(pieces, kingX, kingY)

    // reset pieces
    piece.boardX = lastX
    piece.boardY = lastY
    if (capturedPiece) {
        capturedPiece.delete = false
    }
    
    if (check) {
        // console.log("cannot move into check")        
        return false
    }
    
    return true
}

function canMove(pieces, piece, targetX, targetY, move, lastMove) {
    let diffX = Math.abs(targetX - piece.boardX)
    let diffY = Math.abs(targetY - piece.boardY)

    // check if path is clear
    if (piece.name !== "knight") {
        if (!pathClear(pieces, piece.boardX, piece.boardY, targetX, targetY)) {
            return false
        }
    }
    
    if (piece.name === "pawn") {
        const step = piece.color === "white" ? -1 : 1 
        // normal move      
        if (targetY === piece.boardY + step && targetX === piece.boardX) {            
            return true
        }
        // 2 squares on first move
        if (targetY === piece.boardY + 2*step && targetX === piece.boardX && !piece.hasMoved) {
            return true
        }
        // capture
        if (targetY === piece.boardY + step && diffX === 1) {
            let capture = false
            pieces.forEach(p => {
                if (p.color !== piece.color && p.boardX === targetX && p.boardY === targetY) {
                    capture = true
                }
            })
            // en passant
            // attacker must be on 5th rank (3) for white, 4th (4) for black
            const attackerY = piece.color === "white" ? 3 : 4            
            if (piece.boardY === attackerY) {
                // is there an enemy pawn 1 square behind target?
                const targetPawn = pieces.find(
                    p => p.color !== piece.color &&
                    p.name === "pawn" &&
                    p.boardX === targetX &&
                    p.boardY === targetY - step
                )        
                
                if (targetPawn) {
                    // was target pawn moved 2 squares on previous move?
                    const { startX, startY, endX, endY } = parseMove(lastMove)
                    if (startX === targetX && 
                        startY === targetPawn.boardY + 2*step && 
                        endX === targetPawn.boardX &&
                        endY === targetPawn.boardY    
                    ) {
                        // move enemy pawn back 1 square to simulate normal capture
                        if (enPassant && target) {
                            target.boardY += step
                            capture = true
                        }
                    }                    
                }                            
            }
            return capture
        }               
    }    

    // king
    if (piece.name === "king") {
        // normal move
        if (diffX <= 1 && diffY <= 1) {
            return true
        }
        // castling
        if (!piece.hasMoved) {              
            let rookY = piece.color === "white" ? 7 : 0

            if (piece.color === piece.color && targetY === rookY) {
                // cannot castle out of check                
                if (kingInCheck(pieces, piece.boardX, piece.boardY)) {
                    return false
                }

                // TODO: cannot castle through check
                // end square is handled in legalMove()

                // short
                if (targetX === 6) {
                    if (kingInCheck(pieces, 5, rookY)) {
                        return false
                    }
                    // move rook
                    pieces.forEach(x => {
                        if (x.name === "rook" && x.color === piece.color && x.boardX === 7) {
                            if (x.hasMoved) {
                                return false
                            }                            
                        }
                    })
                    return true
                }
                // long
                if (targetX === 2) {
                    if (kingInCheck(pieces, 3, rookY)) {
                        return false
                    }
                    // move rook
                    pieces.forEach(x => {
                        if (x.name === "rook" && x.color === piece.color && x.boardX === 0) {
                            if (x.hasMoved) {                                
                                return false
                            }                                                        
                        }
                    })
                    return true
                }
            }
        }
    }

    if (piece.name === "queen") {       
        return diffX === 0 || diffY === 0 || diffX === diffY
    }

    if (piece.name === "rook") {
        return diffX === 0 || diffY === 0
    }

    if (piece.name === "bishop") {       
        return diffX === diffY
    }

    if (piece.name === "knight") {
        return (diffX === 1 && diffY === 2) || (diffX === 2 && diffY === 1)
    }

    return false
}

module.exports = {
    makeMove,
	legalMove,
    checkmate,    
    initializePieces,
    parseMove
}