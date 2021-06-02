const { validSquare, isOccupied, isBlocked } = require('./utils')

// checks if any enemy pieces are attacking the square x,y
const kingInCheck = (pieces, x, y) => {
	let color
	pieces.forEach(p => {
        // ignore temporarily deleted captured piece when searching for legal moves
		if (!p.delete && p.boardX === x && p.boardY === y) {
			color = p.color
		}
	}) 
    let check = false
    pieces.forEach(p => {        
        if (p.color !== color && !p.delete && isAttacking(pieces, p, x, y)) {
            check = true
        }
    })

    // console.log(`is ${color} king at ${x} ${y} in check?`)   
    // console.log(check ? 'yes' : 'no')    

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
                // TODO?: escape check via capture
                // console.log(`can king move to ${x+i} ${y+j}?`)
                if (!isBlocked(pieces, color, x + i, y + j)) {
                    if (safeSquare(pieces, color, x + i, y + j)) {
                        // console.log(`escape to ${x+i} ${y+j}`)
                        return true
                    }
                }           
                else {
                    // console.log('occupied')
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
		if (p.color !== color && isAttacking(pieces, p, x, y)) {
            // console.log("not safe")
			safe = false
		}
	})
	return safe
}

const pathClear = (pieces, x, y, targetX, targetY) => {
    // console.log(`from ${x} ${y} to ${targetX} ${targetY}`)   
    
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

    // console.log(`steps: ${steps} dx: ${diffX} dy: ${diffY}`)
    
    for (let i = 1; i < steps; i++) {        
        x += stepX
        y += stepY   
        if (test) {
            // console.log(`checking ${x} ${y}`)
        }
        if (isOccupied(pieces, x, y)) {            
            return false
        }        
    }
    // console.log("path is clear")
    return true
}

module.exports = {
    pathClear,
    isAttacking,
    kingInCheck,
    kingCanMove,
    safeSquare
}