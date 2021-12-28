class PrivateRoom {
    ID : string;
    firstUser : string;
    secondUser : string;

    constructor (id : string, first : string, second : string) {
        this.ID = id;
        this.firstUser = first;
        this.secondUser = second;
    }
}

export default PrivateRoom;