import Web3 from 'web3';

const web3 = new Web3('https://rinkeby.arbitrum.io/rpc');

export function getFunctionSignature(functionStr) {
  return web3.eth.abi.encodeFunctionSignature(functionStr);
}
