class Game {
  constructor($state,$timeout,Battleship,Alert){
    this.Battleship = Battleship;
    this.Alert = Alert;
    this.$state = $state;
    this.$timeout = $timeout;
    this.gameId = this.$state.params.id;
    this.laying = {};
    this.setup();
    this.columns = ["A","B","C","D","E","F","G","H","I","J"];
    this.Battleship.watch('MadeMove', async (err, result) => {
      if(this.loaded){
        if(result.args.currentPlayer == this.Battleship.data.account){
          await [this.getGameData(),this.getBoard(),this.getOtherBoard()];
        }else{
          await [this.getGameData(),this.getBoard(),this.getOtherBoard(),this.Alert.add("Move has been placed")];
        }
      }
    });
    this.Battleship.watch('StateChanged', async (err, result) => {
      if(this.loaded) {
        await this.getGameData();
        try{
          await this.getOtherBoard();
        }catch(e){
          console.log(e);
        }
      }
    });
    this.Battleship.watch('HitBattleShip', async (err, result) => {
      if(this.loaded){
        if(result.args.currentPlayer == this.Battleship.data.account){
          this.Alert.add(`You got a hit at ${this.columns[result.args.x]}${parseInt(result.args.y) + 1}! You hit a Battleship with length ${result.args.pieceHit.toNumber()}`);
        }else{
          this.Alert.add(`Your ship got hit at ${this.columns[result.args.x]}${parseInt(result.args.y) + 1}!`);
        }
      }
    });
    this.Battleship.watch('GameEnded', async (err, result) => {
      if(result.args.winner == this.Battleship.data.account){
        this.Alert.add(`You're the winner :D`);
      }else{
        this.Alert.add(`You're the loser :D`);
      }
    });
    this.Battleship.watch('WinningsWithdrawn', async (err, result) => {
      if(this.loaded) await this.getGameData();
    });
  }
  get myTurn(){
    return this.data && (this.Battleship.data.account == this.data.currentPlayer);
  }
  async setup(){
    await this.getGameData();
    await this.getBattleshipDimensions();
    await this.getBoard();
    try{
      await this.getOtherBoard();
    }catch(e){
      console.log(e);
    }
    this.$timeout(() => this.loaded = true);
  }
  numberOfShipsPlaced(board){
    if(!board) return 0;
    let ships = board.reduce((c1,row) => {
      return row.reduce((c2,ele) => {
        if(ele >= this.minBoatLength 
          && ele <= this.maxBoatLength 
          && !c2.includes(ele)
        ) c2.push(ele);
        return c2;
      },c1);
    },[]);
    return ships.length;
  }
  get currentState(){
    if(this.data){
      console.log(this.data.gameState.toNumber());
      return this.Battleship.states[this.data.gameState.toNumber()];
    }
  }
  async getGameData(){
    let data = await this.Battleship.call('games',[this.gameId]);
    console.log(data);
    if(data.player1 == "0x0000000000000000000000000000000000000000")
      this.$state.go("home");
    this.$timeout(() => this.data = data);
  }
  async getBattleshipDimensions(){
    let [minBoatLength, maxBoatLength] =  [await this.Battleship.call('minBoatLength'),await this.Battleship.call('maxBoatLength')];
    this.$timeout(() => {
      this.minBoatLength = minBoatLength.toNumber();
      this.maxBoatLength = maxBoatLength.toNumber();
    });
  }
  async getBoard(){
    let board = await this.Battleship.call('showBoard',[this.gameId]);
    board = board.map((row) => row.map((ele) => ele.toNumber()));
    var boardTranspose = board[0].map((col, i) => {
      return board.map((row) => row[i])
    });
    this.$timeout(() => this.board = boardTranspose);
  }
  async getOtherBoard(){
    let board = await this.Battleship.call('showOtherPlayerBoard',[this.gameId]);
    board = board.map((row) => row.map((ele) => ele.toNumber()));
    var boardTranspose = board[0].map((col, i) => {
      return board.map((row) => row[i])
    });
    this.$timeout(() => {
      this.otherBoard = boardTranspose;
      this.canWin = this.ableToWin();
      if(this.canWin) this.Alert.add("You can win! Press the win button to tell the world!");
    });
  }
  async startGame(){
    try{
      await this.Battleship.transaction('finishPlacing',[this.gameId]);
      await this.getGameData();
    }catch(e){
      this.Alert.add("Other player is still setting up their board");
    }
  }
  ableToWin(){
    if(this.maxBoatLength && this.minBoatLength && this.otherBoard){
      let requiredToWin = 0;
      let nextSum = this.minBoatLength;
      while(nextSum <= this.maxBoatLength){
        requiredToWin += nextSum;
        nextSum += 1;
      }
      let numberHit = this.otherBoard.reduce((c1, row) => {
        return row.reduce((c2,ele) => {
          if(ele < 0) c2 += 1;
          return c2;
        },c1);
      },0);
      return numberHit >= requiredToWin;
    };
    return false;
  }
  async winTheGame(){
    let tx = await this.Battleship.transaction('sayWon',[this.gameId]);
  }
  async withdrawWinnings(){
    if(!this.withdrawing){
      this.withdrawing = true;
      let tx = await this.Battleship.transaction('withdraw',[this.gameId]);
    }
  }
  async makeMove(x,y){
    if(this.Battleship.data.account != this.data.currentPlayer){
      this.Alert.add("it's not your turn, buddy");
      return;
    }
    if(!this.moving){
      this.moving = true;
      this.x = x;
      this.y = y;
      try{
        let tx = await this.Battleship.transaction('makeMove',[this.gameId,x,y]);
        console.log(tx);
      }catch(e){
        this.Alert.add("Move has not been placed");
      }
      this.moving = false;
    }
  }
  async layPiece(x,y){
    if(this.board[y][x] > 0) return;
    if(this.placing) return;
    this.placing = true;
    try{
      if(this.laying.x == x && this.laying.y == y){
        this.laying.x = null;
        this.laying.y = null;
        this.placed = false;
      }else if(this.placed){
        let startX = Math.min(this.laying.x,x);
        let startY = Math.min(this.laying.y,y);
        let endX = Math.max(this.laying.x,x);
        let endY = Math.max(this.laying.y,y);
        await this.Battleship.transaction('placeShip',[this.gameId,startX,endX,startY,endY]);
        await this.getBoard();
        this.placed = false;
        this.laying.x = null;
        this.laying.y = null;
      }else{
        this.laying.x = x;
        this.laying.y = y;
        this.placed = true;
      }
    }catch(e){
      console.log(e);
      let length = 1 + Math.max(Math.abs(this.laying.x - x),Math.abs(this.laying.y - y));
      this.Alert.add(`Have you already laid a length ${length} boat?`);
    }
    this.placing = false;
  }

}

Game.$inject = ['$state','$timeout','Battleship','Alert'];

let templateUrl = require('ngtemplate-loader!html-loader!./game.html');

export default {
  templateUrl: templateUrl,
  controller: Game,
  controllerAs: '$ctrl'
}
