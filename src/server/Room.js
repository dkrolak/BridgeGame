import {Game} from "./Game.js"
import { io } from "../../server.js"

export class Room{
    constructor(id){
        this.id = id,      
        this.players = [],
        this.availableSides = ['N', 'S', 'E', 'W'],
        this.ready_players = 0,
        this.game = new Game()
    }

    handlerSocketEvents(socket, io) { 
        
        this.game.handlerSocketEvents(socket, io)

        socket.on('Connection', data => { console.log(`New player connected to room ${this.id}`) })
              .on('post side', data => { this.postSide(data) })
              .on('player stand up', data => { this.postLeaveSide(data) })
              .on('player ready', data => { this.startGame(data) })
    }

    postSide(data) {

        let player
           
        player = this.players.find( obj => obj.player_name === data.player )
        player.player_side = data.side

        this.availableSides.splice( this.availableSides.indexOf(data.side), 1 )
        
        if( this.availableSides.length === 0 ){
            io.in(`room${this.id}`).emit('sides selected', {'massage' : 'Wszystkie miejsca zajęte'})
        }
            io.in(`room${this.id}`).emit('player sit', {'player' : data.player, 'side' : data.side})

    }

    postLeaveSide(data) {

        let player

        player = this.players.find( obj => obj.player_name === data.player )
        player.player_side = ''

        this.availableSides.push( data.side )

        io.in(`room${this.id}`).emit('player stand up', {'player' : data.player, 'side' : data.side, 'availableSides' : this.availableSides})

    }

    startGame(data) {

        this.ready_players += 1

        if( this.ready_players === 4 ){
            console.log("The game is staring")

            io.in(`room${this.id}`).emit('start game', 'The is starting!')

           this.game.players = this.players
           this.game.states.room_id = this.id
           this.game.prepareNewGame(io, false)
                                                                      
        }

    }
}