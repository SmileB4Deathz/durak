//MCTS
class MCTSNode{constructor(a,c){this.moves=a;this.parent=c;this.wins=this.visits=0;this.numUnexpandedMoves=a.length;this.children=Array(this.numUnexpandedMoves).fill(null)}}
class MCTS{constructor(a,c,b,d){this.game=a;this.player=c;this.iterations=b;this.exploration=d;void 0==this.iterations&&(this.iterations=500);void 0==this.exploration&&(this.exploration=1.41)}selectMove(){var a=this.game.cloneState(),c=this.game.moves();const b=new MCTSNode(c,null);for(let e=0;e<this.iterations;e++){this.game.setState(a);var d=this.game.cloneState();this.game.setState(d);d=this.selectNode(b);this.game.gameOver()&&this.game.winner()!=this.player&&-1!=this.game.winner()&&(d.parent.wins=
Number.MIN_SAFE_INTEGER);d=this.expandNode(d);this.playout(d);let f;f=this.game.winner()==this.player?1:0;this.backprop(d,f)}c=c[this.getBestChildIndex(b)];this.game.setState(a);console.log(b);a=this.getPv(b);return{move:c,pv:a,stats:{wins:b.wins,visits:b.visits}}}selectNode(a){const c=this.exploration;for(;0==a.numUnexpandedMoves;){var b=-Infinity;let f=-1,g=a.visits;for(let h in a.children){var d=a.children[h],e=d.visits;d=this.game.getPlayerTurn()==this.player?d.wins:-d.wins;e=this.computeUCB(d,
e,c,g);e>b&&(b=e,f=h)}b=this.game.moves();this.game.playMove(b[f]);a=a.children[f];if(this.game.gameOver())break}return a}expandNode(a){if(this.game.gameOver())return a;var c=this.game.moves();const b=this.selectRandomUnexpandedChild(a);void 0==c[b]&&console.log(this.game);this.game.playMove(c[b]);c=this.game.moves();c=new MCTSNode(c,a);a.children[b]=c;--a.numUnexpandedMoves;return c}playout(){for(;!this.game.gameOver();){const a=this.greedyMove();this.game.playMove(a)}return this.game.winner()}backprop(a,
c){for(;null!=a;)a.visits+=1,a.wins+=c,a=a.parent}selectRandomUnexpandedChild(a){const c=Math.floor(Math.random()*a.numUnexpandedMoves);let b=-1;for(let d in a.children)if(null==a.children[d]&&(b+=1),b==c)return d}computeUCB(a,c,b,d){return a/c+b*Math.sqrt(Math.log(d)/c)}getBestChildIndex(a){let c=-Infinity,b=-1;for(let d in a.children){const e=a.children[d];null!=e&&e.wins>c&&(c=e.wins,b=d)}return b}getPv(a){const c=[];for(;0!=a.children.length;){let b=this.getBestChildIndex(a);c.push(a.moves[b]);
a=a.children[b];if(void 0==a)break}return c}lowestRankCard(a){const c=b=>{if(1>=b.length)return b;let d=b[0],e=[],f=[];for(let g=1;g<b.length;g++)b[g].Value<d.Value?e.push(b[g]):f.push(b[g]);return[...c(e),d,...c(f)]};return c(a)[0]}greedyMove(){const a=this.game.moves();return 2>a.length?a[0]:this.getGreedyMove()}getGreedyMove(){this.game.moves();const a=this.game.moves().filter(d=>"object"===typeof d),c=this.game.getTrump(),b=a.filter(d=>d.Type!=c);return 0===b.length?this.lowestRankCard(a):this.lowestRankCard(b)}}
;
//GAME
//------------------------------------------------------------------------------------------------------------------------------------------------

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
        else if (this.state.cardsOnTable.length === 0) {
            moves = this.state.playerCards[this.state.playerTurn];
        }
        //continue attack
        else if (this.state.attackCards.length === 0 || this.state.isTaking) {
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
                    try {
                        let cardType = this.state.playerCards[this.state.playerTurn][i].Type;
                        let cardValue = this.state.playerCards[this.state.playerTurn][i].Value;
                        if ((cardType === this.state.attackCards[0].Type && cardValue > this.state.attackCards[0].Value) || cardType === this.state.trump) {
                            moves.push(this.state.playerCards[this.state.playerTurn][i]);
                        }
                    }
                    catch(e) {console.log(1)}
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
        if (moves.includes(undefined))
            console.log(1);
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
                if (state.deck.length === 0) {
                    if (state.lowerTrump == null) {
                        state.endGame = true;
                        return;
                    }
                    state.deck.push(state.lowerTrump)
                    state.lowerTrump = null;
                }
                //const randomCard = state.deck[Math.floor(Math.random() * state.deck.length)];
                const randomCard = state.deck[0];
                state.playerCards[player].push(randomCard);
                state.deck.shift();
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
