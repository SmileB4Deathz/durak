const { MCTS } = require("https://raw.githubusercontent.com/SmileB4Deathz/durak/main/MCTSv1.js");
//------------------------------------------------------------------------------------------------------------------------------------------------


class Durak {

    constructor(playerCards, playerTurn, trump, cardsOnTable, attackCard = null) {
        this.state = {
            playerCards: playerCards,
            playerTurn: playerTurn,
            trump: trump,
            cardsOnTable: cardsOnTable,
            attackCard: attackCard,
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

    sameCard(c1, c2) {
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
        else if (this.state.attackCard == null) {
            moves = this.state.playerCards[this.state.playerTurn].filter(card => this.state.cardsOnTable.some(tc => tc.Value === card.Value));
            moves.push("pass");
        }
        //defence
        else if (this.state.attackCard != null) {
            //if attack card is not a trump
            if (this.state.attackCard.Type !== this.state.trump) {
                for (let i = 0; i < this.state.playerCards[this.state.playerTurn].length; i++) {
                    let cardType = this.state.playerCards[this.state.playerTurn][i].Type;
                    let cardValue = this.state.playerCards[this.state.playerTurn][i].Value;
                    if ((cardType === this.state.attackCard.Type && cardValue > this.state.attackCard.Value) || cardType === this.state.trump) {
                        moves.push(this.state.playerCards[this.state.playerTurn][i]);
                    }
                }
            }
            //if attack card is a trump
            else {
                for (let i = 0; i < this.state.playerCards[this.state.playerTurn].length; i++) {
                    let cardType = this.state.playerCards[this.state.playerTurn][i].Type;
                    let cardValue = this.state.playerCards[this.state.playerTurn][i].Value;
                    if (cardType === this.state.attackCard.Type && cardValue > this.state.attackCard.Value)
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
                }
                else
                    this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                this.state.cardsOnTable = [];
                this.state.attackCard = null;
                break;
            case "take":
                this.state.attackCard = null;
                this.state.isTaking = true;
                this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                break;
            default:
                if (this.state.isTaking) {
                    let oppIndex = this.state.playerTurn === 0 ? 1 : 0;
                    if (this.state.cardsOnTable.length >= this.state.playerCards[oppIndex].length) {
                        let oppIndex = this.state.playerTurn === 0 ? 1 : 0;
                        this.state.cardsOnTable.forEach(card => this.state.playerCards[oppIndex].push(card));
                        this.state.isTaking = false;
                        this.state.cardsOnTable = [];
                        this.state.attackCard = null;
                        return;
                    }
                    this.state.cardsOnTable.push(move);
                    this.state.playerCards[this.state.playerTurn] = this.state.playerCards[this.state.playerTurn].filter(card => !this.sameCard(card, move));
                    if (this.state.playerCards[this.state.playerTurn].length === 0)
                        this.state.gameOver = true;
                    return;
                }

                this.state.cardsOnTable.push(move);
                this.state.playerCards[this.state.playerTurn] = this.state.playerCards[this.state.playerTurn].filter(card => !this.sameCard(card, move));
                this.state.attackCard = (this.state.attackCard == null) ? move : null;

                if (this.state.playerCards[this.state.playerTurn].length === 0) {
                    this.state.winner = this.state.playerTurn;
                    this.state.gameOver = true;
                    return;
                }
                //console.log(this.state.gameOver);
                this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                break;
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

