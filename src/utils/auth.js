import Web3 from "web3";

const web3 = new Web3();
var hotPvKey;
var keySignature;

export function createHotAccount() {
	const acc = web3.eth.accounts.create();

	return acc;
}

export function toCheckSumAddress(address) {
	return web3.utils.toChecksumAddress(address);
}

export function signMessage(pk, msg) {
	const signature = web3.eth.accounts.sign(msg, pk);
	return signature;
}

export function keccak256(msg) {
	return web3.utils.keccak256(msg);
}

export function generateRequestSignatures(msg) {
	if (hotPvKey == undefined) {
		hotPvKey = localStorage.getItem("hotPvKey");
	}
	if (keySignature == undefined) {
		keySignature = localStorage.getItem("keySignature");
	}

	if (hotPvKey == undefined || keySignature == undefined) {
		return;
	}

	const { signature } = signMessage(hotPvKey, JSON.stringify(msg));

	return {
		keySignature,
		msgSignature: signature,
	};
}
