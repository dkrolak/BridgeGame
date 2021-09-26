import {socket} from './BridgeGame.Login'

var BridgeGame = window.BridgeGame || {}
BridgeGame.Game = ( () => {
    var bufor, states, createAuctionTable, drawAutionTableSelection, markCurrentPlayer, addTrumpToBoard, init, showWinnerTeam, displaySign, showAuctionTable, onAuctionBtnClick, setSides, removeCard, drawAuctionTable, onMouseOverCard, onMouseLeaveCard, displayAuctionTable, showCardsDisablePlayer, onHoverBtn, drawCards, drawOthersCards, events, auctionChoose, onClickCard, states, sockets, auctionTable, startGame, addEventsToBtn, addCardToTable, clearTable,
    jqueryDOM = {},
    config = {};

    config = {
        hands : String()
            + '<div class="hand up-side">'
            +   '<div class="cards"></div>'
            + '</div>'
            + '<div class="hand down-side">'
            +   '<div class="cards"></div>'
            + '</div>'
            + '<div class="hand left-side">'
            +   '<div class="cards"></div>'
            + '</div>'
            + '<div class="hand right-side">'
            +   '<div class="cards"></div>'
            + '</div>',
        auctionTabel: String()
                + '<div class="auction-container" style="display: none">'
                    +   '<p>Licytacja</p>'
                    +   '<div class="auction-table">'
                    +   '</div>'
                    +   '<div class="auction-btn-rest">'
                    +       '<button class="auction-btn" id="double-btn" value="double"></button>'
                    +       '<button class="auction-btn" id="pass-btn" value="pass"></button>' 
                    +       '<button class="auction-btn" id="redouble-btn" value="redouble"></button>'
                    +   '</div>'       
                + '</div>',
        auctionTableSelection: String()
                +   '<div class="selectionList">'
                +       '<div class="trump-container"><h4>Trumf:</h4><div class="trump"></div></div>'
                +       '<div class="selection" value="N"><h4>N</h4></div>'
                +       '<div class="selection" value="E"><h4>E</h4></div>'
                +       '<div class="selection" value="S"><h4>S</h4></div>'
                +       '<div class="selection" value="W"><h4>W</h4></div>'       
                +   '</div>',
        atut: String()
                + '<p id="atut"></p>',
        cards_active_css : {
            box_shadow : '15px 5px lightgoldenrodyellow'
        },
        cards_position_css : {           
            height : ['0px', '141.4px', '282.8px', '423.8px'],//[H,D,C,S]
            width  : ['100px', '200px' , '300px', '400px', '500px', '600px', '700px', '800px', '900px', '1000px', '1100px', '1200px', '1300px']//['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        },
        card_properties_css : {
            z_index : 0
        },
        auction_card_px : {
            height : 50,
            width  : 80
        },
        double_btn_css : {
            bg_posiotion_px : '0px 107px'
        },
        redouble_btn_css : {
            bg_posiotion_px : '0px 77px'
        },
        pass_btn_css : {
            bg_posiotion_px : '0px 47px'
        },
        image_path : {
            cards_src         : "url('../images/cardss.png')",
            card_back_src     : "url('../images/card-back.png')",
            auction_table_src : "url('../images/auction8.png')",
            buttons_list_src  : "url('../images/buttons.png')"
        },
        states: {
            begginingOfAuction: true
        }
               
    }

    states = {

        $container : null

    }

    bufor = () => {

        let $container = states.$container

        jqueryDOM = {
            $container        :   $container,
            $board            :   $('#board-container            '),
            $auctionContainer :   $('.auction-container          '),
            $auctionTable     :   $('.auction-table              '),
            $actionBtnList    :   $('.auction-table .auction-btn '),
            $auctionBtn       :   $('.auction-btn                '),
            $atutLabel        :   $('#atut                       '),
            $card             :   $('.S').find('.card            '),
            $deck             :   $('#deck                       '),
            $upSide           :   $('.up-side                    '),
            $downSide         :   $('.down-side                  '),
            $rightSide        :   $('.right-side                 '),
            $leftSide         :   $('.left-side                  '),
            $table            :   $('.table                      ')
        }
    }

sockets = () => {
    
    socket.emit('starting game', "GRa sie rozpoczyna")
          .on('private hand', data => {drawCards(data, 'down-side'), drawOthersCards()})
          .on('auction queue', data => {showAuctionTable(data)})
          .on('auction sign', data => {displaySign(data)})
          .on('selected trump', data => {addTrumpToBoard(data)})
          .on('start auction', data => {console.log('Rozpoczyna grasz: '+ data.player)})
          .on('declarer player', data => {addEventsToBtn(data)})
          .on('show card', data => {drawCards(data.disable_player_hand, data.disable_player_side)})
          .on('the play', data => {addCardToTable(data), removeCard(data)})
          .on('next player', data =>{markCurrentPlayer(data)})
          .on('end queue', data => clearTable())
          .on('scoring', data => {showWinnerTeam(data)})
}

    drawCards = (data, side) => {

        let value = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
            suit = ['H', 'S', 'C', 'D'];

        $(`.${side}`).find('.cards').empty()

        for(var i = 0; i < 13; i++){

            let card, valueIndex, suitIndex;
            
            valueIndex = value.indexOf(data[i].Value)
            suitIndex = suit.indexOf(data[i].Suit)

            card = $(`<div class="card" value="${data[i].Value}" suit="${data[i].Suit}"></div>`)

            card.css({
                'backgroundImage'    : config.image_path.cards_src,
                'backgroundPosition' : `${config.cards_position_css.width[valueIndex]} ${config.cards_position_css.height[suitIndex]}`
            })
            
            $(`.${side}`).find('.cards').append(card)

        }

        bufor()

    }

    addTrumpToBoard = (data) => {

        $('.trump').html(data.value)

    }

    markCurrentPlayer = (data) => {

        $(`.sides .${data}-side`).css({'backgroundColor' : '#FF9B45'})
        console.log("markowanie")
        console.log(data)

    }

    drawOthersCards = () => {

        for(var i = 0; i < 13; i++){

            let card;

            card = $('<div class="card"></div>')

            card.css({
                'backgroundImage'    : config.image_path.card_back_src
            })

            $('.left-side, .up-side, .right-side').find('.cards').append(card)

        }

    }

    drawAuctionTable = () => {

        let cardWidth, cardHeight,
        auctionSigns = ['NT', 'S', 'H', 'D', 'C'];

        cardWidth = 0
        cardHeight = 0

        for(let i = 0; i < 5; i++){

            let colorRow;
            
            colorRow = `<div class="auctionRow ${auctionSigns[i]}"></div>`
            
            jqueryDOM.$auctionTable.append(colorRow)
            
            for(let j = 1; j < 8; j++){

                let auctionCard
                
                auctionCard = $(`<button class="auction-btn ${j + auctionSigns[i]}" value="${j + auctionSigns[i]}"></button>`) //usunieta auction-btn

                auctionCard.css({
                                'backgroundImage'    : config.image_path.auction_table_src,
                                'backgroundPosition' : `${cardWidth}px ${cardHeight}px`,
                                'z-index'            : `${j+2}`  
                            })
                            .prop('disabled', false)
                            .hover(function(){

                                $(this).css('z-index', j+3) 

                            }, function(){

                                $(this).css('z-index', j+2)

                            })

                $(`.${auctionSigns[i]}`).append(auctionCard)

                cardHeight -= config.auction_card_px.height

            }               
            
            cardWidth -= config.auction_card_px.width

            cardHeight = 0
        }

        bufor()

        jqueryDOM.$auctionBtn.on({
            mouseenter : function(e) {
                $(this).css({
                       // 'height'    : '60px',
                       // 'marginTop' : '-25px'
                })
            },
            mouseleave : function(e) {
                $(this).css({
                       // 'height'    : '50px',
                        //'marginTop' : '-15px'
                })
            }
        }).click(onAuctionBtnClick)

    }

    setSides = () => {

        let j,
            sides_arr = ['N', 'E', 'S', 'W'],
            sides_DOM_arr = [jqueryDOM.$leftSide, jqueryDOM.$upSide, jqueryDOM.$rightSide];
        
        j = sides_arr.indexOf(states.player_side)

        jqueryDOM.$downSide.addClass(sides_arr[j])

        for(var i = 0 ; i < 3; i++){
         
            if(j === 3) {
                j = 0
            } else {
                j++
            }

            sides_DOM_arr[i].addClass(sides_arr[j])
         
        }

    }

    showAuctionTable = (data) => {

        if(data.firstPlayer_bool){

            jqueryDOM.$auctionContainer.css('display', '')
            
        } else {

            jqueryDOM.$auctionContainer.css('display', '')
            jqueryDOM.$auctionTable.find(jqueryDOM.$auctionBtn)
                                   .prop('disabled', true)
                                   .css({
                
                                        'filter'   : 'grayscale(70%)'
                                   })
                data.availableValues.map(element => {

                    $(`.${element}`).prop('disabled', false)
                                    .css('filter', 'grayscale(0%)')

                })

        }

    }

    displaySign = (data) => {

        let value = $(`<span>${data.value}</span>`),
            emptyValue;

        $(`div[value = ${data.player}]`).append(value)

        if(config.states.begginingOfAuction === true){
            emptyValue = $('<span>x</span>')
            switch(data.player){
                case 'W':
                    $(`div[value = 'N'], div[value = 'E'], div[value = 'S']`).append(emptyValue)
                break;

                case 'S':
                    $(`div[value = 'N'], div[value = 'E']`).append(emptyValue)
                break;

                case 'E':
                    $(`div[value = 'N']`).append(emptyValue)
                break;
            }

            config.states.begginingOfAuction = false
        } 

    }

    onHoverBtn = (e, value) => {
        
        $(e.target).css({
                    'marginTop' : value
        })

    }

    removeCard = (data) => {

        let hand, side ;

        hand = jqueryDOM.$deck.find(`.hand.${data.side}`)

        side = hand.find(`div[value=${data.card.Value}][suit=${data.card.Suit}]`)

        if(side.length != 0){

            side.remove()

        } else {

            hand.find('.card').eq(0).remove()

        }
    }

//EVENT
    events = () => {

        jqueryDOM.$auctionBtn.click(onAuctionBtnClick)
        
        jqueryDOM.$card.click(onClickCard)
        
    }
    //DOM
    clearTable = () => {

        $('.table').find('.card').remove()

    }

    addCardToTable = (data) => {

        let card, suitIndex, valueIndex, value, suit;

        value = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
        suit = ['H', 'S', 'C', 'D'];

        valueIndex = value.indexOf(data.card.Value)
        suitIndex = suit.indexOf(data.card.Suit)

        config.card_properties_css.z_index += 1

        card = $(`<div class="card" value="${data.card.Value}" suit="${data.card.Suit}"></div>`)

        card.css({
            'backgroundImage'    : config.image_path.cards_src,
            'backgroundPosition' : `${config.cards_position_css.width[valueIndex]} ${config.cards_position_css.height[suitIndex]}`,
            'z-index'            : config.card_properties_css.z_index
        })

        $('.sides .S-side, .sides .N-side, .sides .E-side, .sides .W-side').css({'backgroundColor' : '#ffca51'})

        jqueryDOM.$table.find(`.${data.side}`).append(card) 

    }

    showWinnerTeam = (data) => {
        console.log("Wygrali:")
        console.log(data)
    }

    onClickCard = (e) => {

        let value = $(e.target).attr('value'),
            suit = $(e.target).attr('suit'),
            offPlayerSide = $('#N').find('#side').val();

        $('.card').unbind('click mouseover mouseleave')
                  .css('box-shadow', 'none')

        console.log(`Wybrana karta: ${value}`)

        socket.emit('play', {Value: value, Suit: suit})
    }

    onMouseLeaveCard = (e) => {

        $(e.target).css("margin-top", "10px")

    }

    onMouseOverCard = (e) => {

        $(e.target).css("margin-top", "-0px")

    }

    onAuctionBtnClick = (e) => {

        let value = e.currentTarget.value;

        jqueryDOM.$auctionContainer.hide()
                                   /*.css({
                                       'box-shadow': 'none',
                                       'backgroundColor' : 'black'
                                    })*/

        socket.emit('auction', value)
    }

    
    addEventsToBtn = (data) => {

        let addEvents = (index, element) => {
            $(element)
                .click(onClickCard)
                .mouseover(onMouseOverCard)
                .mouseleave(onMouseLeaveCard)
        }

        if(!data.declarer_bool){
        let card = $('.down-side').find(`div[suit=${data.card.suit}]`)
         console.log(card.length)
        if(card.length != 0){
            console.log('ale jak')
            $('.down-side').find(`div[suit=${data.card.suit}]`).each(addEvents).css({
                'z-index' : 999
                                                                                })
        } else {
            console.log('to tak')
            $('.down-side').find('.card').each(addEvents).css({
                'z-index' : 999
                                                            })
        }
    } else {
        let card = $('.up-side').find(`div[suit=${data.card.suit}]`)
        
        if(card.length != 0){
            console.log('to tak to')
            $('.up-side').find(`div[suit=${data.card.suit}]`).each(addEvents).css({
                'box-shadow': config.cards_active_css.box_shadow
                                                                                })
        } else {
            console.log('srakto')
            $('.up-side').find('.card').each(addEvents).css({
                'z-index' : 999
                                                        })
        }
        }
    }

   /* startGame = (data) => {

        jqueryDOM.$auctionTable.css('display', 'none')
        jqueryDOM.$atutLabel.append(data['atut'])

        hoverEffect("-10")
        bufor()        
        events()
        
    }*/
    

    init = (statess, $board) => {
  
        states = statess
        jqueryDOM.$board = $board
        console.log("sprawdzamy states")
        console.log(states)
        $('#deck').append(config.hands)
                  .append(config.auctionTabel)

        $('.panel').append(config.auctionTableSelection)
        
        bufor()       
        
        drawAuctionTable()
        sockets()
        setSides()
        
        $('#double-btn').css({
            'backgroundImage'    : config.image_path.buttons_list_src,
            'backgroundPosition' : config.double_btn_css.bg_posiotion_px
        })
        
        $('#redouble-btn').css({
            'backgroundImage'    : config.image_path.buttons_list_src,
            'backgroundPosition' : config.redouble_btn_css.bg_posiotion_px
        })

        $('#pass-btn').css({
            'backgroundImage'    : config.image_path.buttons_list_src,
            'backgroundPosition' : config.pass_btn_css.bg_posiotion_px
        })
       
    }

    return {init : init}

})()