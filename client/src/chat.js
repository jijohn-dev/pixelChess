import { socket } from './connection'

// message elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messages = document.querySelector('#messages')

// message event handler
$messageForm.addEventListener('submit', e => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, error => {
        $messageFormButton.removeAttribute('disabled')
		$messageFormInput.value = ''
		$messageFormInput.focus()

		if (error) {
			return console.log(error)
		}

    })
})

const displayMsg = msg => {
    const html = `<p>${msg}<p>`
    $messages.insertAdjacentHTML('beforeend', html)
}

// display message in chat 
socket.on('message', message => {
    console.log(message)
    const html = `<p>${message}</p>`
    $messages.insertAdjacentHTML('beforeend', html)
})

const addRematchButton = () => {
    const html = '<button id="rematch">Rematch</button>'
    $messages.insertAdjacentHTML('beforeend', html)
    document.getElementById('rematch').addEventListener('click', () => {
        const sentMsg = '<p>rematch requested</p>'
        $messages.insertAdjacentHTML('beforeend', sentMsg)
        socket.emit('offer-rematch')
        document.getElementById('rematch').remove()
    })
}

export { $messages, displayMsg, addRematchButton }