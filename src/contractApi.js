import Web3 from "web3";
import betContractBuild from "contracts/bet.json";
import matchesContractBuild from "contracts/matches.json";

let provider = window.ethereum;

const web3 = new Web3(provider);

let matchesContract;
let betContract;
let matchesContractAddress;
let betContractAddress;

export const init = async () => {
  console.log("HERE")
  const networkId = await web3.eth.net.getId();
  matchesContractAddress = matchesContractBuild.networks[networkId].address;
  betContractAddress = betContractBuild.networks[networkId].address;

  matchesContract = new web3.eth.Contract(
    matchesContractBuild.abi,
    matchesContractAddress
  );

  betContract = new web3.eth.Contract(betContractBuild.abi, betContractAddress);
};

export const getMatchIds = async () => {
  if (typeof matchesContract === "undefined") await init();
  return matchesContract.methods.getMatchIds().call();
};

export const getMatch = async (_matchId) => {
  if (typeof matchesContract === "undefined") await init();
  return matchesContract.methods.getMatch(_matchId).call();
};

export const getResults = async (_matchId) => {
  if (typeof matchesContract === "undefined") await init();
  return matchesContract.methods.getResults(_matchId).call();
};

export const placeBet = async (
  _matchId,
  amount,
  prediction,
  account,
  timestamp
) => {
  if (typeof betContract === "undefined") await init();
  amount = Web3.utils.toWei(amount.toString(), "ether");
  return betContract.methods
    .betOnMatch(_matchId, amount, prediction, timestamp)
    .send({ from: account, gas: 3000000, value: amount });
};

export const checkBet = async (_matchId, account) => {
  if (typeof betContract === "undefined") await init();
  return betContract.methods.alreadyBet(_matchId, account).call();
};

export const availResults = async (_matchId, account) => {
  //  const idk = await web3.eth.sendTransaction({
  //   from: betContractBuild.networks[5777].address,
  //   to: account,
  //   gas: 3000000,
  //   value: web3.utils.toWei("0.0004", "ether"),
  // });
  // console.log(idk);
  if (typeof betContract === "undefined") await init();
  console.log(betContract);
  console.log(betContract.methods.availPrice(_matchId));
  return betContract.methods.availPrice(_matchId).send({ from:account,gas:3000000});
};
