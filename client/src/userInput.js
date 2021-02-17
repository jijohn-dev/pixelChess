import { state } from './gameState'
import { socket } from './connection'
import { drawBoard, drawPieces, drawPromotionMenu, idxToSquare } from './util'

const handleMouseDown = e => {  
    if (state.status === 'inactive') return

    // disable click and drag if promoting 
    if (state.promotionMenuOpen) {
        return
    }

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
        console.log("reflecting square")
        squareX = 7 - squareX
        squareY = 7 - squareY
    }

    console.log(`clicked on square at: ${squareX} ${squareY}`)

    // check if square has a piece and is user's color       
    pieces.forEach((p, index) => {
        if (p.boardX === squareX && p.boardY === squareY && p.color === state.color) {  
            console.log(`found piece at: ${squareX} ${squareY}`)              
            state.selected = true
            state.pieceIdx = index

            // center piece on cursor
            let centerX = squareX
            let centerY = squareY
            if (state.color === "black") {
                centerX = -squareX + 7
                centerY = -squareY + 7
            }
            p.offsetX = e.offsetX - (centerX * 100 + 50)
            p.offsetY = e.offsetY - (centerY * 100 + 50)
            drawBoard()
            drawPieces()
        }
    })        
    const selectedPiece = pieces[state.pieceIdx]
    console.log("selected piece:", selectedPiece)
}

const handleMouseUp = e => {
    if (state.status === 'inactive') return

    // get mouse coords
    let mouseX = e.offsetX
    let mouseY = e.offsetY    
    
    // get square
    let squareX = Math.floor(mouseX / 100)
    let squareY = Math.floor(mouseY / 100)

    // promotion selection
    if (state.promotionMenuOpen) {     
        // reflect menu location for black
        if (state.color === "black") {
            state.menuX = 7 - state.menuX
        }
        if (squareX === state.menuX && mouseY < 400) {
            const menuLocations = ['q', 'r', 'n', 'b']
            state.promotionMove += '='
            const move = state.promotionMove + menuLocations[squareY]
            state.promotionMenuOpen = false

            state.game.play(move)                                    
            console.log(move)
            // send move to server            
            socket.emit("move", move)
            drawBoard()
            drawPieces()
            return
        }
        else {
            return
        }
    }

    // reflect for black
    if (state.color === "black") {
        squareX = 7 - squareX
        squareY = 7 - squareY
    }

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
        
        let moveMade = false        
        let legal = false

        let move = ""

        // check color
        if (piece.color === state.game.toMove) {               
            moveMade = true                                
            move += idxToSquare(startX, startY)   
            move += idxToSquare(squareX, squareY)     

            // check if move is legal
            legal = state.game.legal(move)
            if (!legal) {
                console.log("illegal move", move)     
                console.log(state.game.pieces)           
                moveMade = false
            }   
            else {
                // promotion menu
                if (piece.name === "pawn" && (squareY === 0 || squareY === 7)) {
                    state.promotionMenuOpen = true
                    state.menuX = squareX
                    state.promotionMove = move
                    // draw menu
                    drawPromotionMenu(piece.color, squareX)

                    // reset piece offset
                    piece.offsetX = 0
                    piece.offsetY = 0

                    // deselect piece
                    state.selected = false

                    return
                }
            }              
        }      

        // update piece        
        piece.hasMoved = moveMade
        piece.offsetX = 0
        piece.offsetY = 0

        state.selected = false        

        // update and redraw                          
        if (moveMade) {            
            state.game.play(move)                                    
            console.log(move)
            
            // send move to server            
            socket.emit("move", move)
            
            // remove draw offer if present
            const drawOffer = document.getElementById('draw-offer')
            if (drawOffer) {
                drawOffer.remove()
                document.getElementById('yes').remove()
                document.getElementById('no').remove()
            }
        }   
        
        drawBoard()
        drawPieces()
    }
}

const handleMouseMove = e => {
    if (state.status === 'inactive') return

    // do nothing if promotion menu is open
    if (state.promotionMenuOpen) {
        return
    }

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