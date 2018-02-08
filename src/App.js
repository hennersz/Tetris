import React, { Component } from 'react';
import './App.css';
import Piece from './pieces.js';
import pieces from './consts.js';

class App extends Component {
  constructor(){
    super();
    this.gameState = {
      squareSize: 20,
      board:{
        height: 23,
        width: 10,
        squares: []
      },
      context: null,
      actions: [],
      currentPiece: null,
      nextPiece: null
    };

    this.state = {
      screen: {
        width: this.gameState.squareSize * (this.gameState.board.width+2) + 120,
        height: this.gameState.squareSize * this.gameState.board.height + 20,
        ratio: window.devicePixelRatio || 1,
      },
      gameStarted: false,
      paused: true,
      score: 0
    };
  }

  handleKeyPress(event) {
    const k = event.key
    switch(k){
      case 'ArrowDown': 
      case 's': this.gameState.actions.push('D'); break;
      case 'ArrowLeft':
      case 'a': this.gameState.actions.push('L'); break;
      case 'ArrowRight':
      case 'd': this.gameState.actions.push('R'); break;
      case 'ArrowUp':
      case 'w': this.gameState.actions.push('U'); break;
      default: break;
    } 
  }

  handleResize(){
    this.setState({
      screen : {
        width: this.gameState.squareSize * (this.gameState.board.width+2) + 120,
        height: this.gameState.squareSize * this.gameState.board.height + 20,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  resetGame(){
    this.initBoard();
    this.gameState.currentPiece = this.getRandomPiece();
    this.gameState.nextPiece = this.getRandomPiece();
    this.gameState.actions = [];
    this.setState({gameStarted: false, paused: true, score: 0});
  }

  startGame(){
    this.resetGame();
    this.setState({gameStarted: true, paused: false});
  }

  pauseGame(){
    this.setState({paused: true});
  }

  resumeGame(){
    this.setState({paused: false})
  }

  componentDidMount() {
    const context = this.refs.canvas.getContext('2d');
    this.gameState.context = context;
    this.initBoard();

    window.addEventListener('keydown', this.handleKeyPress.bind(this));
    window.addEventListener('resize',  this.handleResize.bind(this));
    requestAnimationFrame((time)=>{this.update(time)});
  }

  initBoard(){
    const {
      height,
      width,
      squares
    } = this.gameState.board;

    for(let i = 0; i < height; i++){
      squares.push([]);
      for(let j = 0; j < width; j++){
        squares[i][j] = {occupied: false, colour: ''};
      }
    }
  }

  drawBoard(){
    const ctx = this.gameState.context;
    ctx.save();
    const {
      height, width
    } = this.gameState.board;
    const { squareSize } = this.gameState;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width*squareSize, height*squareSize);
    let i;
    ctx.strokeStyle = '#949499';
    for(i = 0; i <= width; i++){
      ctx.beginPath();
      ctx.moveTo(i*squareSize, 0);
      ctx.lineTo(i*squareSize, height*squareSize);
      ctx.stroke();
    }

    for(i = 0; i <= height; i++){
      ctx.beginPath();
      ctx.moveTo(0, i*squareSize);
      ctx.lineTo(width*squareSize, i*squareSize);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBlock(x, y, colour){
    const ctx = this.gameState.context;
    ctx.save();
    ctx.fillStyle = colour;
    ctx.strokeStyle = '#3B3A3D';
    const { squareSize } = this.gameState;

    ctx.fillRect((x)*squareSize,(y)*squareSize,squareSize, squareSize);
    ctx.strokeRect((x)*squareSize,(y)*squareSize,squareSize, squareSize);
    ctx.restore();
  }

  drawNext(){
    const ctx = this.gameState.context;
    const piece = this.gameState.nextPiece;
    const size = this.gameState.squareSize * 6;

    ctx.save();
    const boardWidth = this.gameState.board.width * this.gameState.squareSize;
    ctx.translate(boardWidth + this.gameState.squareSize, 20);
    ctx.fillStyle = 'white';
    ctx.rect(0, 0, size, size);
    ctx.fill();
    ctx.stroke();
    ctx.translate(-2*this.gameState.squareSize, 2*this.gameState.squareSize);
    piece.render();
    ctx.restore();
  }

  drawBlocks(){
    const {
      height, width, squares
    } = this.gameState.board;

    for(let i = 0; i < height; i++){
      for(let j = 0; j < width; j++){
        if(squares[i][j].occupied)
          this.drawBlock(j, i, squares[i][j].colour);
      }
    }
  }

  addBlockToBoard(x, y, colour){
    this.gameState.board.squares[y][x] = {occupied: true, colour};
  }

  settlePiece (){
    const piece = this.gameState.currentPiece;
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        if(piece.designs[piece.rotation][i][j]){
          this.addBlockToBoard(piece.x+j, piece.y + i, piece.colour);
        } 
      }
    }
  }

  rowFull(rowNum){
    const {
      width,
      squares 
    } = this.gameState.board;
    for(let i = 0; i < width; i++){
      if(!squares[rowNum][i].occupied)
        return false; 
    }
    return true;
  }

  clearRow(rowNum){
    const {
      width,
      squares 
    } = this.gameState.board;
    for(let row = rowNum; row >= 0; row--){
      for(let col = 0; col < width; col++){
        if(row === 0){
          squares[row][col] = {occupied: false, colour:''};
        } else {
          squares[row][col] = squares[row-1][col];
        }
      }
    }
  }

  clearRows(){
    const {
      height
    } = this.gameState.board;
    let score = 0;
    for(let row = height - 1; row >= 0; row--){
      while(this.rowFull(row)){
        this.clearRow(row);
        if(score === 0)
          score = 100;
        else
          score = score*2; 
      }
    } 
    this.setState((prevState)=>{
      return {score: prevState.score + score};
    });
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  getRandomPiece(){
    const n = this.getRandomInt(0, pieces.length);
    return new Piece(pieces[n], this.drawBlock.bind(this));
  }

  handleStop(){
    this.settlePiece(); 
    this.gameState.currentPiece = this.gameState.nextPiece;
    this.gameState.nextPiece = this.getRandomPiece();
    this.clearRows();
  }

  topRowOccupied(){
    const {
      width,
      squares
    } = this.gameState.board;

    for(let i = 0; i < width; i++){
      if(squares[0][i].occupied)
        return true;
    }
    return false;
  }

  gameOver(){
    const ctx = this.gameState.context;
    
    ctx.save();
    ctx.font = '34px serif';
    ctx.fillText('Game Over', 10, 50);
    ctx.restore();
    this.gameState.currentPiece = null;
    this.setState({gameStarted: false});
  }

  update(time) {
    const ctx = this.gameState.context;
    const piece = this.gameState.currentPiece;
    
    ctx.save();
    ctx.scale(this.state.screen.ratio, this.state.screen.ratio);
    ctx.translate(10, 10);

    this.drawBoard();
    this.drawBlocks();

    if(this.state.gameStarted){
      this.drawNext();
      if(this.state.paused){
        piece.render();
      } else {
        piece.update(this.gameState, time);
        if(piece.stopped)
          this.handleStop();
      }
    }


    if(this.topRowOccupied()) 
      this.gameOver();
    ctx.restore();
    requestAnimationFrame((time)=>{this.update(time)});
  }

  render() {
    const {
      width,
      height,
      ratio
    } = this.state.screen;
    const {
      score,
      gameStarted,
      paused
    } = this.state;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h1>Tetris</h1>
        <canvas
          ref="canvas"
          style={{height: `${height}px`, width: `${width}px`}}
          width={width*ratio}
          height={height*ratio}
        />
        <div style={{display: 'flex', alignItems: 'center'}}>
          {
            gameStarted?
              <div>
                {paused?
                  <button onClick={this.resumeGame.bind(this)}>Resume</button>:
                  <button onClick={this.pauseGame.bind(this)}>Pause</button>
                }
                <button onClick={this.resetGame.bind(this)}>Reset</button>
              </div>:
              <div>
                <button onClick={this.startGame.bind(this)}>Start</button>
              </div>
          }
        </div>
        <div style={{width: '100%', textAlign: 'center'}}>
          <b>Score: </b>{score}
        </div>
        <div style={{textAlign: 'center'}}>
          Controls: <br/>
            W/Up Arrow: Rotate piece <br/>
            A/Left Arrow: Move piece left<br/>
            S/Down Arrow: Drop piece one square<br/>
            D/Right Arrow: Move piece right<br/>
        </div>
      </div>
    );
  }
}

export default App;
