class Home {
  constructor($state,Battleship,Alert){
    this.Battleship = Battleship;
    this.$state = $state;
    this.Alert = Alert;
  }
  async newGame(){
    try{
      if(!this.Battleship.name) throw "You have to set your name first";  
      let value = prompt("How many ETH are you putting into the pot?");
  		value = parseInt(value);
      if(isNaN(value)) throw "Please enter a number!";
      if(value <= 0) throw "Please enter a number greater than zero!";
      let eth = this.Battleship.weiToEth(value);
  		let result = await this.Battleship.transaction('newGame',[true],{value: eth});
    }catch(e){
      this.Alert.add(e)
    }
  }
  async setName() {
    let name = prompt("What's your new name? (Max 32 characters)");
    if(!name) return;
    name = name.substring(0,32);
    try{
      let result = await this.Battleship.transaction('setName',[name]);
      this.Battleship.name = name;
    }catch(e){
      this.Alert.add("That name has already been taken by another player");
    }
  }
  async joinGame(game){
    let amountToBet = game.pot.toNumber() / 2;
    let value = confirm(`Do you want to join this game for ${this.Battleship.weiToEth(amountToBet)} ETH?`);
    if(!value) return;
    try{
      if(!this.Battleship.name) throw "Make sure your name is set to join a game";
      let result = await this.Battleship.transaction('joinGame',[game.id],{value: amountToBet});
    }catch(e){
      this.Alert.add(e);
    }
  }
  async playGame(game){
    this.$state.go('game',{id: game.id});
  }

  get myGames(){
    return this.Battleship.data.games.filter((e) => e.player1 == this.Battleship.data.account);
  }

  get joinedGames(){
    return this.Battleship.data.games.filter((e) => e.player2 == this.Battleship.data.account);
  }

  get otherGames(){
    return this.Battleship.data.games.filter((e) => e.player1 != this.Battleship.data.account && e.player2 != this.Battleship.data.account);
  }
}

Home.$inject = ['$state','Battleship','Alert'];

let templateUrl = require('ngtemplate-loader!html-loader!./home.html');

export default {
  templateUrl: templateUrl,
  controller: Home,
  controllerAs: '$ctrl'
}
