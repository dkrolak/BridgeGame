import { io } from "../../server.js"
import {Cards} from "./Cards.js"

class Game {
    constructor(socket, io){
        this.cards = new Cards(),
        this.players = [],
        this.auction_states = {
            next_player_int : '',
            bid_value       : '',
            pass_count      : '',
            dbl     : 1,
            redbl   : 1,
            N : [],
            S : [],
            W : [],
            E : [],
            availableValues : ['1C', '1D', '1H', '1S', '1NT',
                               '2C', '2D', '2H', '2S', '2NT',
                               '3C', '3D', '3H', '3S', '3NT',
                               '4C', '4D', '4H', '4S', '4NT',
                               '5C', '5D', '5H', '5S', '5NT',
                               '6C', '6D', '6H', '6S', '6NT',
                               '7C', '7D', '7H', '7S', '7NT']
        },
        this.game_states = {
            first_player : false,
            starting_player : '',
            disable_player : {
                player_side : '',
                player_hand : []
            },
            declarer_player : '',
            last_player : '',
            trump_info      : {
                trump_card : '',
                player     : '',
                trump_card_obj : { Value : '', Suit  : ''},

            },
            players_sides :{
                N: {
                    hand : []
                },
                S: {
                    hand: []
                },
                W: {
                    hand: []
                },
                E: {
                    hand: []
                }
            },
            lead_counting: 0,
            round_counting: 0,
            lead : [],
            teamNS : [],
            teamWE : [],
            tricks : [],
            contract : {
                team : '',
                level : '',
                denomination : '',
                dbl : 1,
                redbl : 1
            },
            points: [
                {
                    team : 'NS',
                    contractPoints : {
                        points : [],
                        sum : ''
                    },
                    extraPoints : '',
                    part : ''
                },
                {
                    team : 'WE',
                    contractPoints : {
                        points : [],
                        sum : ''
                    },
                    extraPoints : '',
                    part : ''
                },
                {
                    part_score: false,
                    small_slam : 0, 
                    grand_slam : 0,
                    rubber: ''
                }
            ]
        },
        this.states = {
            room_id : '',
            sides : ['N', 'E', 'S', 'W'],
            values : ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"],
            auctionValues: ['1C', '1D', '1H', '1S', '1NT',
                            '2C', '2D', '2H', '2S', '2NT',
                            '3C', '3D', '3H', '3S', '3NT',
                            '4C', '4D', '4H', '4S', '4NT',
                            '5C', '5D', '5H', '5S', '5NT',
                            '6C', '6D', '6H', '6S', '6NT',
                            '7C', '7D', '7H', '7S', '7NT'],
        }
    }

    handlerSocketEvents(socket, io) {

        socket.on('starting game', () => {})
              .on('auction', data => {

                    this.auction_states.bid_value = data
                    this.auction(io)

              })
              .on('play', data => {

                    this.play(data)
            
              })

    }

    checkCards() {

        let winnerCard = this.game_states.lead[0]

            for(var j = 1; j<= 3; j++) {
                
                let card

                card = this.game_states.lead[j]

                if (card.suit === this.game_states.trump_info.trump_card_obj.Suit && winnerCard.suit != card.suit) {
                    
                    if( winnerCard.suit === this.game_states.trump_info.trump_card_obj.Suit && (this.states.values.indexOf(winnerCard.value) < this.states.values.indexOf(card.value))) {
                           
                        winnerCard = this.game_states.lead[j]

                    } else {

                            winnerCard = this.game_states.lead[j]

                    }
                    
                } else if(winnerCard.suit === card.suit){

                    if(this.states.values.indexOf(winnerCard.value) < this.states.values.indexOf(card.value)) {

                        winnerCard = card

                    }
                }
            }

            this.game_states.lead = []
            
            console.log(`Winner card ${winnerCard}`)

            return winnerCard
    }

