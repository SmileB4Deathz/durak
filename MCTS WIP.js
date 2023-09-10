//MCTS



class MCTSNode {
    constructor(moves, parent) {
        this.moves = moves
        this.parent = parent
        this.visits = 0
        this.wins = 0
        this.numUnexpandedMoves = moves.length
        this.children = new Array(this.numUnexpandedMoves).fill(null) //temporary store move for debugging purposes
    }
}


class MCTS {
    constructor(game, player, iterations, exploration) {
        this.game = game
        this.player = player
        this.iterations = iterations
        this.exploration = exploration

        if (this.iterations == undefined) {
            this.iterations = 500
        }
        if (this.exploration == undefined) {
            this.exploration = 1.41
        }
    }

    selectMove() {
        const originalState = this.game.cloneState()
        const possibleMoves = this.game.moves()
        const root = new MCTSNode(possibleMoves, null)

        for (let i = 0; i < this.iterations; i++) {
            this.game.setState(originalState)
            const clonedState = this.game.cloneState()
            this.game.setState(clonedState)

            let selectedNode = this.selectNode(root)

            //if selected node is terminal and we lost, make sure we never choose that move
            if (this.game.gameOver()) {
                if (this.game.winner() != this.player && this.game.winner() != -1) {
                    selectedNode.parent.wins = Number.MIN_SAFE_INTEGER
                }
            }

            let expandedNode = this.expandNode(selectedNode)
            this.playout(expandedNode)

            let reward;
            if (this.game.winner() == this.player) { reward = 1 }
            else { reward = 0 }
            this.backprop(expandedNode, reward)
        }

        //choose move with most wins
        let bestMove = possibleMoves[this.getBestChildIndex(root)];

        this.game.setState(originalState)
        console.log(root);
        const pv = this.getPv(root);
        return { move: bestMove, pv: pv, stats: { wins: root.wins, visits: root.visits } };
    }
    selectNode(root) {

        const c = this.exploration

        while (root.numUnexpandedMoves == 0) {
            let maxUBC = -Infinity
            let maxIndex = -1
            let Ni = root.visits
            for (let i in root.children) {
                const child = root.children[i]
                const ni = child.visits
                const wi = (this.game.getPlayerTurn() == this.player) ? child.wins : -(child.wins)
                //const wi = child.wins;
                const ubc = this.computeUCB(wi, ni, c, Ni)
                if (ubc > maxUBC) {
                    maxUBC = ubc
                    maxIndex = i
                }
            }
            const moves = this.game.moves()
            this.game.playMove(moves[maxIndex])


            root = root.children[maxIndex]
            if (this.game.gameOver()) {
                return root
            }
        }
        return root
    }

    expandNode(node) {
        if (this.game.gameOver()) {
            return node
        }
        let moves = this.game.moves()
        const childIndex = this.selectRandomUnexpandedChild(node)
        this.game.playMove(moves[childIndex])

        moves = this.game.moves()
        const newNode = new MCTSNode(moves, node)
        node.children[childIndex] = newNode
        node.numUnexpandedMoves -= 1

        return newNode
    }

    playout() {
        while (!this.game.gameOver()) {
            //const moves = this.game.moves()
            //const randomChoice = Math.floor(Math.random() * moves.length)
            const greedy = this.greedyMove();
            this.game.playMove(greedy);
        }
        return this.game.winner()
    }
    backprop(node, reward) {
        while (node != null) {
            node.visits += 1
            node.wins += reward
            node = node.parent
        }
    }

    // returns index of a random unexpanded child of node
    selectRandomUnexpandedChild(node) {
        const choice = Math.floor(Math.random() * node.numUnexpandedMoves) //expand random nth unexpanded node
        let count = -1
        for (let i in node.children) {
            const child = node.children[i]
            if (child == null) {
                count += 1
            }
            if (count == choice) {
                return i
            }
        }
    }

    computeUCB(wi, ni, c, Ni) {
        return (wi / ni) + c * Math.sqrt(Math.log(Ni) / ni)
    }

    getBestChildIndex(node) {
        let maxWins = -Infinity
        let maxIndex = -1
        for (let i in node.children) {
            const child = node.children[i]
            if (child == null) { continue }
            if (child.wins > maxWins) {
                maxWins = child.wins
                maxIndex = i
            }
        }
        return maxIndex;
    }

    getPv(root) {
        const pv = [];
        while (root.children.length != 0) {
            let maxIndex = this.getBestChildIndex(root);
            pv.push(root.moves[maxIndex]);
            root = root.children[maxIndex];
            if (root == undefined) {
                break;
            }
        }
        return pv;
    }

    lowestRankCard(cards) {
        const quickSort = (arr) => {
            if (arr.length <= 1) {
                return arr;
            }

            let pivot = arr[0];
            let leftArr = [];
            let rightArr = [];

            for (let i = 1; i < arr.length; i++) {
                if (arr[i].Value < pivot.Value) {
                    leftArr.push(arr[i]);
                } else {
                    rightArr.push(arr[i]);
                }
            }

            return [...quickSort(leftArr), pivot, ...quickSort(rightArr)];
        };

        return quickSort(cards)[0];
    }

    greedyMove() {
        const moves = this.game.moves();
        if (moves.length === 1)
            return moves[0];

        const cards = moves.filter(card => (typeof card === "object"));
        const trump = this.game.getTrump();
        const noTrumpCards = cards.filter(card => card.Type != trump);
        if (noTrumpCards.length === 0) {
            if (!this.game.endGame() && moves.includes("pass"))
                return moves[moves.length - 1];
            return this.lowestRankCard(cards);
        }
        return this.lowestRankCard(noTrumpCards);
    }
}
//GAME
//------------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------------------

class Durak {

    constructor(playerCards, playerTurn, trump, cardsOnTable, attackCards = [], deck = [], lowerTrump = null) {
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

    endGame() {return this.state.endGame;} 

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
            return ["Game Over"];
        //first attack
        else if (this.state.cardsOnTable.length === 0) {
            moves = this.state.playerCards[this.state.playerTurn];
        }
        //continue attack
        else if (this.state.attackCards.length === 0 || this.state.isTaking) {
            if (this.state.isTaking) {
                let oppIndex = this.state.playerTurn === 0 ? 1 : 0;
                if (this.state.attackCards.length === this.state.playerCards[oppIndex].length)
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
                //this.state.attackCards = [];
                this.state.isTaking = true;
                this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                break;
            default:
                if (this.state.isTaking) {
                    this.state.cardsOnTable.push(move);
                    this.state.attackCards.push(move);
                    this.state.playerCards[this.state.playerTurn] = this.state.playerCards[this.state.playerTurn].filter(card => !Durak.sameCard(card, move));
                    if (this.state.playerCards[this.state.playerTurn].length === 0 && this.state.endGame)
                        this.state.gameOver = true;
                    return;
                }

                this.state.cardsOnTable.push(move);
                this.state.playerCards[this.state.playerTurn] = this.state.playerCards[this.state.playerTurn].filter(card => !Durak.sameCard(card, move));
                if (this.state.playerCards[this.state.playerTurn].length === 0 && this.state.deck.length === 0) {
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
