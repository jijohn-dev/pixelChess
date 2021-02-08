const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const { v4: uuidv4 } = require('uuid')

const { legalMove, checkmate, initializePieces, parseMove, makeMove } = require('../modules/chess/chess')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

// store users
const users = []

// store game states
const games = []

io.on('connection', (socket) => {
	console.log('New Websocket connection')
	
	// create new game
	socket.on('create', options => {
		const { error, user } = createGame({ id: socket.id, ...options })

		if (error) {
			return callback(error)
		}

		socket.emit('created', user.room)
		socket.emit('message', `Playing as the ${options.color} pieces`)
		socket.emit('message', `Wating for opponent...`)
		
		socket.join(user.room)
	})

	// join existing game
	socket.on('join', (options, callback) => {
		const { error, user } = joinGame({ id: socket.id, ...options })
		
		if (error) {
			return callback(error)
		}

		// send user joined message to game creator
		socket.broadcast.to(user.room).emit('message', `${user.username} has joined`)
		socket.broadcast.to(user.room).emit('opponentJoined', user)

		// send game ID to client
		socket.emit('joined', { ...user })
		socket.emit('message', `Joined ${user.opponent}`)
		socket.emit('message', `Playing as the ${user.color} pieces`)

		socket.join(user.room)
	})

	// move
	socket.on('move', move => {
		console.log(`move received: ${move}`)

		const user = getUser(socket.id)	
		
		// fetch game state
		const game = games.find(g => g.id === user.room)
		if (!game) {
			console.log(`game not found: ${user.room}`)
		}

		// parse move notation
		const { pieceX, pieceY, targetX, targetY } = parseMove(move)		
		
		// get piece
		const piece = game.pieces.find(p => p.boardX === pieceX && p.boardY === pieceY)				

		// validate move
		const legal = legalMove(game.pieces, piece, targetX, targetY)
		if (!legal) {
			console.log('illegal move')
			socket.emit('illegalMove', move)
		}
		else {
			// update game state
			game.pieces = makeMove(game.pieces, move)
			// detect checkmate or stalemate
			const king = game.pieces.find(p => p.name === 'king' && p.color !== game.toMove)
			if (checkmate(game.pieces, king)) {
				console.log('checkmate')
				socket.emit('message', `${game.toMove} won by checkmate`)
			}
			game.toMove = changeToMove(game.toMove)			

			// send move to other client
			socket.broadcast.to(user.room).emit('move', move)
		}		
	})

	// chat messages
	socket.on('sendMessage', (msg, callback) => {
		const user = getUser(socket.id)
		io.to(user.room).emit('message', `${user.username}: ` + msg)
		callback('Delivered')
	})
})

server.listen(port, () => {
	console.log('Server started on port ' + port)
})


const createGame = ({ id, username, color }) => {
	username = username.trim().toLowerCase()
	// generate game ID
	const gameId = uuidv4()

	const user = { id, username, room: gameId }
	users.push(user)

	// create server game state
	let game = {
		id: user.room,
		white: undefined,
		black: undefined,
		pieces: [],
		status: 'active'
	}
	if (color === 'white') {
		game.white = username
	}
	if (color === 'black') {
		game.black = username
	}
	
	// initialize pieces
	initializePieces(game.pieces)

	games.push(game)

	return { user }
}

const joinGame = ({ id, username, gameId }) => {
	username = username.trim().toLowerCase()
	const room = gameId
	let color
	let opponent

	let gameFound = false

	const game = games.find(g => g.id === gameId)
	if (game) {
		gameFound = true
			if (game.white) {
				game.black = username
				color = "black"
				opponent = game.white
			}
			else {
				game.white = username
				color = "white"
				opponent = game.black
			}
			// console.log(game)
	}	

	if (!gameFound) {
		const error = "Game not found"
		return { error }
	}

	const user = { id, username, room, color, opponent }	
	users.push(user)
	return { user }
}

const getUser = id => {
	return users.find(user => user.id === id)
}

const changeToMove = color => {
	if (color === "white") {
		return "black"
	}
	return "white"
}