import { Chess } from "../../modules/chessJS/Chess"

// chess game and graphics
let canvas
let ctx
let sprites

const size = 100

// Chess instance
let game = new Chess()
let status = 'active'

// client color
let color

// click and drag logic    
let selected = false
let pieceIdx

let lastX = 0
let lastY = 0

// promotion menu
let promotionMenuOpen = false
let menuX
let promotionMove

export const state = {
	canvas,
	ctx,
	size,
	sprites,
	game,
	status,
	color,
	selected,
	pieceIdx,
	lastX,
	lastY,
	promotionMenuOpen,
	menuX,
	promotionMove
}