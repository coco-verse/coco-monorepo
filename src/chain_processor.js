import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { addresses, getMarketDetails, getMarketState } from "./contracts";

const web3 = createAlchemyWeb3(process.env.ALCHEMY_WSS_URL);

const eventSignatures = {
	Challenged:
		"0x3acea3967c5be24f16b75421c5e477dd8b549db84bdfe6f359ec3eb9f1749ffb",
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

	if (eventIdentifier == eventSignatures.Challenged) {
		const marketIdentifier = logValue.topics[1];
		const groupAddress = logValue.address;
		log.info(
			`[eventProcessor] "Challenged" event received; groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}`
		);
		// get market details
		const marketState = await getMarketState(
			groupAddress,
			marketIdentifier
		);

		const marketDetails = await getMarketDetails(
			groupAddress,
			marketIdentifier
		);
	}

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
