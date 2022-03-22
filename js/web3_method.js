const mainnetIP = "http://108.136.46.103:5006";
const testnetIP = "http://54.169.135.228:5006";
const xrunContractAddress = "0x965e7662f2267348e30dD9B408AD4b469CFE1596";
async function createWeb3(address = "http://127.0.0.1:5006") {
  const web3 = new Web3(new Web3.providers.HttpProvider(address));
  return web3.eth.net
    .isListening()
    .then(data => web3)
    .catch(error => Promise.reject("web3 connection error Log : " + error));
}
