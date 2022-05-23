var username = "";
var method = "";
const INTERVAL = 2000;

function checkUpdates() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/update');

    var deets = new Object();
    deets.asker = username;
    deets.method = method;
    xhr.setRequestHeader("deets", JSON.stringify(deets));

    xhr.onload = function () {
        if (this.status == 200) {
            //console.log(this.responseText)
            var response = JSON.parse(this.responseText)
            var sentBy = response.sender
            var msg = response.message
            chatBoxNewMsg(msg, sentBy)
            
        } else {
            console.log("no new messages at this time")
        }
    }
    xhr.send();
}

function sendMsg() {
    var sendBox = document.getElementById("send-box")
    var msg = sendBox.value

    if (msg.length < 1) {
        sendBox.placeholder = "Message cannot be empty"
    } else {
        sendBox.placeholder = ""

        var xhr = new XMLHttpRequest()
        xhr.onload = function () {
            if (this.status == 200) {
                chatBoxNewMsg(msg, "You")
                sendBox.value = ""
            } else {
                alert("Something went wrong while sending the message.")
            }
        }
        xhr.open('POST', '/submit');

            var deets = new Object();
            deets.sender = username;
            //deets.method = method;
        xhr.setRequestHeader("deets", JSON.stringify(deets))
        
        xhr.send(msg)
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

setUsernameAndMethod();

setInterval(checkUpdates, INTERVAL)