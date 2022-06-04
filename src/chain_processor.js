import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { getMarketDetails, getMarketState } from "./contracts";
import { findSubmission, updateSubmissionDetails } from "./db_manager";
import {
	constants,
	replyToSubmission,
	timeLeftForChallenge,
	flairSubmissionWithOutcomeNo,
	removeSubmissionFlair,
} from "./helpers";
import { BigNumber, ethers } from "ethers";

const web3 = createAlchemyWeb3(process.env.ALCHEMY_WSS_URL);

const eventSignatures = {
	Challenged:
		"0x3acea3967c5be24f16b75421c5e477dd8b549db84bdfe6f359ec3eb9f1749ffb",
	MarketCreated:
		"0xbc2bccc2713ac25dc4bcda6e2a6c18b5c5cd08d9c00fa807a841a510d6c11a79",
	Redeemed:
		"0xa3364817cc6a3d1dfc5e4970c5ff96bbba39cb4182e88c06bad5ca2feffb1dca",
	// TODO set correct value for `OutcomeSet`
	OutcomeSet:
		"0xa3364817cc6a3d1dfc5e4970c5ff96bbba39cb4182e88c06bad5ca2feffb1dcT",
};

const abiCoder = ethers.utils.defaultAbiCoder;

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

	log.info(`[eventProcessor] received event: ${JSON.stringify(logValue)};`);

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
	} else if (eventIdentifier == eventSignatures.OutcomeSet) {
		marketIdentifier = logValue.topics[1];
		groupAddress = logValue.address;
		log.info(
			`[eventProcessor] "OutcomeSet" event received; groupAddress=${groupAddress} marketIdentifier=${marketIdentifier}`
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

	// Update market details in db
	const marketState = await getMarketState(groupAddress, marketIdentifier);
	const marketDetails = await getMarketDetails(
		groupAddress,
		marketIdentifier
	);

	await reflectOnChainUpdatesInDb(marketIdentifier, {
		...marketState,
		...marketDetails,
	});

	const submission = await findSubmission(marketIdentifier);
	if (submission != undefined) {
		if (submission.outcome == "0") {
			// Update the flair on submission to NO
			flairSubmissionWithOutcomeNo(submission.submissionRedditId);
		} else {
			removeSubmissionFlair(submission.submissionRedditId);
		}
	}
}

async function reflectOnChainUpdatesInDb(marketIdentifier, updates) {
	// Status should be changed to removed if `outcome` is 0 and final
	// (i.e.
	// 	(donBufferEndsAt <= currentTime && resolutionBufferEndsAt == 0) ||
	// 	(resolutionBufferEndsAt <= currentTime && resolutionBufferEndsAt != 0)
	// )
	// let currentTime = new Date().toISOString();
	// if (
	// 	// set status to REMOVED if final outcome == 0
	// 	// Note that final outcome is considered declared when
	// 	// (1) Buffer period expires && resolution period didn't
	// 	// even start (2) Resolution period expired (3) Moderator
	// 	// the outcome. In the third case, we intentionally expire
	// 	// resolution period on-chain to indicate the market is
	// 	// resolved. Thus, checking for (2) suffices for (3)
	// 	// as well.
	// 	((updates.donBufferEndsAt <= currentTime &&
	// 		updates.resolutionBufferEndsAt == 0) ||
	// 		(updates.resolutionBufferEndsAt <= currentTime &&
	// 			updates.resolutionBufferEndsAt != 0)) &&
	// 	updates.outcome == "0"
	// ) {
	// 	updates.status = constants.SUBMISSION_STATUS.REMOVED;
	// }
	await updateSubmissionDetails(marketIdentifier, {
		...updates,
	});
}

export function startEventsSubscription() {
	web3.eth.subscribe(
		"logs",
		{
			address: process.env.GROUP,
		},
		eventsProcessor
	);
}
