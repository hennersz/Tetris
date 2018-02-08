export default class Piece {
  constructor(template, drawBlock){
    this.designs = template.designs;
    this.rotation = 0;
    this.colour = template.colour;
    this.x = 3;
    this.y = template.startHeight;
    this.drawBlock = drawBlock;
    this.lastDrop = performance.now();
    this.stopped = false;
  }

  eachBlock(cb){

  }

  occupied(x, y, board){
    //check if square is on board and not occupied already
    const mx = board.width;
    const my = board.height;
    return(x<0 || x >= mx || y >= my || y<0 || board.squares[y][x].occupied);
  }

  legalMove(x, y,rotation, board){
    const design = this.designs[rotation];
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        if(design[i][j] && this.occupied(x+j, y+i, board))
          return false;
      }
    }
    return true;
  }
  
  move(action, board){
    let x = this.x;
    let y = this.y;

    if(action === 'L')
      x = x - 1;
    else if(action === 'R')
      x = x + 1;
    else if(action === 'D')
      y = y + 1;

    if(this.legalMove(x, y,this.rotation, board)){
      this.x = x;
      this.y = y;
      return true; //piece was moved
    }
    return false; //piece wasn't moved
  }

  drop(gameState){
    if(!this.move('D', gameState.board)){
      this.stopped = true;
    }
  }

  rotate(board){
    let nextRotation = (this.rotation + 1) % 4;
    if(this.legalMove(this.x, this.y, nextRotation, board))
      this.rotation = nextRotation;
  }

  handleAction(action, gameState){
    switch(action){
      case 'L':
      case 'R': this.move(action, gameState.board); break;
      case 'D': this.drop(gameState); break;
      case 'U': this.rotate(gameState.board); break;
      default:break;
    }
  }

  update(gameState, time){
    const action = gameState.actions.shift();
    this.handleAction(action, gameState);
    if(time-this.lastDrop>1000){
      this.drop(gameState);
      this.lastDrop = time;
    } 
    this.render();
  }

  render(){
    const{
      x,y,colour
    } = this;
    const design = this.designs[this.rotation]; 
    for(let i = 0; i < 4; i++){
      for(let j = 0; j < 4; j++){
        if(design[i][j] && y+i>=0){
          this.drawBlock(x+j, y+i, colour); 
        } 
      }
    }
  }
}


