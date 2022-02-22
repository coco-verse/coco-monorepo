import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { addresses, getMarketDetails, getMarketState } from "./contracts";
import { updateSubmissionDetails } from "./db_manager";

const web3 = createAlchemyWeb3(process.env.ALCHEMY_WSS_URL);

// TODO fix this mess
const eventSignatures = {
	Challenged:
		"0x3acea3967c5be24f16b75421c5e477dd8b549db84bdfe6f359ec3eb9f1749ffb",
	MarketCreated:
		"0xbc2bccc2713ac25dc4bcda6e2a6c18b5c5cd08d9c00fa807a841a510d6c11a79",
};

export async function eventsProcessor(error, logValue) {
	if (error != undefined) {
		log.error(`[eventsProcessor] log errored with ${error}`);
		return;
	}

	const eventIdentifier = logValue.topics[0];
	if (eventIdentifier == undefined) {
		log.error(
			`[eventProcessor] Event received with missing event identifier`
		);
		return;
	}

	let marketIdentifier;
	let groupAddress;
	if (eventIdentifier == eventSignatures.Challenged) {
		marketIdentifier = logValue.topics[1];
		groupAddress = logValue.address;
		log.info(
			`[eventProcessor] "Challenged" event received; groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}`
		);
	} else if (eventIdentifier == eventSignatures.MarketCreated) {
		marketIdentifier = logValue.topics[1];
		groupAddress = logValue.address;
		log.info(
			`[eventProcessor] "MarketCreated" event received; groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}`
		);
	} else {
		log.info(
			`[eventProcessor] "UnknownEvent" event received; logValue=${JSON.stringify(
				logValue
			)}`
		);
		return;
	}

	// TODO
	// 1. Send creator a message that their post has received a challenge with outcome [OUTCOME]
	// 2. If outcome is NO then add it to removal list
	// 3. If outcome is YES then remove it from removal list (if present) + reinstate the post if already removed

	// get market details
	const marketState = await getMarketState(groupAddress, marketIdentifier);

	const marketDetails = await getMarketDetails(
		groupAddress,
		marketIdentifier
	);

	const res = await updateSubmissionDetails(marketIdentifier, {
		...marketState,
		...marketDetails,
	});
	console.log("submission details updated ", res);

	// check for other event identifiers
}

export function startEventsSubscription() {
	web3.eth.subscribe(
		"logs",
		{
			address: addresses.Group,
		},
		eventsProcessor
	);
}
