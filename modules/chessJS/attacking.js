const { validSquare, isOccupied, isBlocked } = require('./utils')

// checks if any enemy pieces are attacking the square x,y
const kingInCheck = (pieces, x, y) => {
	// console.log(`is king at ${x} ${y} in check?`)   
	let color
	pieces.forEach(p => {
		if (p.boardX === x && p.boardY === y) {
			color = p.color
		}
	}) 
    let check = false
    pieces.forEach(p => {        
        if (p.color !== color && !p.delete && isAttacking(pieces, p, x, y)) {
            check = true
        }
    })
    return check
}

// is piece p attacking x,y?
const isAttacking = (pieces, p, x, y) => {   
    let diffX = Math.abs(x - p.boardX)
    let diffY = Math.abs(y - p.boardY)       

    if (p.name === "knight") {
        if ((diffX === 1 && diffY === 2) || (diffX === 2 && diffY === 1)) {
            return true
        }
    }
    else if (p.name === "pawn") {
        let step = p.color === "white" ? -1 : 1        
        if (y - p.boardY === step && diffX === 1) {
            return true
        }        
    }
    
    if (p.name === "bishop" || p.name === "queen") {        
        if (diffX === diffY && pathClear(pieces, p.boardX, p.boardY, x, y)) {
            return true
        }
    }
    if (p.name === "rook" || p.name === "queen") {
        if ((diffX === 0 || diffY === 0) && pathClear(pieces, p.boardX, p.boardY, x , y)) {
            return true
        }
    }
}

const stalemate = (pieces, king) => {
    if (!kingInCheck, king.boardX, king.boardY) {
        // TODO: is there a legal move for this color?
    }
    return false
}

// is king checkmated?
const checkmate = (pieces, king) => {    
    console.log('checkmate?')
    if (kingInCheck(pieces, king.boardX, king.boardY)) {
        // double check?
        let count = 0
        pieces.forEach(p => {
            if (p.color !== king.color) {
                if (isAttacking(pieces, p, king.boardX, king.boardY)) {
                    console.log(`${p.name} is attacking`)
                    count++
                }
            }            
        })

        let canMove = kingCanMove(pieces, king.boardX, king.boardY)
        if (canMove) {
            console.log("king can move out of check")
            return false
        }
        else if (count > 1) {
            // king must move if double check
            console.log("double check and king cannot move")
            return true
        }
        else {
            // block check or capture attacking piece            
            // check if any piece is attacking a square on the path
            // to the attacking piece (including the square attacking piece is on)
            let canBlock = false
            
            // get attacker
            const attacker = pieces.find(p => p.color !== king.color && isAttacking(pieces, p, king.boardX, king.boardY))
            let canCapture = false 

            // can attacker be captured?
            pieces.forEach(p => {
                if (p.color === king.color) {
                    // console.log(`can ${p.name} at ${p.boardX} ${p.boardY} capture ${attacker.name} at ${attacker.boardX} ${attacker.boardY}?`)
                    if (isAttacking(pieces, p, attacker.boardX, attacker.boardY)) {
                        // need to check if piece can be moved
                        let lastX = p.boardX
                        let lastY = p.boardY
                        p.boardX = attacker.boardX
                        p.boardY = attacker.boardY
    
                        // remove attacker
                        let oldColor = attacker.color
                        attacker.color = king.color
    
                        if (!kingInCheck(pieces, king.boardX, king.boardY)) {
                            canCapture = true
                        }
    
                        // reset pieces
                        p.boardX = lastX
                        p.boardY = lastY
                        attacker.color = oldColor
                    }
                }                
            })

            // knight cannot be blocked, only captured
            if (attacker.name !== "knight") {
                console.log(attacker)
                // can a piece move to a square on the path from attacker to king?
                let diffX = Math.abs(king.boardX - attacker.boardX)
                let diffY = Math.abs(king.boardY - attacker.boardY)

                let x = attacker.boardX
                let y = attacker.boardY

                let steps
                let stepX = 0
                let stepY = 0

                if (diffX != 0) {
                    stepX = (king.boardX - x) / diffX
                    steps = diffX
                }
            
                if (diffY != 0) {
                    stepY = (king.boardY - y) / diffY
                    steps = diffY
                }

                for (let i = 1; i < steps; i++) {
                    x += stepX
                    y += stepY
                    pieces.forEach(p => {
                        console.log(`can ${p.name} block on ${x} ${y}?`)
                        if (p.color === king.color && isAttacking(pieces, p, x, y)) {
                            // need to check if piece can be moved
                            let lastX = p.boardX
                            let lastY = p.boardY
                            p.boardX = x
                            p.boardY = y

                            if (!kingInCheck(pieces, king.boardX, king.boardY)) {
                                canBlock = true
                            }

                            // reset piece
                            p.boardX = lastX
                            p.boardY = lastY
                        }
                    })
                }
            }
           
            if (!canMove && !canBlock && !canCapture) {
                return true
            }
        }
    }
    return false
}

// does the king located at x, y have a legal move?
const kingCanMove = (pieces, x, y) => {
	// need color of king for safeSquare()
	let color
	pieces.forEach(p => {
		if (p.boardX === x && p.boardY === y) {
			color = p.color
		}
	})
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (validSquare(x + i, y + j)) {
				// check if square is occupied by same color
                // TODO: escape check via capture
                console.log(`can king move to ${x+i} ${y+j}?`)
                if (!isBlocked(pieces, color, x + i, y + j)) {
                    if (safeSquare(pieces, color, x + i, y + j)) {
                        console.log(`escape to ${x+i} ${y+j}`)
                        return true
                    }
                }           
                else {
                    console.log('occupied')
                }     
            }
        }
    }
    return false
}

// is the square at x, y under attack from opposite color?
const safeSquare = (pieces, color, x, y) => {
    let safe = true
	pieces.forEach(p => {        
        if ((p.name === "bishop" || p.name === "queen") && p.color !== color) {
            console.log(`is ${p.color} ${p.name} at ${p.boardX} ${p.boardY} attacking ${color} king at ${x} ${y}?`)
        }
		if (p.color !== color && isAttacking(pieces, p, x, y)) {
            console.log("not safe")
			safe = false
		}
	})
	return safe
}

const pathClear = (pieces, x, y, targetX, targetY) => {
    console.log(`from ${x} ${y} to ${targetX} ${targetY}`)   
    
    let test = true

    let stepX = 0
    let stepY = 0
    let steps = 0

    let diffX = Math.abs(targetX - x)
    let diffY = Math.abs(targetY - y)

    if (diffX != 0) {
        stepX = (targetX - x) / diffX
        steps = diffX
    }

    if (diffY != 0) {
        stepY = (targetY - y) / diffY
        steps = diffY
    }

    console.log(`steps: ${steps} dx: ${diffX} dy: ${diffY}`)
    
    for (let i = 1; i < steps; i++) {        
        x += stepX
        y += stepY   
        if (test) {
            console.log(`checking ${x} ${y}`)
        }
        if (isOccupied(pieces, x, y)) {            
            return false
        }        
    }
    console.log("path is clear")
    return true
}

module.exports = {
    pathClear,
    kingInCheck,
	checkmate
}