var username = "";
var method = "";

setUsernameAndMethod();

var ws = new WebSocket('ws://localhost:7070/websocket?user='+username)

ws.onmessage = function (msg) {
    //console.log(msg)
    var msgParsed = JSON.parse(msg.data)
    chatBoxNewMsg(msgParsed.message, msgParsed.sender);
}

function sendMsg() {
    var sendBox = document.getElementById("send-box")
    var msg = sendBox.value

    if (msg.length < 1) {
        sendBox.placeholder = "Message cannot be empty"
    } else {
        var msgBody = {sender: username, message: msg}
        ws.send(JSON.stringify(msgBody));
        chatBoxNewMsg(msg, "You")
        sendBox.value = ""
    }
}


function setUsernameAndMethod() {
    username = document.getElementById("info-nickname").innerHTML;
    method = document.getElementById("info-method").innerHTML
}

function chatBoxNewMsg(msg, sender) {
    var chatBox = document.getElementById("chat-box")
    var chatBoxContent = chatBox.innerHTML;
    
    if (sender == "You") {
        chatBox.innerHTML = chatBoxContent + "<span><b>" + sender + ": </b></span><span>" + msg + "</span><br>"
    } else {
        chatBox.innerHTML = chatBoxContent + "<span style='color:chartreuse'><b>" + sender + ": </b></span><span>" + msg + "</span><br>";
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
}