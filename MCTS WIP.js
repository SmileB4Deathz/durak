
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
        return {move: bestMove, pv: pv, stats: {wins: root.wins, visits: root.visits}};
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
            const moves = this.game.moves()
            const randomChoice = Math.floor(Math.random() * moves.length)
            this.game.playMove(moves[randomChoice])
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

    getBestChildIndex(node){
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
            if (root == undefined){
                break;
            }
        }
        return pv;
    }

    greedyMove(game){
        function Move(moves){
            if (moves.length === 1)
                return moves[1];
            return getGreedyMove(game)
        }

        function getGreedyMove(game){
            const cards = game.moves().filter(card => (card => typeof card === "object"));
            const trump = game.getTrump();
            const noTrumpCards = cards.filter(card => card.Type != trump);
            if (noTrumpCards.length === 0)
                return 
        }

        return Move(game.moves());
    }

    sortByRank(cards){
        
    }
}

module.exports = { MCTS }