    setNewPlayer(io, index) {

        let playerIndex, player, playerSocket, playerSide, side
        
        playerIndex = index + 1

        if(playerIndex === 4){
            playerIndex = 0
        }

        side = this.states.sides[playerIndex]
        player = this.players.find( obj => obj.player_side === side )
        playerSocket = player.socketId
        playerSide = player.player_side

        this.auction_states.next_player_int = playerIndex
        this.auction_states.availableValues = this.game_states.auctionValues

        io.sockets.sockets[playerSocket].emit('auction queue', {'availableValues' : this.auction_states.availableValues, 'firstPlayer_bool' : true})
        io.in(`room${this.states.room_id}`).emit('start auction', {'player' : playerSide})

    }

    prepareNewGame(io, bool) {

        let playerIndex = this.auction_states.next_player_int

        this.handlerSocketEvents(io)
        this.dealCards(io)

        if(bool === true){
        
            this.setNewPlayer(io, playerIndex)
            this.game_states.trump_info.trump_card = ''
            this.game_states.trump_info.trump_card_obj.Suit = ''
            this.game_states.round_counting = 0
            this.game_states.tricks = []
            this.game_states.contract.level = ''
            this.auction_states.availableValues = this.states.auctionValues

         } else {
            this.randomFirstPlayer(io)
         }
    }



    setNextPlayer() {

        let lastPlayerIndex = this.game_states.last_player

        lastPlayerIndex += 1

        if(lastPlayerIndex === 4){

            this.game_states.last_player = 0  

        } else {

            this.game_states.last_player = lastPlayerIndex

        }
    
        console.log(`Next player ${this.states.sides[this.game_states.last_player]}`)

    }

    sendInfoToPlayer(player_side, card = {}, declarer = false) {

        let player, playerSocket

        player = this.players.find( obj => obj.player_side === player_side)

        playerSocket = player.socketId

        io.sockets.sockets[playerSocket].emit('declarer player', {'declarer_bool' : declarer, 'card': card})
        io.in(`room${this.states.room_id}`).emit('next player', player_side)

    }

    startGame() {

        let ifOutOfArray = (index) => {
            if(index === 4) {
                this.game_states.last_player = 0
                this.game_states.starting_player = this.states.sides[0]
            } else {
                this.game_states.last_player = index
                this.game_states.starting_player = this.states.sides[index]
            }

        }
        let findFirstPlayer = (player_bid, side, first_player_hand, second_player_hand) => {
            
            if(player_bid.length === 0){
                let index = this.states.sides.indexOf(this.game_states.trump_info.player)+1
                    ifOutOfArray(index)
                    this.game_states.declarer_player = this.game_states.trump_info.player
                    this.game_states.disable_player.player_side = side
                    this.game_states.disable_player.player_hand = second_player_hand
            } else {
                player_bid.find(element => {
                    let value, color

                    value = element.charAt(0)
                    color = element.charAt(1) + element.charAt(2)

                    this.game_states.trump = color

                    if(color === this.game_states.trump_info.trump_card_obj.Suit){
                        let index = this.states.sides.indexOf(side)+1
                        
                        ifOutOfArray(index)
                        
                        this.game_states.declarer_player = side
                        this.game_states.disable_player.player_side = this.game_states.trump_info.player
                        this.game_states.disable_player.player_hand = first_player_hand

                    } else {
                        console.log('GRacz ' + this.game_states.trump_info.player)
                        let index = this.states.sides.indexOf(this.game_states.trump_info.player)+1
                        
                        ifOutOfArray(index)
                        
                        this.game_states.declarer_player = this.game_states.trump_info.player
                        this.game_states.disable_player.player_side = side
                        this.game_states.disable_player.player_hand = second_player_hand
                    }
                })
            }

            this.game_states.first_player = true
            this.sendInfoToPlayer(this.game_states.starting_player)

            io.in(`room${this.states.room_id}`).emit('starting player', this.game_states.starting_player)
        }
         
        switch (this.game_states.trump_info.player) {

            case 'N':
                findFirstPlayer(this.auction_states.S, 'S', this.game_states.players_sides.N.hand, this.game_states.players_sides.S.hand)
            break;

            case 'S':
                findFirstPlayer(this.auction_states.N, 'N', this.game_states.players_sides.S.hand, this.game_states.players_sides.N.hand)
            break;

            case 'E':
                findFirstPlayer(this.auction_states.W, 'W', this.game_states.players_sides.E.hand, this.game_states.players_sides.W.hand)
            break;

            case 'W':
                findFirstPlayer(this.auction_states.E, 'E', this.game_states.players_sides.W.hand, this.game_states.players_sides.E.hand)
            break;

        }
    }

