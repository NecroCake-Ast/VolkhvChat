import * as express from 'express';
import * as path from 'path';
import * as console from 'console';
import { Socket } from 'socket.io';
import Message from './models/message'

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let channelStory = new Map<string, Message[]>();
channelStory.set("global", []);

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
    
    const roomListener = (roomID : string) => {
        console.log(socket.handshake.address + " go to " + roomID);
        socket.removeAllListeners('chat message');
        socket.join(roomID);
        socket.emit('chat changed');
        
        if(!channelStory.get(roomID)) {
            channelStory.set(roomID, []);
        }
        else {
            for (const msg of channelStory.get(roomID)!) {
                socket.emit('show message', msg);
            }
        }

        socket.on('chat message', (msg : string) => {
            console.log(socket.handshake.address + ' [' + roomID + ']: ' + msg);
            let responseMsg = new Message(new Date(), socket.handshake.address, 'NoName', msg);
            channelStory.get(roomID)!.push(responseMsg);
            io.to(roomID).emit('show message', responseMsg);
        });

        socket.on('leave room', () => {
            socket.leave(roomID);
        });
    };
    socket.on('change room', roomListener);

    socket.on('disconnect', () => {
        console.log('disconnect');
    });

    roomListener('global');
});

server.listen(1337, '192.168.0.105', async function () {
    console.info('Starting listen an port 1337\n');
});