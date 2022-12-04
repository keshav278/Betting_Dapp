let Bet = artifacts.require("bet");
let Matches = artifacts.require("matches");

module.exports = function (deployer) {
  deployer.deploy(Bet);
  deployer.deploy(Matches);
};
