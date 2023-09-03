//------------------------------------------------------------------------------------------------------------------------------------------------

class Durak {

    constructor(playerCards, playerTurn, trump, cardsOnTable, attackCards = [], lowerTrump = null, deck = []) {
        this.state = {
            playerCards: playerCards,
            playerTurn: playerTurn,
            trump: trump,
            cardsOnTable: cardsOnTable,
            attackCards: attackCards,
            deck: deck,
            lowerTrump: lowerTrump,
            endGame: false,
            winner: -1,
            gameOver: false,
            isTaking: false
        }
    }

    getState() { return this.state }

    setState(state) { this.state = state }

    getPlayerTurn() { return this.state.playerTurn }

    getTrump() { return this.state.trump }

    cloneState() {
        return structuredClone(this.state);
    }

    static sameCard(c1, c2) {
        if (c1 == undefined || c2 == undefined){
            console.log(this.state)
        }
        if (c1.Value === c2.Value && c1.Type === c2.Type) {
            return true;
        }
        return false;
    }

    moves() {
        let moves = [];
        if (this.state.gameOver)
            return moves;
        //first attack
        if (this.state.cardsOnTable.length === 0) {
            moves = this.state.playerCards[this.state.playerTurn];
        }
        //continue attack
        else if (this.state.attackCards.length === 0) {
            if (this.state.isTaking) {
                let oppIndex = this.state.playerTurn === 0 ? 1 : 0;
                if (this.state.cardsOnTable.length >= this.state.playerCards[oppIndex].length)
                    return (["pass"]);
            }
            moves = this.state.playerCards[this.state.playerTurn].filter(card => this.state.cardsOnTable.some(tc => tc.Value === card.Value));
            moves.push("pass");
        }
        //defence
        else if (this.state.attackCards.length !== 0) {
            //if attack card is not a trump
            if (this.state.attackCards[0].Type !== this.state.trump) {
                for (let i = 0; i < this.state.playerCards[this.state.playerTurn].length; i++) {
                    let cardType = this.state.playerCards[this.state.playerTurn][i].Type;
                    let cardValue = this.state.playerCards[this.state.playerTurn][i].Value;
                    if ((cardType === this.state.attackCards[0].Type && cardValue > this.state.attackCards[0].Value) || cardType === this.state.trump) {
                        moves.push(this.state.playerCards[this.state.playerTurn][i]);
                    }
                }
            }
            //if attack card is a trump
            else {
                for (let i = 0; i < this.state.playerCards[this.state.playerTurn].length; i++) {
                    let cardType = this.state.playerCards[this.state.playerTurn][i].Type;
                    let cardValue = this.state.playerCards[this.state.playerTurn][i].Value;
                    if (cardType === this.state.attackCards[0].Type && cardValue > this.state.attackCards[0].Value)
                        moves.push(this.state.playerCards[this.state.playerTurn][i]);
                }
            }
            moves.push("take");
        }
        return moves;
    }

    playMove(move) {
        if (!move)
            console.log(1)
        switch (move) {
            case "pass":
                if (this.state.isTaking) {
                    let oppIndex = this.state.playerTurn === 0 ? 1 : 0;
                    this.state.cardsOnTable.forEach(card => this.state.playerCards[oppIndex].push(card));
                    this.state.isTaking = false;
                    this.#takeCards(this.state.playerTurn);
                }
                else {
                    this.#takeCards(this.state.playerTurn);
                    this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                }
                this.state.cardsOnTable = [];
                this.state.attackCards = [];
                break;
            case "take":
                this.state.attackCards = [];
                this.state.isTaking = true;
                this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                break;
            default:
                if (this.state.isTaking) {
                    this.state.cardsOnTable.push(move);
                    this.state.playerCards[this.state.playerTurn] = this.state.playerCards[this.state.playerTurn].filter(card => !Durak.sameCard(card, move));
                    if (this.state.playerCards[this.state.playerTurn].length === 0 && this.state.endGame)
                        this.state.gameOver = true;
                    return;
                }

                this.state.cardsOnTable.push(move);
                this.state.playerCards[this.state.playerTurn] = this.state.playerCards[this.state.playerTurn].filter(card => !Durak.sameCard(card, move));
                if (this.state.playerCards[this.state.playerTurn].length === 0 && this.state.endGame) {
                    this.state.winner = this.state.playerTurn;
                    this.state.gameOver = true;
                    return;
                }

                //multiple attack cards on the table
                if (this.state.attackCards.length === 0) {
                    this.state.attackCards.push(move);
                    this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                    return;
                }
                else if (this.state.attackCards.length === 1) {
                    this.state.attackCards.shift();
                    this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                    return;
                }
                this.state.attackCards.shift();
                break;
        }
    }

    #takeCards(first) {
        if (!first) {
            if (this.state.playerCards[0].length < 6)
                take(0, this.state);
            if (this.state.playerCards[1].length < 6)
                take(1, this.state);
            return;
        }

        if (this.state.playerCards[1].length < 6)
            take(1, this.state);
        if (this.state.playerCards[0].length < 6)
            take(0, this.state);

