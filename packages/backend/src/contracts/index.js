import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { ethers, BigNumber } from "ethers";

export const web3Provider = new ethers.providers.JsonRpcProvider(
	process.env.ALCHEMY_URL
);

// abis
const groupContractAbi = [
	"function marketStates(bytes32 marketIdentifier) view returns (uint64, uint64, uint64, uint64)",
	"function marketDetails(bytes32 marketIdentifier) view returns (address, uint64, uint8)",

	"event MarketCreated(bytes32 indexed marketIdentifier, address creator, address challenger)",
	"event Challenged(bytes32 indexed marketIdentifier, address by, uint amount, uint8 outcome)",
	"event Redeemed(bytes32 indexed marketIdentifier, address by)",
	"event OutcomeSet(bytes32 indexed marketIdentifier)",
	"event ConfigUpdated()",
];

export function getGroupContractInstance(groupAddress = process.env.GROUP) {
	return new ethers.Contract(groupAddress, groupContractAbi, web3Provider);
}

export async function getMarketState(groupAddress, marketIdentifier) {
	try {
		const groupContract = await getGroupContractInstance(groupAddress);
		const marketStateArr = await groupContract.marketStates(
			marketIdentifier
		);

		return {
			donBufferEndsAt: new Date(
				Number(marketStateArr[0].toString()) * 1000
			),
			resolutionBufferEndsAt: new Date(
				Number(marketStateArr[1].toString()) * 1000
			),
			donBuffer: marketStateArr[2].toString(),
			resolutionBuffer: marketStateArr[3].toString(),
		};
	} catch (e) {
		log.error(
			`[getMarketState] groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}; fetch market state failed with error=${e}`
		);
	}
}

export async function getMarketDetails(groupAddress, marketIdentifier) {
	try {
		const groupContract = await getGroupContractInstance(groupAddress);
		const marketDetailsArr = await groupContract.marketDetails(
			marketIdentifier
		);
		return {
			cToken: marketDetailsArr[0],
			fee: ethers.utils.formatUnits(marketDetailsArr[1], 18),
			outcome: marketDetailsArr[2].toString(),
		};
	} catch (e) {
		log.error(
			`[getMarketDetails] groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}; fetch market details failed with error=${e}`
		);
	}
}
