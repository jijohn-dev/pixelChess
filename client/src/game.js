import { state } from './gameState'
import { socket } from './connection'
import { $messages, addRematchButton } from './chat'
import { handleMouseDown, handleMouseUp, handleMouseMove } from './userInput'
import { drawBoard, drawPieces, fadeBoard } from './util'
import sounds from './sounds'

const { Chess } = require('../../modules/chessJS/Chess')

const qs = require('qs')

const query = qs.parse(location.search, { ignoreQueryPrefix: true })

// join game
if (query.gameId) {    
    let username
    // show username form
    document.getElementById('username-form-box').style.display = "flex"
    document.getElementById('username-form').addEventListener('submit', e => {
        e.preventDefault()
        // hide form 
        document.getElementById('username-form-box').style.display = "none"        
        username = e.target.elements.username.value    
        
        const gameId = query.gameId
        socket.emit('join', { username, gameId }, error => {
            if (error) {
                alert(error)
                location.href = '/'
            }
        })
    })
}
else {
    // create game
    state.color = query.color
    let color = state.color
    const username = query.username;
    socket.emit('create', { username, color}, error => {
        if (error) {
            alert(error)
            location.href = '/'
        }
    })
}

// get game ID from server
socket.on('created', gameId => {
    const html = `<p>Game ID: ${gameId}</p>`
    $messages.insertAdjacentHTML('beforeend', html)  

    // invite link
    const copyLink = `<button id="copy">Copy Link</button>`
    $messages.insertAdjacentHTML('beforeend', copyLink)
    document.getElementById('copy').addEventListener('click', () => {
        navigator.clipboard.writeText(`${location.href}&gameId=${gameId}`)
    })
    
    // display empty board until opponent joins
    state.canvas = document.getElementById('gameCanvas')
    state.ctx = state.canvas.getContext('2d')
    drawBoard()
})

// wait for opponent to join
socket.on('opponentJoined', opponent => {
    // initialize game
    startGame()
})

socket.on('joined', gameInfo => {
    const html = `<p>Game ID: ${gameInfo.room}</p>`
    $messages.insertAdjacentHTML('beforeend', html)
    state.color = gameInfo.color
    console.log(state.color)

    // initialize game
    startGame()
})

const startGame = () => {   
    // play sound
    sounds.gameStart.play()

    state.canvas = document.getElementById('gameCanvas')
    state.ctx = state.canvas.getContext('2d')

    // draw
    drawBoard()

    // load spritesheet
    state.sprites = new Image()
    state.sprites.src = 'assets/img/spritesheet.png'
    state.sprites.onload = () => {
        drawPieces()
    }     

    // mouse down
    state.canvas.addEventListener('mousedown', handleMouseDown)

    // right click
    state.canvas.addEventListener('contextmenu', e => {
        e.preventDefault()
    })

    // mouse up
    state.canvas.addEventListener('mouseup', handleMouseUp)
    
    // mouse move
    state.canvas.addEventListener('mousemove', handleMouseMove)
}

// resign button
document.getElementById('resign').addEventListener('click', () => {
    if (state.status !== 'active') return
    socket.emit('resign')
})

// offer draw button
document.getElementById('offer-draw').addEventListener('click', () => {
    if (state.status !== 'active') return
    const html = `<p>You offer a draw<p>`
    $messages.insertAdjacentHTML('beforeend', html)
    socket.emit('offer-draw')
})

// listen for moves from the server
socket.on('move', move => {
    console.log(`${move} received from server`)

    // update state
    state.game.play(move)    
    
    // redraw        
    drawBoard()
    drawPieces()

    // play sound
    if (state.game.capture) {
        sounds.capture.play()
    }
    else if (state.game.check) {
        sounds.check.play()
    }
    else {
        sounds.movePiece.play()
    }    

    // detect checkmate or stalemate 
    if (state.game.checkmate || state.game.stalemate) {                
        endGame()
    }
})

// handle illegal move message from server
socket.on('illegalMove', update => {
    alert(`Illegal move: ${update.notation}`)
})

// handle resignation from server
socket.on('resign', color => {    
    const html = `<p>${color} resigns</p>`
    $messages.insertAdjacentHTML('beforeend', html)  
    endGame()  
})

// handle offer draw
socket.on('offer-draw', color => {
    let html = `<p id="draw-offer">${color} offers a draw. Accept?</p>`
    html += '<button id="yes">Yes</button><button id="no">No</button>'
    $messages.insertAdjacentHTML('beforeend', html)

    // add event handlers to draw buttons
    document.getElementById('yes').addEventListener('click', () => {
        socket.emit('accept-draw')
    })

    document.getElementById('no').addEventListener('click', () => {
        document.getElementById('draw-offer').remove()
        document.getElementById('yes').remove()
        document.getElementById('no').remove()
    })
})

// handle accept draw
socket.on('accept-draw', () => {    
    const html = '<p>Draw</p>'
    $messages.insertAdjacentHTML('beforeend', html)
    endGame()
})

// handle offer rematch
socket.on('offer-rematch', () => {
    // remove rematch button
    document.getElementById('rematch').remove()

    // accept rematch button
    const html = `<p id="accept-text">Accept rematch?<p><button id="accept">Accept</button>`
    $messages.insertAdjacentHTML('beforeend', html)
    document.getElementById('accept').addEventListener('click', () => {
        socket.emit('accept-rematch')
        // remove accept button
        document.getElementById('accept-text').remove()
        document.getElementById('accept').remove()
    })
})

// handle accept rematch
socket.on('accept-rematch', () => {
    // reset local game
    state.game = new Chess()
    state.status = 'active'
    // swap color
    if (state.color === 'white') {
        state.color = 'black'
    }
    else {
        state.color = 'white'
    }

    startGame()
})

const endGame = () => {
    sounds.gameEnd.play()

    state.status = 'inactive'

    fadeBoard()
    addRematchButton()
}