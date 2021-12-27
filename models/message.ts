class Message {
    sendDate : string;
    senderIP : string;
    senderName : string;
    message : string;

    constructor (date : Date, ip : string, sender : string, msg : string) {
        this.sendDate = date.toLocaleString();
        this.senderIP = ip;
        this.senderName = sender;
        this.message = msg;
    }
}

export default Message;