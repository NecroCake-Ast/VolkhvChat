import * as express from 'express';
import * as path from 'path';
import * as console from 'console';
import { Socket } from 'socket.io';

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", async function (req: express.Request, res: express.Response) {
    try {
        res.sendFile(__dirname + "/frontend/global.html");
    } catch (e) {
        console.error(e);
        res.send(false);
    }
});

io.on('connection', (socket : Socket) => {
    console.log(socket.handshake.address + ' connected');

    const globalListener = (msg : string) => {
        console.log(socket.handshake.address + ' [global]: ' + msg);
        io.emit('show message', msg);
    };
    socket.on('chat message', globalListener);
    
    const roomListener = (roomID : string) => {
        console.log(socket.handshake.address + " go to " + roomID);
        socket.off('chat message', globalListener);

        socket.on('chat message', (msg : string) => {
            console.log(socket.handshake.address + ' [' + roomID + ']: ' + msg);
            io.to(roomID).emit('show message', msg);
        });
    };
    socket.on('change room', roomListener);
});

server.listen(1337, '192.168.0.105', async function () {
    console.info('Starting listen an port 1337\n');
});