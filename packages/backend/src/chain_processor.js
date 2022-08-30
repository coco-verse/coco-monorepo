import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import {
	getGroupContractInstance,
	getMarketDetails,
	getMarketState,
} from "./contracts";
import { findSubmission, updateSubmissionDetails } from "./db_manager";
import { flairSubmissionWithOutcomeNo, removeSubmissionFlair } from "./helpers";
import { ethers } from "ethers";

async function reflectOnChainUpdatesInDb(groupAddress, marketIdentifier) {
	if (
		!ethers.utils.isAddress(groupAddress) ||
		!ethers.utils.isHexString(marketIdentifier)
	) {
		log.error(
			`[reflectOnChainUpdatesInDb] received either invalid groupAddress:${groupAddress} or marketIdentifier:${JSON.stringify(
				marketIdentifier
			)}`
		);
		return;
	}
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

	log.info(
		`[reflectOnChainUpdatesInDb] received on-chain update for marketIdentifier:${marketIdentifier} from groupAddress:${groupAddress}`
	);

	// Update market details in db
	const marketState = await getMarketState(groupAddress, marketIdentifier);
	const marketDetails = await getMarketDetails(
		groupAddress,
		marketIdentifier
	);

	await updateSubmissionDetails(marketIdentifier, {
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

export function subscribeGroupEvents(groupAddress) {
	const groupContract = getGroupContractInstance(groupAddress);
	groupContract.on(
		"MarketCreated",
		(marketIdentifier, creator, challenger, event) => {
			reflectOnChainUpdatesInDb(groupAddress, marketIdentifier);
		}
	);
	groupContract.on(
		"Challenged",
		(marketIdentifier, by, amount, outcome, event) => {
			reflectOnChainUpdatesInDb(groupAddress, marketIdentifier);
		}
	);
	groupContract.on("Redeemed", (marketIdentifier, by, event) => {
		reflectOnChainUpdatesInDb(groupAddress, marketIdentifier);
	});
	groupContract.on("OutcomeSet", (marketIdentifier, event) => {
		reflectOnChainUpdatesInDb(groupAddress, marketIdentifier);
	});
}

export function startEventsSubscription() {
	subscribeGroupEvents(process.env.GROUP);
}
