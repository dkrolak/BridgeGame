

var BridgeGame = window.BridgeGame || {}
export var socket = io('http://localhost:8085');
BridgeGame.Login = (() => {
    
    var config = {
        alert : String()
            + '<div id="alert">Ten nick jest już zajęty.</div>',
        login_html: String()
            +'<div id="login-container">'
                +'<div id="logo"></div>'
                +'<form method="" action="">'
                +'<input id="login-name-txt" placeholder="Podaj swój nick" name="username" type="text"   required/>'
                +'<button type="submit" id="login-start-btn"></button>'
                +'</form>'
            +'</div>' ,
        login_fadeOut_time_s  : 300,
        login_btn_css: {
            bg_position_px : "154px 296px",
            mousedown: {
                width   : '150px',
                height  : '73px',
                outline : 'none',
                cursor  : 'grabbing'
            },
            mouseup: {
                height : '75px',
                cursor : 'grab'
            }
        },
        image_path: {
            logo_src : "url('../images/logo.png')",
            btn_src  : "url('../images/buttons.png')"
        }
    },
    socket = io('http://localhost:8085'),
    jqueryDOM = {},
    states = {},
    init, showMainPage, onClickSubmit, jqueryBuffer, postData, socketListning;
    //------States_List--------
    states = {
        $container  : null,
        player_name   : ''
    } 
   
    jqueryBuffer = () => {
        let $container = states.$container

        jqueryDOM = {
            $container   :     $container,
            $login       :     $( '#login-container  '),
            $submit      :     $( '#login-start-btn  '),
            $name        :     $( '#login-name-txt   '),
            $logo        :     $( '#logo             ')
        }
    }

    //-----------SocketListening-------------
    socketListning = () => {
        socket.on('login success', data => {})
    }

    //-----------Events--------
    
    onClickSubmit = (e) => {
        
        let name = jqueryDOM.$name.val()
        e.preventDefault()

        if(name){
        states.player_name = jqueryDOM.$name.val()
    
            postData()
    
        }else{
            jqueryDOM.$name.append('<p>Musisz podać nick!</p>')
        }
       
    }
    //---------End Events------
    showMainPage = (roomsList) => {
 
        jqueryDOM.$login.fadeOut(config.login_fadeOut_time)

        BridgeGame.RoomsList.init(states, roomsList)
         
    }

    postData = ()  => {
        
        let player = {
            playername   : states.player_name,
        }, data;
        
        data = JSON.stringify(player)
    
       $.post('/login', {user: player.playername})
        .done(res => {

            socket.emit( 'login player', player.playername )
            showMainPage(res)

        })
        .fail(res => {
    
            jqueryDOM.$name.css({
                                'border' : '1px solid red'
                            })
            $('#alert').animate({marginTop : 0}, 'slow')
            
        })
        
    };

    //---------Public Method----

    init = $container => {
        
        states.$container = $container;

        $container.append( config.login_html )           
        $('#spa').append(config.alert)

        jqueryBuffer()

        jqueryDOM.$submit.css({
                            'backgroundImage'    : `${config.image_path.btn_src}`,
                            'backgroundPosition' : config.login_btn_css.bg_position_px
                        })
                         .bind({
                            'mousedown' : function() { $(this).css( config.login_btn_css.mousedown )},
                            'mouseup'   : function() { $(this).css( config.login_btn_css.mouseup   )},
                            'click'     : onClickSubmit
                        })

        jqueryDOM.$logo.css({
                            'backgroundImage'     : `${config.image_path.logo_src}`,
                            'backgroundPostition' : "0px 0px"
        })
                      
        socketListning()
    
    }
    
    return {
        init : init,
        socket : socket
    }

    

})()


