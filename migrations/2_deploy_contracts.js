var BattleShip = artifacts.require("./BattleShip.sol");

module.exports = function(deployer, network, accounts) {
  // deployer.deploy(StringLib);
  // deployer.link(StringLib, BattleShip);
  deployer.deploy(BattleShip);
  console.log(network);
  console.log(accounts);
};
