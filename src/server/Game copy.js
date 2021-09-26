//Losujemy gracza który zaczyna licyta
let old_sequence_arr = ["N", "E", "S", "W"],
    cardSymbol = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"],
    declaration = [
        {
            declared_value  : "double",
            is_declared     : false
        },
        {
            declared_value  : "redouble",
            is_declared     : false
        },
        {
            declared_value  : "pass",
            //is_declared     : false
        },
        {
            declared_value  : "1C",
            is_declared     : false,
            force_int       : 1
        }, {
            declared_value  : "1D",
            is_declared     : false,
            force_int       : 8
        }, {
            declared_value  : "1H",
            is_declared     : false,
            force_int       : 15
        }, {
            declared_value  : "1S",
            is_declared     : false,
            force_int       : 22
        }, {
            declared_value  : "2C",
            is_declared     : false,
            force_int       : 2
        }, {
            declared_value  : "2D",
            is_declared     : false,
            force_int       : 9
        }, {
            declared_value  : "2H",
            is_declared     : false,
            force_int       : 16
        }, {
            declared_value  : "2S",
            is_declared     : false,
            force_int       : 23
        }, {
            declared_value  : "3C",
            is_declared     : false,
            force_int       : 3
        }, {
            declared_value  : "3D",
            is_declared     : false,
            force_int       : 10
        }, {
            declared_value  : "3H",
            is_declared     : false,
            force_int       : 17
        }, {
            declared_value  : "3S",
            is_declared     : false,
            force_int       : 24
        }, {
            declared_value  : "4C",
            is_declared     : false,
            force_int       : 4
        },{
            declared_value  : "4D",
            is_declared     : false,
            force_int       : 11
        }, {
            declared_value  : "4H",
            is_declared     : false,
            force_int       : 18
        }, {
            declared_value  : "4S",
            is_declared     : false,
            force_int       : 25
        }, {
            declared_value  : "5C",
            is_declared     : false,
            force_int       : 5
        }, {
            declared_value  : "5D",
            is_declared     : false,
            force_int       : 12
        }, {
            declared_value  : "5H",
            is_declared     : false,
            force_int       : 19
        }, {
            declared_value  : "5S",
            is_declared     : false,
            force_int       : 26
        }, {
            declared_value  : "6C",
            is_declared     : false,
            force_int       : 6
        }, {
            declared_value  : "6D",
            is_declared     : false,
            force_int       : 13
        }, {
            declared_value  : "6H",
            is_declared     : false,
            force_int       : 20
        }, {
            declared_value  : "6S",
            is_declared     : false,
            force_int       : 27
        }, {
            declared_value  : "7C",
            is_declared     : false,
            force_int       : 7
        }, {
            declared_value  : "7D",
            is_declared     : false,
            force_int       : 14
        }, {
            declared_value  : "7H",
            is_declared     : false,
            force_int       : 21
        }, {
            declared_value  : "7S",
            is_declared     : false,
            force_int       : 28
        }

    ];

class Game {
    constructor(){
        this.atut           = "",
        this.pass_count     = 0,
        this.turnPlayer     = "",
        this.secPlayerAvailable = {
            is_available : false,
            symbol       : "",
            index        : "",
            symbol_first_player  : ""
        },
        this.NS_team        = {
                                declared_atut  : "",
                                Nplayer        : [],
                                Splayer        : []
                            },
        this.WE_team        = {
                                declared_atut  : "",
                                Wplayer        : [],
                                Eplayer        : []
                            },
        this.states         = {
                                declaration    : declaration,
                                moves_count    : '',
                                team_first_player_bool : true, 
                                const_side     : '',
                                new_queue      : true,
                                color_selected : ""
                            }
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



}



export { 
    Game,
    declaration, 
    cardSymbol
}