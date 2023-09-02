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
            const greedy = this.greedyMove(this.game);
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

    greedyMove(game) {
        const moves = game.moves();
        if (moves.length === 1)
            return moves[0];
        return this.getGreedyMove(game)
    }

    getGreedyMove(game) {
        const cards = game.moves().filter(card => (typeof card === "object"));
        const trump = game.getTrump();
        const noTrumpCards = cards.filter(card => card.Type != trump);
        if (noTrumpCards.length === 0)
            return this.lowestRankCard(cards);
        return this.lowestRankCard(noTrumpCards);
    }
}
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

    getTrump() {return this.state.trump}

    cloneState() {
        return structuredClone(this.state);
        /*return {
            playerCards: ,
            playerTurn: this.state.playerTurn,
            trump: this.state.trump,
            attackCard: this.state.attackCard,
            cardsOnTable: this.state.cardsOnTable,
            winner: this.state.winner,
            gameOver: this.state.gameOver
        }*/
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
                    if (this.state.playerCards[this.state.playerTurn][i] == undefined) {
                        console.log("WTF");
                    }
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
                this.state.cardsOnTable = [];
                this.state.attackCard = null;
                if (this.state.isTaking)
                    this.state.isTaking = false;
                else
                    this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                break;
            case "take":
                this.state.cardsOnTable.forEach(card => this.state.playerCards[this.state.playerTurn].push(card));
                this.state.attackCard = null;
                this.state.isTaking = true;
                this.state.playerTurn = (this.state.playerTurn === 0) ? 1 : 0;
                break;
            default:
                if (this.state.isTaking) {
                    let oppIndex = this.state.playerTurn === 0 ? 1 : 0;
                    this.state.playerCards[oppIndex].push(move);
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
