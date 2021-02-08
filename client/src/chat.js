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

// display message in chat 
socket.on('message', message => {
    console.log(message)
    const html = `<p>${message}</p>`
    $messages.insertAdjacentHTML('beforeend', html)
})

export { $messages }