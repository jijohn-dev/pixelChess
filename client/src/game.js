import { state } from './gameState'
import { socket } from './connection'
import { $messages } from './chat'
import { handleMouseDown, handleMouseUp, handleMouseMove } from './userInput'
import { initializePieces, saveState, drawBoard, drawPieces, changeToMove } from './util'

const { checkmate, makeMove } = require('../modules/chess/chess')

const qs = require('qs')

const query = qs.parse(location.search, { ignoreQueryPrefix: true })

// join game
if (query.gameId) {    
    const { username, gameId } = query
    socket.emit('join', { username, gameId }, (error) => {
        if (error) {
            alert(error)
            location.href = '/'
        }
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
    initializePieces()
    saveState()

    state.canvas = document.getElementById('gameCanvas')
    state.ctx = state.canvas.getContext('2d')

    // draw
    drawBoard()

    // load spritesheet
    state.sprites = new Image()
    state.sprites.src = 'assets/spritesheet.png'
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

// listen for moves from the server
socket.on('move', move => {
    console.log(`${move} received from server`)

    // update state
    state.pieces = makeMove(state.pieces, move)
    changeToMove()
    
    // save and redraw
    saveState()    
    drawBoard()
    drawPieces()

    // detect checkmate
    const king = state.pieces.find(p => p.name === "king" && p.color === state.color)
    if (checkmate(state.pieces, king)) {
        alert("checkmate")        
    }
})

// handle illegal move message from server
socket.on('illegalMove', update => {
    alert(`Illegal move: ${update.notation}`)
})