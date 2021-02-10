import { Chess } from "../../modules/chessJS/Chess"

// chess game and graphics
let canvas
let ctx
let sprites

const size = 100

// Chess instance
let game = new Chess()

// pieces array
let pieces = []
let history = []
let lastMove = "start"

let toMove = "white"

let color

// click and drag logic    
let selected = false
let pieceIdx

let lastX = 0
let lastY = 0

export const state = {
	canvas,
	ctx,
	size,
	sprites,
	pieces,
	lastMove,
	history,
	toMove,
	color,
	selected,
	pieceIdx,
	lastX,
	lastY
}