    play(data) {
        let side, pushLeadToTeam
        
        pushLeadToTeam = (winner) => {

            let side = this.states.sides[winner.side]

            if(side === 'N' || side === 'S'){

            this.game_states.teamNS.push(winner)
            console.log(`Team NS: ${this.game_states.teamNS}`)

                if(this.game_states.contract.team === 'NS'){

                    this.game_states.tricks.push(winner)
                    
                    console.log(`NS tricks: ${this.game_states.tricks.length}`)

                }
                } else if(side === 'W' || side === 'E') {

                    this.game_states.teamWE.push(winner)
                    
                    console.log(`Team WE: ${this.game_states.teamWE}`)

                    if(this.game_states.contract.team === 'WE'){

                        this.game_states.tricks.push(winner)
                        console.log(`WE tricks: ${this.game_states.tricks.length}`)

                    }
                }
        }

        console.log(`Card: ${data}`)

        this.game_states.lead_counting += 1
        
        this.game_states.lead.push({side: this.game_states.last_player, value: data.Value, suit: data.Suit})          

        io.in(`room${this.states.room_id}`).emit('the play', {card: data, side: this.states.sides[this.game_states.last_player]})
        
        if(this.game_states.first_player === true){

            let player, hand;

            this.game_states.first_player = false

            player = this.players.find(x => x.player_side === this.game_states.disable_player.player_side)
            hand = player.gameStates.hand

            io.in(`room${this.states.room_id}`).emit('show card', {disable_player_hand: this.game_states.disable_player.player_hand, disable_player_side: this.game_states.disable_player.player_side})

        }

        if(this.game_states.lead_counting === 4) {

            let winnerQueue

            this.game_states.lead_counting = 0
            this.game_states.round_counting += 1

            winnerQueue = this.checkCards()

            pushLeadToTeam(winnerQueue)
                  
            console.log("Next lead starting:")
            console.log(winnerQueue)
            console.log(this.states.sides[winnerQueue.side])

            this.game_states.last_player = winnerQueue.side
            
            if(this.game_states.round_counting === 13){

                this.countScore()

                io.in(`room${this.states.room_id}`).emit('end queue', "End queue")

            } else {

                if(this.states.sides[winnerQueue.side] === this.game_states.disable_player.player_side){

                    this.sendInfoToPlayer(this.game_states.declarer_player, false, true)

                } else {

                    this.sendInfoToPlayer(this.states.sides[winnerQueue.side])
                    
                }

                io.in(`room${this.states.room_id}`).emit('end queue', 'End queue')

            }

        } else {

            this.setNextPlayer()

            if(this.states.sides[this.game_states.last_player] === this.game_states.disable_player.player_side){
                
                this.sendInfoToPlayer(this.game_states.declarer_player, this.game_states.lead[0], true)
            
            } else {

                this.sendInfoToPlayer(this.states.sides[this.game_states.last_player], this.game_states.lead[0])
            
            }
        }
    }

