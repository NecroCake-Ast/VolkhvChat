class Message {
    sendDate : string;
    senderIP : string;
    senderName : string;
    roomName : string;
    message : string;

    constructor (date : Date, ip : string, sender : string, room : string, msg : string) {
        this.sendDate = date.toLocaleString();
        this.senderIP = ip;
        this.senderName = sender;
        this.message = msg;
        this.roomName = room;
    }
}

export default Message;