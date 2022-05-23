const PORT = 7070;

const ws = require('ws');
const queryString = require('query-string');

const express = require('express');
var fs = require('fs')
var https = require('https')
const app = express();

app.use(express.static('public'));
app.set('view engine', 'pug')

app.use(express.json())

const url = require('url');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text())

var lastMsgFrom = {};


//defining the controllers______________________________________________________

app.get('/', function (req, res) {
    res.render('index', {})
})

app.post('/enter', function (req, res) {
    res.redirect(url.format({
        pathname:"/chat",
        query: {
            "name": req.body.name,
            "method": req.body.method
        }
    }))
})

app.get('/chat', function (req, res) {
    res.render('chat', {title: req.query.name, method: req.query.method})
})

app.get('/update', async function (req, res) {
    var deets = JSON.parse(req.headers.deets)

    if (deets.method == "polling") {
        //console.log("dosao mi je poll")
        var mybMsg = lastMsgNotFromMe(deets.asker)
        if (mybMsg) {
            delete lastMsgFrom[mybMsg.sender]
            res.json({sender: mybMsg.sender, message: mybMsg.msg})
        } else {
            res.sendStatus(204)
        }
    } else if (deets.method == "long_polling") {
        //console.log("dosao mi je long poll")
        var noUpdates = true;
            var cnt = 0;
        while (noUpdates) {
            var mybMsgLong = lastMsgNotFromMe(deets.asker)
            if (mybMsgLong) {
                noUpdates = false;
                delete lastMsgFrom[mybMsgLong.sender]
                res.json({sender: mybMsgLong.sender, message: mybMsgLong.msg})
            }
            await sleep(100)
        }
    }
})

app.post('/submit', function (req, res) {
    var sender = JSON.parse(req.headers.deets).sender
    lastMsgFrom[sender] = req.body

    wss.clients.forEach(client => {
        client.send(JSON.stringify({sender: sender, message: req.body}))
    })

    res.sendStatus(200)
})

//starting the server_______________________________________________________

const server = app.listen(PORT, () => {
    console.log(`Now listening on port ${PORT}`);
})

//websocket________________________________________________________________

const wss = new ws.Server({noServer: true, path: "/websocket"})

server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (websocket) => {
        wss.emit("connection", websocket, request);
    })
})

wss.on(
    "connection",
    async function connection(websocketConnection, connectionRequest) {
        const [_path, params] = connectionRequest?.url?.split("?");
        const connectionParams = queryString.parse(params);

        //if msg rcvd while away
        var mybMsg = lastMsgNotFromMe(connectionParams.user)
        if (mybMsg) {
            delete lastMsgFrom[mybMsg.sender]
            websocketConnection.send(JSON.stringify({sender: mybMsg.sender, message: mybMsg.msg}));
        }

        //on recieving msg broadcast it to other websockets
        websocketConnection.on("message", (message) => {
            var msgParsed = JSON.parse(`${message}`)
            lastMsgFrom[msgParsed.sender] = msgParsed.message

            wss.clients.forEach(client => {
                if (client != websocketConnection) {
                    client.send(`${message}`)
                    delete lastMsgFrom[JSON.parse(`${message}`).sender]
                }
            })
        })
    }
)

//helper functions_________________________________________________________

function lastMsgNotFromMe(asker) {
    for (const name in lastMsgFrom) {
        if (name != asker) {
            return {sender: name, msg: lastMsgFrom[name]}
        }
    }
}

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
  