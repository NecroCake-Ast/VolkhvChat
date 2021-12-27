import * as express from 'express';
import * as path from 'path';
import * as console from 'console';
import { Socket } from 'socket.io';
import Message from './models/message'
import UserData from './models/userData';

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'frontend')));

let channelStory = new Map<string, Message[]>();
let userNames = new Map<string, string>();
channelStory.set("global", []);

app.get("/", async function (req: express.Request, res: express.Response) {
    try {
        res.sendFile(__dirname + "/frontend/global.html");
    } catch (e) {
        console.error(e);
        res.send(false);
    }
});

const sendUsers = () => {
    let users:UserData[] = [];
    for (let key of userNames.keys()) {
        users.push(new UserData(key, userNames.get(key)));
    }
    return users;
}

io.on('connection', (socket : Socket) => {
    console.log(socket.handshake.address + ' connected');
    userNames.set(socket.id, 'Anonymous');
    
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
            let responseMsg = new Message(new Date(), socket.handshake.address, userNames.get(socket.id)!, roomID, msg);
            channelStory.get(roomID)!.push(responseMsg);
            io.to(roomID).emit('show message', responseMsg);
        });

        socket.on('leave room', () => {
            socket.leave(roomID);
        });
    };
    socket.on('change room', roomListener);

    const nameListener = (name : string) => {
        userNames.set(socket.id, name);
        io.emit('users update', sendUsers());
    }
    socket.on('change name', nameListener);

    socket.on('disconnect', () => {
        userNames.delete(socket.id);
        console.log('disconnect');
        io.emit('users update', sendUsers());
    });

    roomListener('root');
    io.emit('users update', sendUsers());
});

server.listen(1337, '192.168.0.105', async function () {
    console.info('Starting listen an port 1337\n');
});