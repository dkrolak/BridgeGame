import {socket} from './BridgeGame.Login'

var BridgeGame = window.BridgeGame || {}
BridgeGame.RoomsList = (() =>{
    var config = {
            header: String()
                +  '<div id="header">'
                +    '<div class="avatar"></div>'
                +    '<p class="user-name"></p>'
                +  '</div>',            
            main: String()
                +   '<div id="room-container">'
                +       '<div id ="rooms-list"></div>'
                +       '<button type="submit" id="btn-create-room"></button>'  
                +   '</div>',           
            rooms: String()
                +   '<a href="#" id="_id" class="room">'
                +       '<p class="room-id"></p>'
                +       '<div class="player-name-list">'
                +       '</div>'
                +   '</a>',
            header_right_px: 0,
            header_animate_speed: 'slow' ,
            create_room_btn_css: {
                bg_position_px : "0px 218px",
                mousedown: {
                    width   : '154px',
                    height  : '49px',
                    outline : 'none',
                    cursor  : 'grabbing'
                },
                mouseup: {
                    height : '51px',
                    cursor : 'grab'
                }
            },
            image_path: {
                avatar_src  : "url('../images/avatar.png')",
                room_src    : "url('../images/room.png')",
                buttons_src : "url('../images/buttons.png')"
            }
    }, 
    jqueryDOM = {},
    states = {},
    animateHeader, init, joinRoom, enterRoom, jqueryBuffer, sockety,
    onClickCreateRoom, onClickRoom, showRooms, socketListning;

    //------State--------
    states = {
        $container  : null,
        player_name : '',
        id          : '',
        socket      : ''
    } 

    //------------DOM_Methods-----------
    jqueryBuffer = () => {
        let $container = states.$container

        jqueryDOM = {
            $container      :  $container,
            $avatar         :  $('.avatar          '),   
            $createRoomBtn  :  $('#btn-create-room '),
            $header         :  $('#header          '),
            $playerNameList :  $('.player-name-list'),  
            $room           :  $('.room            '),
            $roomContainer  :  $('#room-container  '),
            $roomID         :  $('                 '),
            $roomId         :  $('.room-id         '),
            $room_list      :  $('#rooms-list      '),
            $userName       :  $('.user-name       ')
        }
    }

    animateHeader = () => {
        jqueryDOM.$header.animate({right : config.header_right_px}, config.header_animate_speed)
    }

    showRooms = (room_obj) => {
        let players = room_obj.players,
            id = room_obj.id;

            console.log(room_obj)
        jqueryDOM.$room_list.prepend(config.rooms)
        jqueryDOM.$roomID = $('#_id')

        jqueryDOM.$roomID.attr({id: id, href: id})
                         .find('.room-id')
                         .append(id)
                         .next('.player-name-list')
                         .html(() => {
                             let list = '';

                            players.map( player => { list += `<li>${player.player_name}</li>` })

                            if( players.length < 4 ){
                                for( let i = 0; i < 4 - players.length; i++ ){ list += '<li>-</li>' }
                            }
                            return list
                         })

        jqueryBuffer()
        jqueryDOM.$room.click(onClickRoom)
    }

    enterRoom = (room_obj) => {
        let id = room_obj.id;
        console.log(room_obj)
        window.location.href = '#' + id
        jqueryDOM.$roomContainer.detach()
        jqueryDOM.$header.detach()

        BridgeGame.Board.init(jqueryDOM.$container, room_obj, states)
    }

    joinRoom = (room_obj) => {
        let id = room_obj.id
        socket.emit('join room', {'id': id, 'player': states.player_name})
    }

    //---------Events_Method---------
    onClickCreateRoom = (e) => {
        e.preventDefault()

        socket.emit('create room', states.player_name)
    }

    onClickRoom = (e) => {
        let id = e.currentTarget.id

        e.preventDefault()

        socket.emit('join room', {'id': id, 'player': states.player_name})
    }

    //----------Socket_IO-------------
    socketListning = () => {
        socket.on('room created', data => { joinRoom(data) })
              .on('joined room', data => { enterRoom(data) })
              .on('new room', data => { showRooms(data) })
    }
    
    //---------Public_Methods----------
    init = (statesObj, rooms_arr) => { 

        $('#alert').animate({marginTop : -30}, 'slow')

        states.$container = statesObj.$container
        states.player_name = statesObj.player_name
console.log(socket)
        states.$container.append( config.header )
                         .append( config.main   )

        jqueryBuffer()

        jqueryDOM.$avatar.css({
            'backgroundImage' : config.image_path.avatar_src
        })      

        jqueryDOM.$createRoomBtn.css({
            'backgroundImage'    : config.image_path.buttons_src,
            'backgroundPosition' : config.create_room_btn_css.bg_position_px
        })

        jqueryDOM.$userName.append( states.player_name )

        animateHeader()
        socketListning(socket)  
        rooms_arr.map(showRooms)

        jqueryDOM.$createRoomBtn.click(onClickCreateRoom)

    }  

    return {
        init : init,
        socket : socket
    }
})()


