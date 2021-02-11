const { checkmate, stalemate } = require("./attacking")
const { legalMove, makeMove } = require("./move")
const { initializePieces, loadBoard } = require("./utils")

class Chess {
	constructor() {		
		this.pieces = []
		this.moves = []
		this.lastMove = "start"
		this.toMove = "white"
		this.stalemate = false
		this.checkmate = false

		initializePieces(this.pieces)
	}

	legal(move) {
		return legalMove(this.pieces, move, this.lastMove)
	}

	play(move) {
		this.moves.push(move)
		this.lastMove = move
		this.pieces = makeMove(this.pieces, move)		

		// checkmate or stalemate?
		const king = this.pieces.find(p => p.name === "king" && p.color !== this.toMove)
		
		if (checkmate(this.pieces, king)) {			
			this.checkmate = true
			this.winner = this.toMove
		}
		else if (stalemate(this.pieces, king)) {
			this.stalemate = true
		}
		else {
			// update to move
			this.toMove = this.toMove === "white" ? "black" : "white"
		}
	}

	// print the board to the console
	printBoard() {
		const board = []
		for (let i = 0; i < 8; i++) {
			const row = ['_', '_', '_', '_', '_', '_', '_', '_']
			board.push(row)
		}
		this.pieces.forEach(p => {
			let char = p.name[0]

			if (p.name === 'knight') {
				char = 'n'
			}
			if (p.color === 'black') {
				char = char.toUpperCase()
			}

			board[p.boardY][p.boardX] = char
		})
		for (let i = 0; i < 8; i++) {
			console.log(board[i].join(' '))
		}
	}

	// load board state from char array
	load(board, toMove, lastMove) {		
		this.pieces = loadBoard(board)
		this.toMove = toMove
		this.lastMove = lastMove

		// check for mate
		const king = this.pieces.find(p => p.name === "king" && p.color !== this.toMove)
		if (checkmate(this.pieces, king)) {			
			this.checkmate = true
			this.winner = this.toMove
		}
		else if (stalemate(this.pieces, king)) {
			this.stalemate = true
		}
	}
}

module.exports = {
	Chess,
	makeMove
}