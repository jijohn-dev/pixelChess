const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const { v4: uuidv4 } = require('uuid')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../client/public')
app.use(express.static(publicDirectoryPath))

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

// store users
const users = []


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
		
		// send move to other client
		socket.broadcast.to(user.room).emit('move', move)				
	})

	// resign
	socket.on('resign', () => {
		const user = getUser(socket.id)			
		io.to(user.room).emit('resign', user.color)
	})

	// offer draw
	socket.on('offer-draw', () => {
		const user = getUser(socket.id)
		socket.broadcast.to(user.room).emit('offer-draw', user.color)
	})

	// accept draw
	socket.on('accept-draw', () => {
		const user = getUser(socket.id)	
		io.to(user.room).emit('accept-draw')
	})

	// offer rematch
	socket.on('offer-rematch', () => {
		const user = getUser(socket.id)
		socket.broadcast.to(user.room).emit('offer-rematch')
	})

	// accept rematch
	socket.on('accept-rematch', () => {
		const user = getUser(socket.id)	
		io.to(user.room).emit('accept-rematch')
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

	const user = { id, username, color, room: gameId }
	users.push(user)	

	return { user }
}

const joinGame = ({ id, username, gameId }) => {
	username = username.trim().toLowerCase()
	const room = gameId

	// get color
	const opponent = users.find((user) => user.room === room)
	if (!opponent) {		
		return { error: 'game not found '}
	}
	const color = opponent.color === 'white' ? 'black' : 'white'

	const user = { id, username, room, color, opponent: opponent.username }	
	users.push(user)
	return { user }
}

const getUser = id => {
	return users.find(user => user.id === id)
}