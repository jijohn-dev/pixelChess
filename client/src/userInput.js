import { state } from './gameState'
import { socket } from './connection'
import { drawBoard, drawPieces, idxToSquare } from './util'

const handleMouseDown = e => {   
    // get state vars
    let pieces = state.game.pieces

    // get mouse coords
    let mouseX = e.offsetX
    let mouseY = e.offsetY       

    // get square
    let squareX = Math.floor(mouseX / 100)
    let squareY = Math.floor(mouseY / 100)        

    // reflect square for black
    if (state.color === "black") {
        squareX = 7 - squareX
        squareY = 7 - squareY
    }

    // check if square has a piece and is user's color       
    pieces.forEach((p, index) => {
        if (p.boardX === squareX && p.boardY === squareY && p.color === state.color) {                
            state.selected = true
            state.pieceIdx = index
            // center piece on cursor
            if (state.color === "black") {
                squareX = -squareX + 7
                squareY = -squareY + 7
            }
            p.offsetX = e.offsetX - (squareX * 100 + 50)
            p.offsetY = e.offsetY - (squareY * 100 + 50)
            drawBoard()
            drawPieces()
        }
    })        
}

const handleMouseUp = e => {
    // get mouse coords
    let mouseX = e.offsetX
    let mouseY = e.offsetY        

    // drop piece
    if (state.selected) {           
        let piece = state.game.pieces[state.pieceIdx]
        let startX = piece.boardX
        let startY = piece.boardY

        // cancel if right click
        if (e.button === 2) {
            piece.offsetX = 0
            piece.offsetY = 0
            drawBoard()
            drawPieces()
            state.selected = false   
            return
        }

        // get square
        let squareX = Math.floor(mouseX / 100)
        let squareY = Math.floor(mouseY / 100)

        // reflect for black
        if (state.color === "black") {
            squareX = 7 - squareX
            squareY = 7 - squareY
        }
        
        let moveMade = false        
        let legal = false

        let notation = ""

        // check color
        if (piece.color !== state.game.toMove) {
            squareX = piece.boardX
            squareY = piece.boardY
        }
        else {                
            moveMade = true                                
            notation += idxToSquare(startX, startY)   
            notation += idxToSquare(squareX, squareY)         

            // check if move is legal
            legal = state.game.legal(notation)
            if (!legal) {
                console.log("illegal move")
                console.log(state.game.pieces)
                moveMade = false
            }                 
        }
        
        // reset piece if move is invalid
        if (!legal) {            
            squareX = piece.boardX
            squareY = piece.boardY
        }           

        // update piece        
        piece.hasMoved = moveMade
        piece.offsetX = 0
        piece.offsetY = 0

        state.selected = false        

        // update and redraw                          
        if (moveMade) {
            state.game.play(notation)                                    
            console.log(notation)
            // send move to server            
            socket.emit("move", notation)
        }   
        
        drawBoard()
        drawPieces()
    }
}

const handleMouseMove = e => {
    // get mouse coords
    let mouseX = e.offsetX
    let mouseY = e.offsetY       

    // calculate mouse movement
    let dx = mouseX - state.lastX
    let dy = mouseY - state.lastY

    state.lastX = mouseX
    state.lastY = mouseY

    // move piece
    if (state.selected) {
        state.game.pieces[state.pieceIdx].offsetX += dx
        state.game.pieces[state.pieceIdx].offsetY += dy

        // redraw
        drawBoard()
        drawPieces()
    }
}

export { handleMouseDown, handleMouseUp, handleMouseMove }