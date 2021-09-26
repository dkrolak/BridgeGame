import {Player} from './src/server/Player.js';
import {Room}   from './src/server/Room.js';

const express =     require('express'),
      bodyParser =  require('body-parser'),
      path =        require('path'),
      app =         express(),
      server =      require('http').createServer(app),
      port =        8085,
      file =        path.join(__dirname, "dist/index.html"),
      io =          require('socket.io').listen(server);

let roomsList   = [],
    playersList = [],
    new_room, createPlayer;


    io.on('connection', socket => {

        console.log('Player connected!')

        socket.on('login player', data => {
            createPlayer(data, socket.id, socket)
            socket.emit('login success', roomsList)
        })
        .on('create room', data => {
            let ID = '',
                room;

                ID = roomsList.length + 1;

            room = new Room(ID)

            roomsList.push(room)

            socket.join(`room${ID}`)
                  .emit('room created', {'id': ID})

            
        })
        .on('join room', data => {
            let room

            room = roomsList[data.id-1]
            room.handlerSocketEvents(socket, io)
            console.log(room)
            socket.join(`room${data.id}`)
                  .emit('joined room', room)

            room.players.push({player_name: data.player, player_side : '', socketId : socket.id, gameStates: {side: '', hand: []}})

            io.sockets.emit('new room', roomsList[roomsList.length -1])
        })

    })

createPlayer = (playername, socketID) => {
    let playersocket = socketID,
        player

    player = new Player(playername, playersocket)

    playersList.push(player)

}


app.use(express.static(path.join(__dirname, "dist"  )));
app.use(express.static(path.join(__dirname, "src"   )));
app.use(bodyParser.json({ extended: false           }));
app.use(bodyParser.urlencoded());

app.get('/', (req, res) => {

    res.sendfile(file)

})

app.post('/login', (req, res) => {
    let ifPlayerExist = false

    for(let player of playersList){
        if(player.name === req.body.user){
            ifPlayerExist = true
            console.log(player.name)
            break;
        } 
    }

    if(ifPlayerExist === false){

        res.send(roomsList)

    } else {

        res.status(400).send({error : 'Niestety podany nick jest zajęty'})

    }

})

server.listen(port, ()=> console.log('listning on ' + port))

export {io}