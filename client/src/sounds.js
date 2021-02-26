const sounds = {}

// absolute path to sounds directory
const path = './assets/sounds/'

sounds.movePiece = new Audio(path + 'movePiece.wav')
sounds.capture = new Audio(path + 'capture.wav')
sounds.check = new Audio(path + 'check.wav')
sounds.badMove = new Audio(path + 'badMove.wav')
sounds.gameStart = new Audio(path + 'gameStart.wav')
sounds.gameEnd = new Audio(path + 'gameEnd.wav')

export default sounds

