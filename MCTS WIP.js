var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}};$jscomp.arrayIterator=function(a){return{next:$jscomp.arrayIteratorImpl(a)}};$jscomp.makeIterator=function(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];if(b)return b.call(a);if("number"==typeof a.length)return $jscomp.arrayIterator(a);throw Error(String(a)+" is not an iterable or ArrayLike");};
$jscomp.arrayFromIterator=function(a){for(var b,c=[];!(b=a.next()).done;)c.push(b.value);return c};$jscomp.arrayFromIterable=function(a){return a instanceof Array?a:$jscomp.arrayFromIterator($jscomp.makeIterator(a))};
var MCTSNode=function(a,b){this.moves=a;this.parent=b;this.wins=this.visits=0;this.numUnexpandedMoves=a.length;this.children=Array(this.numUnexpandedMoves).fill(null)},MCTS=function(a,b,c,d){this.game=a;this.player=b;this.iterations=c;this.exploration=d;void 0==this.iterations&&(this.iterations=500);void 0==this.exploration&&(this.exploration=1.41)};
MCTS.prototype.selectMove=function(){console.time();for(var a=this.game.cloneState(),b=this.game.moves(),c=new MCTSNode(b,null),d=0;d<this.iterations;d++){this.game.setState(a);var e=this.game.cloneState();this.game.setState(e);e=this.selectNode(c);this.game.gameOver()&&this.game.winner()!=this.player&&-1!=this.game.winner()&&(e.parent.wins=Number.MIN_SAFE_INTEGER);e=this.expandNode(e);this.playout(e);var g=this.game.winner()==this.player?1:0;this.backprop(e,g)}b=b[this.getBestChildIndex(c)];this.game.setState(a);
console.log(c);a=this.getPv(c);console.timeEnd();return{move:b,pv:a,stats:{wins:c.wins,visits:c.visits}}};MCTS.prototype.selectNode=function(a){for(var b=this.exploration;0==a.numUnexpandedMoves;){var c=-Infinity,d=-1,e=a.visits,g;for(g in a.children){var f=a.children[g],h=f.visits;f=this.game.getPlayerTurn()==this.player?f.wins:-f.wins;h=this.computeUCB(f,h,b,e);h>c&&(c=h,d=g)}c=this.game.moves();this.game.playMove(c[d]);a=a.children[d];if(this.game.gameOver())break}return a};
MCTS.prototype.expandNode=function(a){if(this.game.gameOver())return a;var b=this.game.moves(),c=this.selectRandomUnexpandedChild(a);void 0==b[c]&&console.log(this.game);this.game.playMove(b[c]);b=this.game.moves();b=new MCTSNode(b,a);a.children[c]=b;--a.numUnexpandedMoves;return b};MCTS.prototype.playout=function(){for(;!this.game.gameOver();){var a=this.greedyMove(this.game);this.game.playMove(a)}return this.game.winner()};
MCTS.prototype.backprop=function(a,b){for(;null!=a;)a.visits+=1,a.wins+=b,a=a.parent};MCTS.prototype.selectRandomUnexpandedChild=function(a){var b=Math.floor(Math.random()*a.numUnexpandedMoves),c=-1,d;for(d in a.children)if(null==a.children[d]&&(c+=1),c==b)return d};MCTS.prototype.computeUCB=function(a,b,c,d){return a/b+c*Math.sqrt(Math.log(d)/b)};MCTS.prototype.getBestChildIndex=function(a){var b=-Infinity,c=-1,d;for(d in a.children){var e=a.children[d];null!=e&&e.wins>b&&(b=e.wins,c=d)}return c};
MCTS.prototype.getPv=function(a){for(var b=[];0!=a.children.length;){var c=this.getBestChildIndex(a);b.push(a.moves[c]);a=a.children[c];if(void 0==a)break}return b};MCTS.prototype.lowestRankCard=function(a){var b=function(c){if(1>=c.length)return c;for(var d=c[0],e=[],g=[],f=1;f<c.length;f++)c[f].Value<d.Value?e.push(c[f]):g.push(c[f]);return[].concat($jscomp.arrayFromIterable(b(e)),[d],$jscomp.arrayFromIterable(b(g)))};return b(a)[0]};
MCTS.prototype.greedyMove=function(){var a=this.game.moves();return 1===a.length?a[0]:this.getGreedyMove()};MCTS.prototype.getGreedyMove=function(){var a=this.game.moves().filter(function(d){return"object"===typeof d}),b=this.game.getTrump(),c=a.filter(function(d){return d.Type!=b});return 0===c.length?this.lowestRankCard(a):this.lowestRankCard(c)};

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
        switch (move) {
            case "pass":
                if (this.state.isTaking) {
                    let oppIndex = this.state.playerTurn === 0 ? 1 : 0;
                    this.state.cardsOnTable.forEach(card => this.state.playerCards[oppIndex].push(card));
                    this.state.isTaking = false;
                    this.takeCards(this.state.playerTurn);
                }
                else {
                    this.takeCards(this.state.playerTurn);
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

    takeCards(first) {
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
                //const randomCard = state.deck[Math.floor(Math.random() * state.deck.length)];
                const randomCard = state.deck[0];
                state.playerCards[player].push(randomCard);
                state.deck.shift();
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
