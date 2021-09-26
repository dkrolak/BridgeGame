import {Game, declaration, new_sequence, cardSymbol} from "./Game.js"; 
/*
export class Room {
    constructor(id, player, io){
        
        this.Game            = new Game(),
        this.id              = id,
        this.players         = [],
        this.players_ready   = [0, 0],
        this.newSequence     = [],
        this.turnPlayer     = "",
        this.next_player     = -1,
        this.players.push(player),
        this.playerSide = {
            S : '',
            W : '',
            N : '',
            E : ''
        },
        this.game = {
            pass_count  : 0,
            lastAtut    : "",
            table       : [],
            hand        : [],
            tableFull   : 0,
                        NS_team     : {
                            declared_atut  : "",
                            Nplayer        : [],
                            Splayer        : [],
                            declarationTab : {
                                            N : [],
                                            S : []
                            }
            },
            WE_team     : {
                            declared_atut  : "",
                            Wplayer        : [],
                            Eplayer        : [],
                            declarationTab : {
                                            W : [],
                                            E : []
                            }
            },
            states      : {
                            atut            : "",
                            double          : false,
                            redobule        : false,
                            finishAuction   : false,
                            lastDeclaration : "",
                            startingPlayer  : {
                                symbol  : "",
                                index   : ""
                            },
                            const_side      : [],  
                            firstPlayer     : '',
                            old_sequence    : []
            }
        },
        this.log = console.log(this.game.states.old_sequence)
       /* this.socketRoom = (io) => {

            io.sockets.on('connection', function(socket) {  
                let player, random_first_player, playerTurn
        
                console.log('Client connected...');
        
                socket.on('add-user-socket', function(data){
                    player = data.username;
                    Player[player] = {
                        "socketID": socket.id
                    }
                    console.log(Player)
                })
        
                socket.on('join room', function(ID_ROOM){  
                    var newUser = JSON.stringify(user),
                        roomN = "room" + ID_ROOM.id, findRoom;    
                    console.log("The room:" + JSON.stringify(ID_ROOM))
                    console.log("Number of room: " + roomN)  
                    socket.join(roomN)
                    console.log(socket.id)
                    findRoom = rooms_arr.find(room => room.id == ID_ROOM.id)
        
                    io.in(roomN).emit('newUser', newUser)
                    socket.on('choosenSide', function(choosenSide){
                        let sitting={};
                        console.log(choosenSide)
                        
                        findRoom.playerSide[choosenSide.side] = choosenSide.player
                        console.log("Serwer " + JSON.stringify(findRoom))
                        Player[player].side = choosenSide.side
                        findRoom.players_ready[0] += 1
                        console.log(findRoom.players_ready)
                        
                        io.in(roomN).emit('sitting', choosenSide)
        
                        if(findRoom.players_ready[0] == 4){
                            console.log("Gracze usiedli!")
        
                            io.in(roomN).emit('all_sat')
                        }
                        return findRoom
                    })
                })
            })
        },
        this.socketRoom(io)*/
/*
    }



    findStartingPlayer(player, color){
        let team;
        for(var i = 0; i < 2; i++){
            team = Object.keys(player)[i]
            console.log("zaczynamy") 
            console.log(player[team])
            console.log(team)
            if(player[team].length >  0){   
            player[team].map(el => {
                let findFirstDec = el.split('');
                if(findFirstDec[1] === color[1]){
                    if(findFirstDec[0] < color[0] || findFirstDec[0] === color[0]){
                        this.game.states.startingPlayer.symbol = team
                        this.game.states.startingPlayer.index = this.game.states.old_sequence.indexOf(team)
                        console.log(this.game.states.startingPlayer)
                    } 
                    console.log(this.game.states.startingPlayer)
                }
            })
        } 
    
        }
    }

    startGame () {
        let color = this.game.states.atut.split(''),
            startingPlayer = this.game.states.lastDeclaration;

        this.game.states.atut = color[color.length - 1]

        switch(startingPlayer){
            case 'S':
            case 'N':
                this.findStartingPlayer(this.game.NS_team.declarationTab, color)
            break;    
            case 'E':
            case 'W':
                this.findStartingPlayer(this.game.WE_team.declarationTab, color)
            break;    
        }

    }

    randomFirstPlayer(number) {
        return Math.floor(Math.random() * number)
    }

    randomPlayerHand(number) {
        return Math.floor(Math.random() * number)
    }

    storeColorAtut(player, atut) {
        if(atut === 'pass' || atut === 'double' || atut === 'redobule'){
                switch (atut) {
                    case 'pass':
                        this.game.pass_count += 1
                        if(this.game.pass_count === 3){
                            console.log("koniec licytacji")
                            this.game.states.finishAuction = true
                            this.startGame()
                        }
                    break;
                    case 'double':
                        this.game.states.double = true
                    break;
                    case 'redouble':
                        this.game.states.redobule = true
                    break;
                }
        } else {
            this.game.pass_count = 0;
            this.game.states.double = false;
            this.game.states.redobule = false;
            this.game.states.lastDeclaration = player;
            this.game.states.atut = atut;
            this.game.lastAtut = atut;

                switch  (player) {
                    case 'N':
                        this.game.NS_team.declarationTab.N.push(atut)
                    break;
                    case 'S':
                        this.game.NS_team.declarationTab.S.push(atut)
                    break;
                    case 'W':
                        this.game.WE_team.declarationTab.W.push(atut)
                    break;
                    case 'E':
                        this.game.WE_team.declarationTab.E.push(atut)
                    break;
                }
        }
        console.log(this.game.NS_team)
        console.log(this.game.WE_team)
    }
    new_sequence(random_first_player){
        let new_sit, tab, new_sequence_arr = [], 
        old_sequence_arr = ["N", "E", "S", "W"]
            
            tab = old_sequence_arr;
    
        if(random_first_player == 0){
            
            new_sequence_arr = old_sequence_arr.map(sign => {return sign})
            console.log(new_sequence_arr)
            this.Game.states.const_side = new_sequence_arr
            return new_sequence_arr
        }else{
        for(let i = random_first_player; i < old_sequence_arr.length; i++){
    
            new_sit = tab[i]
            new_sequence_arr.push(new_sit)
    
        }
        for(let i = 0; i < random_first_player; i++){
            new_sequence_arr.push(tab[i])
        }
        console.log("Game")
        console.log(new_sequence_arr)
        this.Game.states.const_side = new_sequence_arr
        this.game.states.old_sequence = new_sequence_arr.map(index => index )
        this.newSequence = new_sequence_arr
        console.log(this.game.states.old_sequence)
    }
    return false
    }
};*/