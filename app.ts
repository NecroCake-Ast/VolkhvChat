import * as express from 'express';
import * as path from 'path';
import * as console from 'console';
import { Socket } from 'socket.io';
import Message from './models/message'
import UserData from './models/userData';
import PrivateRoom from './models/privateRoom';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'frontend')));

let channelStory = new Map<string, Message[]>();
let userNames = new Map<string, string>();
let privateChannels : PrivateRoom[] = []

const sendUsers = () : UserData[] => {
    let users:UserData[] = [];
    for (let key of userNames.keys()) {
        users.push(new UserData(key, userNames.get(key)));
    }
    return users;
}

const findPrivateChannel = (id : string) : PrivateRoom => {
    for (let curChannel of privateChannels) {
        if (curChannel.ID == id) {
            return curChannel;
        }
    }
    return null;
};

const findPrivateByIDs = (first : string, second : string) : PrivateRoom => {
    for (let curChannel of privateChannels) {
        if ((curChannel.firstUser == first && curChannel.secondUser == second)
            || (curChannel.secondUser == first && curChannel.firstUser == second)) {
            return curChannel;
        }
    }
    return null;
}

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
    userNames.set(socket.id, 'Anonymous');
    
    const roomListener = (roomID : string) => {
        let cnl : PrivateRoom = findPrivateChannel(roomID);
        if (cnl != null && cnl.firstUser != socket.id && cnl.secondUser != socket.id) {
            return;
        }

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

    const privateListener = (userID : string) => {
        let chId : string;
        let channel : PrivateRoom = findPrivateByIDs(userID, socket.id);
        if (channel == null) {
            chId = uuidv4();
            while (channelStory.has(chId) || findPrivateChannel(chId) != null) {
                chId = uuidv4();
            }
            privateChannels.push(new PrivateRoom(chId, userID, socket.id));
        }
        else {
            chId = channel.ID;
        }
        roomListener(chId);
    }
    socket.on('private join', privateListener);

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