class Player {
    constructor(names, socket){
        this.name = names,
        this.socketID = socket,
        this.gameStates = {
            side : '',
            hand : []
        }
    }
};

export {Player}