    auction(io) {
        let bid, side, value
        
        let setNextPlayer = () => {

            this.auction_states.next_player_int += 1

            if(this.auction_states.next_player_int === 4){
                this.auction_states.next_player_int = 0  
            } 
            
        }

        let sendInfoToPlayer = (data) => {
            let player, playerSocket 

            player = this.players.find( obj => obj.player_side === this.states.sides[this.auction_states.next_player_int])
            playerSocket = player.socketId
            
            io.sockets.sockets[playerSocket].emit('auction queue', {'availableValues' : this.auction_states.availableValues, 'firstPlayer_bool' : false})

        }
        
        bid = this.auction_states.bid_value
        
        side = this.states.sides[this.auction_states.next_player_int]    

        if(this.auction_states.bid_value === 'pass' || this.auction_states.bid_value === 'double' || this.auction_states.bid_value === 'redobule'){
            
            value = this.auction_states.bid_value
            
            switch (this.auction_states.bid_value) {
                case 'pass':
                    this.auction_states.pass_count += 1
                    if(this.auction_states.pass_count === 4){

                        console.log("Auction is over")

                        this.game_states.trump_info.trump_card_obj.Value = this.game_states.trump_info.trump_card.charAt(0)
                        this.game_states.trump_info.trump_card_obj.Suit  = this.game_states.trump_info.trump_card.charAt(1) + this.game_states.trump_info.trump_card.charAt(2)
                        this.game_states.contract.level = 6 + parseInt(this.game_states.trump_info.trump_card.charAt(0))
                        
                        if(this.game_states.trump_info.player === 'S' || this.game_states.trump_info.player === 'N'){
                            this.game_states.contract.team = 'NS'
                        } else {
                            this.game_states.contract.team = 'WE'
                        }

                        this.startGame()

                        io.in(`room${this.states.room_id}`).emit('selected trump', {'value' : this.game_states.trump_info.trump_card, 'player' : side})

                    } else {

                        setNextPlayer()
                        sendInfoToPlayer(this.game_states.trump_info.trump_card)

                    }
                break;

                case 'double':

                    this.auction_states.double = true
                    setNextPlayer()
                    sendInfoToPlayer(this.game_states.trump_info.trump_card)

                break;

                case 'redouble':

                    this.auction_states.redobule = true
                    setNextPlayer()
                    sendInfoToPlayer(this.game_states.trump_info.trump_card)

                break;
            }
            
            
        } else {
            let values,value_index

            value = this.auction_states.bid_value

            this.auction_states.pass_count = 0
            this.game_states.trump_info.trump_card = this.auction_states.bid_value
            this.game_states.trump_info.player = side

            this.auction_states.double_bool = false
            this.auction_states.redouble_bool = false

            switch  (side) {
                case 'N':
                    this.auction_states.N.push(this.game_states.trump_info.trump_card)
                break;
                case 'S':
                    this.auction_states.S.push(this.game_states.trump_info.trump_card)
                break;
                case 'W':
                    this.auction_states.W.push(this.game_states.trump_info.trump_card)
                break;
                case 'E':
                    this.auction_states.E.push(this.game_states.trump_info.trump_card)
                break;
            }

            values = this.auction_states.availableValues
           
            value_index = values.indexOf(this.game_states.trump_info.trump_card)

            this.auction_states.availableValues = values.slice(value_index + 1)

            setNextPlayer()
            sendInfoToPlayer(this.game_states.trump_info.trump_card)
            
        }

        io.in(`room${this.states.room_id}`).emit('auction sign', {'value' : value, 'player' : side})
        
    }

    dealCards(io) {

        for(let i = 0; i < 4; i++){
            let player, playerSide, playerSocket, hand, side_obj, side, index;

            hand =  this.cards.hands[i]
            playerSide = this.players[i].player_side
           
            side_obj = Object.values(this.game_states.players_sides)[i]
            side = Object.keys(this.game_states.players_sides)[i]

            side_obj.hand = hand.hand 
            player = this.players.find(x => x.player_side === side)
            index = this.players.findIndex(y => y.player_side === side)

            this.players[index].gameStates.hand.push(hand.hand)
            
            console.log("Card checking:")
            console.log(this.players[index].gameStates.hand)
            
            playerSocket = player.socketId

            io.sockets.sockets[playerSocket].emit('private hand', hand.hand)

        }
        
    }

