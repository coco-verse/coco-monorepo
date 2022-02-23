import Web3 from "web3";

const web3 = new Web3("https://rinkeby.arbitrum.io/rpc");

export function convertHoursToBlocks(chainId, hours) {
	if (chainId == 421611) {
		return Math.ceil((3600 * hours) / 15);
	}
	return 0;
}

export function convertBlocksToHours(chainId, blocks) {
	if (chainId == 421611) {
		return (blocks * 15) / 3600;
	}
	return 0;
}

export function getFunctionSignature(functionStr) {
	return web3.eth.abi.encodeFunctionSignature(functionStr);
}

export function isValidAddress(address) {
	return web3.utils.isAddress(address);
}
