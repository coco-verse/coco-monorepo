import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { addresses, getMarketDetails, getMarketState } from "./contracts";
import { findSubmission, updateSubmissionDetails } from "./db_manager";
import { replyToSubmission, timeLeftForChallenge } from "./helpers";

const web3 = createAlchemyWeb3(process.env.ALCHEMY_WSS_URL);

// TODO fix this mess
const eventSignatures = {
	Challenged:
		"0x3acea3967c5be24f16b75421c5e477dd8b549db84bdfe6f359ec3eb9f1749ffb",
	MarketCreated:
		"0xbc2bccc2713ac25dc4bcda6e2a6c18b5c5cd08d9c00fa807a841a510d6c11a79",
	Redeemed:
		"0xa3364817cc6a3d1dfc5e4970c5ff96bbba39cb4182e88c06bad5ca2feffb1dca",
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
	} else if (eventIdentifier == eventSignatures.Redeemed) {
		marketIdentifier = logValue.topics[1];
		groupAddress = logValue.address;
		log.info(
			`[eventProcessor] "Redeemed" event received; groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}`
		);
	} else {
		// TODO Updating submission state in mongo when
		// final outcome is declared using setOutcome
		// by the moderator is missing. Implement it.

		log.info(
			`[eventProcessor] "UnknownEvent" event received; logValue=${JSON.stringify(
				logValue
			)}`
		);
		return;
	}

	// get market details form chain
	// AND update themm in db
	const marketState = await getMarketState(groupAddress, marketIdentifier);
	const marketDetails = await getMarketDetails(
		groupAddress,
		marketIdentifier
	);
	await updateSubmissionDetails(marketIdentifier, {
		...marketState,
		...marketDetails,
	});

	// Reply to submission for update.
	// Note - update replies are only sent for
	// MarketCreated AND Challenged.
	if (
		eventIdentifier == eventSignatures.MarketCreated ||
		eventIdentifier == eventSignatures.Challenged
	) {
		console.log(
			"Time left to challenge ",
			timeLeftForChallenge(marketState.donBufferEndsAt)
		);
		let replyText = `Challenge Update: Temporary Outcome=${
			marketDetails.outcome == "0" ? "NO" : "YES"
		}; Time left to challenge:${timeLeftForChallenge(
			marketState.donBufferEndsAt
		)}`;

		// get submission id
		let submission = await findSubmission(marketIdentifier);
		if (submission == undefined) {
			log.info([
				`[eventsProcessor] unable to find submission with submissionIdentifier=${marketIdentifier}`,
			]);
		}
		await replyToSubmission(submission.submissionRedditId, replyText);
	}
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