    randomFirstPlayer (io) {
        let random, player, playerSocket, playerSide, side;

        random = Math.floor(Math.random() * 4)

        this.auction_states.next_player_int = random

        side = this.states.sides[random]
        player = this.players.find( obj => obj.player_side === side )
        playerSocket = player.socketId
        playerSide = player.player_side

        io.sockets.sockets[playerSocket].emit('auction queue', {'availableValues' : this.auction_states.availableValues, 'firstPlayer_bool' : true})
        io.in(`room${this.states.room_id}`).emit('start auction', {'player' : playerSide})
    }
    
    disablePlayer(symbol){
        switch(symbol){
            case "N":
                this.secPlayerAvailable.symbol = "S";
                break;
            case "S":
                this.secPlayerAvailable.symbol = "N";
                break;
            case "E":
                this.secPlayerAvailable.symbol = "W";
                break;
            case "W":
                this.secPlayerAvailable.symbol = "E";
                break;
        }
    }

    countScore(){
        let team, secondTeam, contractPoints
        let colorPointsSum = (value, dbl, redbl, NTfirst = 0) => {
            let score

            console.log(score)

            switch (this.game_states.trump_info.trump_card_obj.Suit){
                case 'C'  :
                case 'D'  :
                    score = value * 20 * dbl * redbl
                break;

                case 'H'  :
                case 'S'  :
                    score = value * 30 * dbl * redbl
                break;
                case 'NT' :
                    score = (NTfirst + (value - 1) * 30) * dbl * redbl
                break;
            }

            console.log(`Color points ${score}`)

            return score
        },
        othersPointsSum = (smallSlam, grandSlam) => {
            let score
            switch (this.game_states.points[2].part_score){
                case false:
                    score = smallSlam + grandSlam
                case true:
                    if(smallSlam > 0){
                        smallSlam = smallSlam + 250
                    } else if(grandSlam > 0){
                        grandSlam = grandSlam + 500
                    }
                    score = smallSlam  + grandSlam
            }

            console.log(`Other points ${score}`)

            return score
        },
        honorsCheck = () => {

            let score = 0
            //check if player holding 4 acs or tramp suit in hand
            for(var i = 0; i < 4; i++){
                let j, z, player

                player = this.players[i]
                z = 0

                player.gameStates.hand.map(card =>{
                    if(card.Suit === 'A') {j ++}
                    if(card.Suit === this.game_states.trump_info.trump_card_obj.Suit && (card.Value === '10' || card.Value === 'J' || card.Value === 'Q' || card.Value === 'K' || card.Value === 'A')){ z++ }
                })

                if(j === 4){
                    switch (player.side){
                    case 'N' :
                    case 'S' :
                        this.game_states.points[0].extraPoints += 150
                    case 'E' :
                    case 'W' :
                        this.game_states.points[1].extraPoints += 150
                    }
                }
                if(z === 4){
                    score += 100 
                } else if(z === 5){
                    score += 150
                }
            }
            
            console.log(`Honor points ${score}`)

            return score
        },
        penatlyPointsSum = (understicks, dbl, redbl) => {
            let score
            
            console.log(`Number of understicks ${understicks}`)

            if(this.game_states.points[team].part < 100){
                let points = 0
                if(dbl === 2 || redbl === 2){
                    for(var i = 1; i <= understicks; i++){
                        if(i === 1){
                            points += 100 * redbl
                        } else if(i === 2 || i === 3){
                            points += 200 * redbl
                        } else if(i >= 4){
                            points += 300 * redbl
                        }
                    }

                    score = points
                } else {
                    score = understicks * 50
                }
            } else {
                let points = 0

                if(dbl === 2 || redbl === 2){
                    for(var i = 1; i <= understicks; i++){
                        if(i === 1){
                            points += 200 * redbl
                        } else if(i >= 2){
                            points += 300 * redbl
                        }
                    }

                    score = points
                } else {
                    score = understicks * 100
                }
            }
            console.log(`Penalty points ${score}`)
            return score
        }
        team = this.game_states.points.findIndex(el => el.team === this.game_states.contract.team)
        secondTeam = (team + (-1)) /-1

        console.log(`Quantity of tricks ${(this.game_states.tricks.length + 1)}`)

        //counting scoring when contract is defeated
        if( (this.game_states.tricks.length + 1) >= this.game_states.contract.level ){
            let smallSlam = 0, 
                grandSlam = 0,
                extraPoints = 0
            
            //penalty point
            console.log(this.game_states.trump_info.trump_card_obj.Value)
            contractPoints = colorPointsSum(this.game_states.trump_info.trump_card_obj.Value, this.game_states.contract.dbl, this.game_states.contract.redbl, 40)
            this.game_states.points[team].contractPoints.sum += contractPoints

            if(contractPoints >= 100 || this.game_states.points[team].contractPoints.sum >= 100) {
                this.game_states.points[2].part_score = true
                this.game_states.points[team].contractPoints.points.push(contractPoints)

                this.game_states.points[secondTeam].contractPoints.sum = 0
                
                //extra points for part
                extraPoints += 300

                if(this.game_states.points[team].contractPoints.sum > 200 && contractPoints < 200){

                    if(this.game_states.points[secondTeam].part_score === true){
                        extraPoints += 500
                    } else {
                        extraPoints += 700
                    }

                    if(this.game_states.points[0].extraPoints > this.game_states.points[1].extraPoints){
                        //The winner is NS
                    } else if(this.game_states.points[0].extraPoints < this.game_states.points[1].extraPoints){
                        //The winner is WE
                    }

                }
            }
            
            if(this.game_states.tricks.length > 6){
            extraPoints += colorPointsSum((this.game_states.tricks.length - 6), this.game_states.contract.dbl, this.game_states.contract.redbl)
            console.log(`Extra points ${extraPoints}`)
            }

            if((this.game_states.tricks.length +1) === 12){

                this.game_states.points[2].small_slam = 500
                smallSlam = 500

            } else if ((this.game_states.tricks.length +1) === 13){

                this.game_states.points[2].grand_slam = 1000
                grandSlam = 1000

            }

            extraPoints += othersPointsSum(smallSlam, grandSlam)
            console.log(extraPoints)
            
            //rubber bonus
            if(this.game_states.points[team].part === 200 && this.game_states.points[secondTeam].part === 100){
               
                extraPoints += 700

            } else if(this.game_states.points[team].part === 200 && this.game_states.points[secondTeam].part === 0){
               
                extraPoints += 500

            }

            extraPoints += honorsCheck()

            console.log(`Extra points ${extraPoints}`)

            this.game_states.points[team].extraPoints = extraPoints
            
            io.in(`room${this.states.room_id}`).emit('scoring', this.game_states.points[team])

            this.prepareNewGame(io, true)

        } else {
              let penatlyPoints, understicks

              understicks = this.game_states.contract.level - (this.game_states.tricks.length + 1)

              penatlyPoints = penatlyPointsSum(understicks, this.game_states.contract.dbl, this.game_states.contract.redbl)

              this.game_states.points[secondTeam].extraPoints += penatlyPoints 
              this.game_states.points[secondTeam].extraPoints += honorsCheck()
              console.log("ugrane punkty przeciwnej druzyny " + penatlyPoints )

              io.in(`room${this.states.room_id}`).emit('scoring', this.game_states.points[secondTeam])

              this.prepareNewGame(io, true)
        }
    }

}



export { 
    Game
}