        function take(player, state) {
            if (state.endGame)
                return;
            const nrCardsToTake = 6 - state.playerCards[player].length;
            for (let i = 0; i < nrCardsToTake; i++) {
                const randomCard = state.deck[Math.floor(Math.random() * state.deck.length)];
                if (randomCard == undefined)
                console.log(1)
                state.playerCards[player].push(randomCard);
                state.deck = state.deck.filter(card => !Durak.sameCard(card, randomCard));
                if (state.deck.length === 0) {
                    if (state.lowerTrump == null){
                        state.endGame = true;
                        return;
                    }
                    state.deck.push(state.lowerTrump)
                    state.lowerTrump = null;                   
                }
            }
        }
    }

    gameOver() {
        return this.state.gameOver;
    }
    winner() { return this.state.winner }
}



class Card {
    constructor(Value, Type) {
        this.Value = Value;
        this.Type = Type;
    }

    getValue() {
        return this.Value;
    }

    getType() {
        return this.Type;
    }
}

module.exports = {Durak, Card};

const { Durak, Card } = require("./durak.js");
const { MCTS } = require("./MCTSv1.js");


let six0 = new Card(6, 0);
let six1 = new Card(6, 1);
let six2 = new Card(6, 2);
let six3 = new Card(6, 3);
let seven0 = new Card(7, 0);
let seven1 = new Card(7, 1);
let seven2 = new Card(7, 2);
let seven3 = new Card(7, 3);
let eight0 = new Card(8, 0);
let eight1 = new Card(8, 1);
let eight2 = new Card(8, 2);
let eight3 = new Card(8, 3);
let nine0 = new Card(9, 0);
let nine1 = new Card(9, 1);
let nine2 = new Card(9, 2);
let nine3 = new Card(9, 3);
let ten0 = new Card(10, 0);
let ten1 = new Card(10, 1);
let ten2 = new Card(10, 2);
let ten3 = new Card(10, 3);
let valet0 = new Card(11, 0);
let valet1 = new Card(11, 1);
let valet2 = new Card(11, 2);
let valet3 = new Card(11, 3);
let dama0 = new Card(12, 0);
let dama1 = new Card(12, 1);
let dama2 = new Card(12, 2);
let dama3 = new Card(12, 3);
let king0 = new Card(13, 0);
let king1 = new Card(13, 1);
let king2 = new Card(13, 2);
let king3 = new Card(13, 3);
let ace0 = new Card(14, 0);
let ace1 = new Card(14, 1);
let ace2 = new Card(14, 2);
let ace3 = new Card(14, 3);


console.log("Game loaded");




/*let obj = {
    "playerCards": [
        [
            {
                "Value": 6,
                "Type": 0
            },
            {
                "Value": 13,
                "Type": 1
            },
            {
                "Value": 8,
                "Type": 3
            },
            {
                "Value": 12,
                "Type": 3
            },
            {
                "Value": 8,
                "Type": 2
            },
            {
                "Value": 9,
                "Type": 2
            },
            {
                "Value": 12,
                "Type": 2
            },
            {
                "Value": 13,
                "Type": 2
            }
        ],
        [
            {
                "Value": 9,
                "Type": 0
            },
            {
                "Value": 6,
                "Type": 2
            },
            {
                "Value": 14,
                "Type": 2
            },
            {
                "Value": 13,
                "Type": 3
            }
        ]
    ],
    "playerTurn": 0,
    "trump": 2,
    "cardsOnTable": [],
    "attackCards": null,
    "winner": -1,
    "gameOver": false,
    "isTaking": false
}*/

let p1Cards = [six1, seven0];
let p2Cards = [seven1, six2];
let lowerTrump = {Value: 14, Type: 0}
deck = [six3, seven0, king1];
//playerCards, playerTurn, trump, cardsOnTable, attackCards = [], lowerTrump = null, deck = []
let durak = new Durak([p1Cards, p2Cards], 0, 0, [], [], lowerTrump, deck);
//let durak = new Durak();
//durak.setState(obj);
/*const cards = durak.moves().filter(card => (typeof card === "object"));
console.log(cards);*/


//console.log(durak.moves());
//durak.playMove(six3);



/*function getPossibleGames(){
    const games = [];
    const originalState = durak.cloneState();
    for (let move of durak.moves()){
        durak.playMove(move);
        let game = new Durak();
        game.setState(durak.cloneState());
        games.push(game);
        durak.setState(originalState);
    }
    return games;
    
}

const games = getPossibleGames();
console.log(games);*/
let bot = new MCTS(durak, 0, 10000, undefined);
let result = bot.selectMove();

console.log("Win chance: " + (result.stats.wins * 100) / result.stats.visits + "%");
console.log(result.move);
console.log(pvToSting(result.pv).toString());


function pvToSting(pv) {
    const valueMap = new Map([
        [11, "J"],
        [12, "Q"],
        [13, "K"],
        [14, "A"]
    ]);
    const typeMap = new Map([
        [0, "❤️"],
        [1, "🔸"],
        [2, "♣"],
        [3, "♠"]
    ]);
    const stringPv = [];
    for (let move of pv) {
        if (typeof move === "object") {
            let v = valueMap.get(move.Value) ? valueMap.get(move.Value) : move.Value;
            let t = typeMap.get(move.Type);
            stringPv.push(v + t)
        }
        else
            stringPv.push(move);
    }
    return stringPv.toString();
}

console.log("Breakpoint");
//6🔸,take,pass,6♠,take,pass,7❤️,take,pass,A❤️
