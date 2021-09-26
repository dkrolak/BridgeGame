import {socket} from './BridgeGame.Login'

var BridgeGame = window.BridgeGame || {}
BridgeGame.Board = ( () => {
    
    var animateDots, setPlayerName, init, jqueryBuffer, sockets, states, roomState, setPlayerOnTable,
        events, getSide, sitSide, stand_up, getUp, changeSides, onClickSideBtn, setPlayerSide, startGame,
        sit_arr, get_ready, sendReady, drawCards, hoverEffect, standUpPlayerSide, setReadyBtn,
        jqueryDOM = {},
        newSides = [],  
        config = {
            board: String()
                +   '<div id="board-container">'
                +     '<div id="deck">'
                +       '<div class="table">'
                +           '<div class="up-side" value="3"></div>'
                +           '<div class="right-side" value="4"></div>'
                +           '<div class="left-side" value="2"></div>' 
                +           '<div class="down-side" value="1"></div>'
                +       '</div>'
                +     '<div class="side-btn-list">'
                +       '<p>Wybierz strone</p>'
                +       '<div class="sides-btn">'
                +           '<button class="N-side-btn btn" id="N"><span>N</span></button>'
                +           '<button class="S-side-btn btn" id="S"><span>S</span></button>'
                +           '<button class="W-side-btn btn" id="W"><span>W</span></button>'
                +           '<button class="E-side-btn btn" id="E"><span>E</span></button>'
                +       '</div>'
                +     '</div>'
                +     '<button class="start-btn" style="display: none">Gotowy?!</button>'
                +     '</div>'
                +   '<div class="panel">'
                +       '<div class="sides">'
                +           '<div id="N" class="N-side side">'
                +               '<h4>N</h4>'
                +               '<div>-</div>'
                +           '</div>'
                +           '<div id="S" class="S-side side">'
                +               '<h4>S</h4>'
                +               '<div>-</div>'
                +           '</div>'
                +           '<div id="W" class="W-side side">'
                +               '<h4>W</h4>'
                +               '<div>-</div>'
                +           '</div>'
                +           '<div id="E" class="E-side side">'
                +               '<h4>E</h4>'
                +               '<div>-</div>'
                +           '</div>'
                +       '</div>'
                +   '</div>'
                +   '</div>', 
            N_hand: String()
                +   '<div id="N" class="sideTable upSide" value="3">'
                +       '<div id="N_cards" class="cards">'
                +       '<button class="sit-btn">Usiądź</button>'
                +       '<button class="up-btn" style="display: none">Wstań</button>'
                +       '</div>'
                +       '<p id="player_name"></p>'
                +       '<label id="side" for="N">N</label>'
                +   '</div>',
            S_hand: String()
                +   '<div id="S" class="sideTable downSide" value="1">'
                +       '<label id="side" for="S">S</label>'
                +       '<p id="player_name"></p>'
                +       '<div id="S_cards" class="cards">'
                +       '<button class="sit-btn">Usiądź</button>'
                +       '<button class="up-btn" style="display: none">Wstań</button>'
                +       '</div>'
                +   '</div>',
            E_hand: String()
                +   '<div id="E" class="sideTable rightSide" value="4">'
                +       '<label id="side" for="E">E</label>'
                +       '<p id="player_name"></p>'
                +       '<div id="E_cards" class="cards">'
                +       '<button class="sit-btn">Usiądź</button>'
                +       '<button class="up-btn" style="display: none">Wstań</button>'
                +       '</div>'
                +   '</div>',
            W_hand: String()
                +   '<div id="W" class="sideTable leftSide" value="2">'
                +       '<div id="W_cards" class="cards">'
                +       '<button class="sit-btn">Usiądź</button>'
                +       '<button class="up-btn" style="display: none">Wstań</button>'
                +       '</div>'
                +       '<p id="player_name"></p>'
                +       '<label id="side" for="W">W</label>'
                +   '</div>',
            ready_btn: String()
                +    '<button class="ready-btn btn" id="">Rozpocznij gre</button>',
            stand_up_btn: String()
                +   '<button class="btn" id="stand-up-btn"><span>Wstań</span></button>',
            wait_info: String()
                +   '<p>Oczekiwanie na reszte graczy<span id="dots"></span></p>',
            table: String()
                      
    };

    states = {
        $container     : null,
        room_id        : '',
        player_side    : '',
        player_name    : '',   
        newSides       : [],
        playerSide     : {},
        startingPlayer : false,
    }

    roomState = {
        room_id     : '',
        player_name : '',
        player_side : '',
        keep_btn_html : ''
    }

    jqueryBuffer = () => {
        let $container = states.$container

        jqueryDOM = {
            $container      : $container,
            $getPlayerName  : $('#playerName          '),
            $game           : $('#game                '),
            $playerName     : $('#player-name         '),   
            $createRoom     : $('#btn-create-room     '),
            $namePlayer     : $('#namePlayer          '),
            $header         : $('#game-header         '),
            $deck           : $('#deck                '),
            $board          : $('#board-container     '),
            $button         : $('.btn                 '),
            $button_up      : $('.up-btn              '),
            $start_btn      : $('.start-btn           '),
            $N_side         : $('.N-side'),
            $S_side         : $('.S-side'),
            $W_side         : $('.W-side'),
            $E_side         : $('.E-side'),
            $side           : $('.side                '),
            $sides_btn      : $('.sides-btn'),
            $sideBtnList    : $('.side-btn-list'),
            $sides          : $('.sides'),
            $S              : $('#S                   ')
        } 
     
    }

    sockets  = () => {

        socket.emit('Connection', 'Connected!')
              .on('player sit', data => {setPlayerSide(data)})
              .on('player stand up', data => {standUpPlayerSide(data)})
              .on('sides selected', data => {setReadyBtn(data)})
              .on('start game', data => {startGame(data)})

    } 

    
    /*--------------Events------------*/
    events = () => {
        jqueryDOM.$button_up.click(stand_up)
        jqueryDOM.$start_btn.click(sendReady)
    }

    /*--------------End-Events------------*/
    /*--------------DOM---------------*/

    startGame = () => {

        console.log('no to zaczynamy')

        jqueryDOM.$sideBtnList.detach()

        BridgeGame.Game.init( states, jqueryDOM.$board )
    }

    animateDots = () => {
        let dots = 0;
        setInterval(function(){
            if(dots == 5){
                $('#dots').html('')
                dots = 0
            } else {
                $('#dots').append('.')
                dots +=1
            }
        }, 500)
    }

    setPlayerSide = (data) => {
        let side = data.side,
            player = data.player;

        jqueryDOM.$sides.find( `#${side}`)
                        .find( 'div'     )
                        .html( player    )

        if( player === roomState.player_name ){
            let className = jqueryDOM.$sides_btn.find( `#${side}` ).attr( 'class' ).split(' ')[0],
                selectedSide = jqueryDOM.$sides_btn.find( `#${side}` );

            states.player_side = side
            roomState.keep_btn_html = selectedSide
            jqueryDOM.$sides_btn.find( '.btn'           )
                                .attr( 'disabled', true )

            jqueryDOM.$sides_btn.find( `#${side}` )
                                .replaceWith(config.stand_up_btn)

            jqueryDOM.$sides_btn.find('#stand-up-btn')
                                .addClass(`${className}`)
                                .on('click', () => {
                                    socket.emit('player stand up',{'id' : roomState.room_id, 'player' : roomState.player_name, 'side' : roomState.player_side})
                                })

        } else {
            
            jqueryDOM.$sides_btn.find(`#${side}`)
                                .attr('disabled', true)
        }
    }

    standUpPlayerSide = (data) => {
        let side = data.side,
            player = data.player,
            availableSides = data.availableSides;

        jqueryDOM.$sides.find(`#${side}`)
                        .find('div')
                        .html('-')

        if( player === roomState.player_name ){
            let className = jqueryDOM.$sides_btn.find(`#stand-up-btn`).attr('class').split(' ')[0]

            jqueryDOM.$sides_btn.find(`#stand-up-btn`)
                                .replaceWith(roomState.keep_btn_html)

            jqueryDOM.$sides_btn.find(`.${side}-side-btn`)
                                .click(onClickSideBtn)

            availableSides.map(index => {
                
            jqueryDOM.$sides_btn.find(`.${index}-side-btn`)
                                .attr('disabled', false)
            })


        } else {
            
            jqueryDOM.$sides_btn.find(`#${side}`)
                                .attr('disabled', false)
        }
    }

    setReadyBtn = () => {

        jqueryDOM.$sides_btn.replaceWith( config.ready_btn )
        $('.ready-btn').on('click', () => {

            $('.side-btn-list').css({
                'height' : 'auto',
                'width'  : '310px'
            })

            $('p').detach()
            
            $('.ready-btn').replaceWith( config.wait_info )
                           .next( animateDots() )

            socket.emit('player ready', 'ready')
        })
    }

    //---------Events_Method---------
    onClickSideBtn = (e) => {
        let sign_side;
       
        sign_side = e.currentTarget.id
        roomState.player_side = sign_side

        socket.emit('post side', {'id': roomState.room_id, 'player' : roomState.player_name, 'side' : roomState.player_side})
    }

    
    //-----------Public_Methods--------------
    init = ( $container, room_obj, states ) => {
        let players = room_obj.players;
               
        states.$container = $container
       
        roomState.player_name = states.player_name
        roomState.room_id = room_obj.id

        $container.append( config.board )
        sockets( room_obj  )

        jqueryBuffer()
        jqueryBuffer()
        events()

        jqueryDOM.$button.click( onClickSideBtn )

        for(var player in players){
            let data;

            data = {'side' : players[player].player_side, 'player' : players[player].player_name}

            setPlayerSide( data )
        }

    }

    return {
        init   : init,
        config : config
    }

})()