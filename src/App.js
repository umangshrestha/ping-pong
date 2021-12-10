import React from 'react';
import Box, { BACKGROUND, PLAYER, BALL } from './components/box.jsx';




/* size */
const ROW_SIZE = 10
const COL_SIZE = 20

/* BOARD */
const PLAYER_BOARD_SIZE = 3
const BOARD_EDGE_SPACE = 1;

/* buttons */
const PLAYER_UP   = 38  // up arrow
const PLAYER_DOWN = 40  // down arrow
const PAUSE       = 32  // space
 
const inner = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "justify", 
}

const outer = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "justify", 
    marginTop: "9em",
    marginLeft: "25em",
    Text: "100px",
    padding: "10px"
}


const score = {
    marginLeft: "100px",
    fontSize: "50px",
    color: "white"
}

const style = {
    width: "250px",
    heigth: "250px",
    display: "grid",
    gridTemplate: `repeat(${ROW_SIZE}, 1fr) / repeat(${COL_SIZE}, 1fr)`
}


const InitialState = () => {
    const board = [...Array(PLAYER_BOARD_SIZE)].map((_, pos) => pos);
    return {
        /* board */
        player: board.map(x => (x  * COL_SIZE) + BOARD_EDGE_SPACE),
        opponent: board.map(x => ((x+1) * COL_SIZE)-(BOARD_EDGE_SPACE+1)),
        ball: Math.round((ROW_SIZE * COL_SIZE)/2)+ ROW_SIZE,
        /* ball */
        ballSpeed: 100,
        direction: -COL_SIZE,
        delta: -1, // -1 means the ball is moving towards player 1 means towars opponent
        pause: true,
        /* for dumb Ai */
        opponentSpeed: 150,
        opponentDir: false,
        /* Score */
        playerScore: 0,
        opponentScore: 0,
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = InitialState();
    }

    resetGame = () => this.setState({
       ball: Math.round((ROW_SIZE * COL_SIZE)/2)+ ROW_SIZE,
    })

    moveBoard = (playerBoard, isUp) => {
        const playerEdge = isUp? playerBoard[0]: playerBoard[PLAYER_BOARD_SIZE-1];

        if (!this.touchingEdge(playerEdge)) {
            const delta = COL_SIZE * (isUp ? -1 : 1);
            /* if ball touches the edge */
            const newDir = (this.state.direction !== COL_SIZE ^ isUp) ? -this.state.direction: this.state.direction;
            
            if (!this.touchingEdge(this.state.ball)) {
                switch (this.state.ball) {
                    case playerEdge + delta -1:
                        this.setState({
                            direction: newDir,
                            delta: -1,
                        })
                        break;
                    case playerEdge:
                        this.setState({
                            direction: newDir,
                        })
                        break;
                    case playerEdge + delta + 1:
                        this.setState({
                            direction: newDir,
                            delta: 1,
                        })
                        break;
                }
            }
            return playerBoard.map(x=> x + delta);
        }      
        return false
    }
    
    componentDidMount() {
        /* moving the ball */
        setInterval(() => {
            if (!this.state.pause){
                this.bounceBall();
            }
        }, this.state.ballSpeed);
        /* moving the opponent */
        setInterval(() => {
            if (!this.state.pause){
               this.moveOpponent();
            }
        }, this.state.opponentSpeed);
        
        document.onkeydown = this.keyInput;
        document.title = "ping-pong"
    }
    
    touchingEdge = (pos) => (0 <= pos && pos < COL_SIZE) || (COL_SIZE*(ROW_SIZE-1) <= pos && pos < COL_SIZE * ROW_SIZE) 

    touchingBoard = (pos) => {
        return (this.state.player.indexOf(pos) !== -1) || 
            (this.state.opponent.indexOf(pos) !== -1) ||
            this.state[(this.state.delta === -1) ? "player":"opponent"].indexOf(pos+this.state.delta) !== -1;
    }

    isOver = (pos) => (this.state.delta === -1 && pos % COL_SIZE === 0) || (this.state.delta === 1 && (pos+1) % COL_SIZE === 0)

    moveOpponent = () => {
        const movedPlayer = this.moveBoard(this.state.opponent, this.state.opponentDir); 
        movedPlayer ? this.setState({opponent: movedPlayer}): 
            this.setState({opponentDir: !this.state.opponentDir});
    }

    bounceBall = () => {
        const newState = this.state.ball + this.state.direction+this.state.delta;
        if (this.touchingEdge(newState)) {
            this.setState({direction: -this.state.direction})
        } 

        if (this.touchingBoard(newState)) {
            this.setState({delta: -this.state.delta}) 
        } 
        
        /* updating board */
        this.setState({ball: newState})

        /* checking if loss or won */
        if (this.isOver(newState)) {
            if (this.state.delta !== -1) {
                /* player won */ 
                this.setState({
                    playerScore: this.state.playerScore+1,
                    ball: newState,
                })
            } else {
                /* opponent won */ 
                this.setState({
                    opponentScore: this.state.opponentScore+1,
                    ball: newState,
                })
            }
            this.setState({pause: true})
            this.resetGame();
        }
    } 

    keyInput = ({keyCode}) => {
        if (this.state.pause) {
            if (keyCode === PAUSE) {
                this.setState({pause: false});
            } 
            return;
        }
        
        switch (keyCode) {
        case PLAYER_UP:
        case PLAYER_DOWN:
            const movedPlayer = this.moveBoard(this.state.player, keyCode===PLAYER_UP); 
            if (movedPlayer) {
                this.setState({player: movedPlayer})
            }
            break;
        case PAUSE:
            this.setState({pause: true})
            break;
        default:
        }
    }

    render() {
        const board = [...Array(ROW_SIZE * COL_SIZE)].map((_, pos) => {
            let val = BACKGROUND;
            if ((this.state.player.indexOf(pos) !== -1) || (this.state.opponent.indexOf(pos) !== -1)) {
                val = PLAYER;
            } else if (this.state.ball === pos) {
                val = BALL;
            }
            return <Box key={pos} k={pos} name={val} />;
        })

        return (
        <div style={outer}>
            <h1> {"[space]"} {!this.state.pause? "PLAY/pause": "play/PAUSE"} </h1>
            <div style={inner}>
                <div style={style}>{board}</div>
                <div style={score}>{this.state.playerScore} {this.state.opponentScore}</div>
            </div>
            <h3> {"press UP and DOWN to move"} </h3>

        </div>
        )
    }
}


export default App;