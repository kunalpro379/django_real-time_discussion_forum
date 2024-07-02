const roomName = JSON.parse(document.getElementById('room-name').textContent);
console.log("Room name: ", roomName);

const chatSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/chat/' + roomName + '/'
);

chatSocket.onopen = function(e) {
    console.log("WebSocket connection opened");
};

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("Received data: ", data);
    switch (data.type) {
        case 'chat':
            document.querySelector('#chat-log').value += (data.username + ': ' + data.message + '\n');
            break;
        case 'canvas':
            handleCanvasUpdate(data.data);
            break;
        case 'output':
            handleOutputUpdate(data.data);
            break;
        case 'editor':
            handleEditorUpdate(data.text, data.sync);
            break;
    }
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

chatSocket.onerror = function(e) {
    console.error('WebSocket error: ', e);
};

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    console.log("Sending message: ", message);
    chatSocket.send(JSON.stringify({
        'type': 'chat',
        'message': message
    }));
    messageInputDom.value = '';
};

function handleCanvasUpdate(data) {
    console.log("Canvas update data: ", data);
    // Implement your canvas update logic here
}

function handleOutputUpdate(data) {
    console.log("Output update data: ", data);
    // Implement your output update logic here
}

function handleEditorUpdate(text, sync) {
    console.log("Editor update text: ", text, " sync: ", sync);
    // Implement your editor update logic here
}
