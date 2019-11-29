// Import libraries we need.
import 'web3';
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import battleshipDef from '../../../build/contracts/Battleship.json'

var Battleship = contract(battleshipDef);

// give it web3 powers!
Battleship.setProvider(web3.currentProvider);

class BattleshipService {

	constructor($q,$timeout) {
		this.$timeout = $timeout

		this.loaded = $q.defer();

		this.data = {
			games: []
		};

		web3.eth.getAccounts((err,accs) => {
			if (err != null) {
				alert("There was an error fetching your accounts.");
				return;
			}

			if (accs.length == 0) {
				alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
				return;
			}

			this.accounts = accs;
			angular.extend(this.data,{account: this.accounts[0]});
			this.loaded.resolve();
			this.setUpWatch();
		});

		this.states = ['Created', 'SettingUp', 'Playing', 'Finished'];
	}

	weiToEth(wei){
		return parseInt(wei*Math.pow(10,18));
	}

	ethToWei(eth){
		return parseInt(eth/Math.pow(10,18));
	}
	
	async transaction(method,args=[],vars={value: 0}) {
		await this.loaded.promise;
		let instance = await Battleship.deployed();
		angular.extend(vars,{from: this.data.account, gas: 2000000});
		return await instance[method](...args,vars);
	}

	async call(attribute,args=[],vars={}) {
		await this.loaded.promise;
		let instance = await Battleship.deployed();
		angular.extend(vars,{from: this.data.account});
		console.log(attribute,...args,vars);
		let result = await instance[attribute].call(...args,vars);
		if(attribute == 'games') result = this.structToObject(result);

		return result;
	}

	async watch(Name,cb) {
		await this.loaded.promise;
		let instance = await Battleship.deployed();
		instance[Name]({},{toBlock: 'pending'})
		.watch(cb);
	}

	async setUpWatch() {
		await this.loaded.promise;
		let instance = await Battleship.deployed();

		instance
		.PlayerSetName({},{fromBlock: 0, toBlock: 'pending'})
		.watch(async (err, result) => {
			let name = await instance.playerNames.call(this.data.account);
			this.$timeout(() => this.name = name);
		});

		instance
		.GameInitialized({},{fromBlock: 0, toBlock: 'pending'})
		.watch(async (err, result) => {
			let game = await instance.games.call(result.args.gameId);
			game = this.structToObject(game);
			game.id = result.args.gameId;
			this.$timeout(() => {
				this.data.games = this.data.games.filter((_game) => _game.id != game.id);
				this.data.games.push(game);
				console.log(this.data.games);
			});
		});

		instance
		.GameJoined({},{fromBlock: 0, toBlock: 'pending'})
		.watch(async (err, result) => {
			let game = await instance.games.call(result.args.gameId);
			game = this.structToObject(game);
			game.id = result.args.gameId;
			this.$timeout(() => {
				this.data.games = this.data.games.filter((_game) => _game.id != game.id);
				this.data.games.push(game);
			});
		});
	}

	structToObject(game){
		let result = [
			"player1",
			"player2",
			"player1Name",
			"player2Name",
			"currentPlayer",
			"winner",
			"gameState",
			"pot",
			"availablePot"
		].reduce((c,key,index) => {
			c[key] = game[index];
			return c;
		},{});
		return result;
	}
}

BattleshipService.$inject = ['$q','$timeout'];

export default BattleshipService;