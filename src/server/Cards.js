export class Cards{
        constructor(){
            this.deck = [],
            this.hands = [],
            this.createDeck(),
            this.shuffleCards()
        }

        createDeck() {
            let values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                suit = ["D", "H", "C", "S"] //["diamond", "heart", "club", "spade "]
            for(var i = 0; i < suit.length; i++){
              for(var j = 0; j < values.length; j++){
                this.deck.push({"Value":values[j], "Suit": suit[i]})
              }
            }
            console.log(this.deck.length)
        }

        shuffleCards() {
            let deck = this.deck;

            while(deck.length > 0){
                let index, card, hand =[]; 
                for( var i = 0; i < 13; i++){    
                    index = Math.floor(Math.random() * deck.length)
                    card = deck[index]
                    hand.push(card)
                    deck.splice(index, 1)
                }
            hand.sort((a, b) => {
                var values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                    suit = ['S', 'H', 'C', 'D']
            
                function getValue(c){
                    return values.indexOf(c)
                }
                function getSuit(c){
                    return suit.indexOf(c)
                }
            
                if(a.Suit === b.Suit){
                    return getValue(a.Value) - getValue(b.Value)
                } 
                return  (getSuit(a.Suit) - getSuit(b.Suit))
            }) 
            this.hands.push({hand})    
            }
            console.log(this.hands[0])
        }
    }