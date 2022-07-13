import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { ethers } from "ethers";
import outdent from "outdent";
import { reddit } from "./reddit";
import moment from "moment";

export function keccackHash(value) {
	return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value));
}

export const constants = {
	SUBMISSION_STATUS: {
		UNINITIALIZED: "UNINITIALIZED",
		INITIALIZED: "INITIALIZED",
		// DUMPED - posts that were dumped because their creator did not put in the initial challenge
		DUMPED: "DUMPED",
		// REMOVED - posts that were challenged and results in final outcome 0
		// REMOVED: "REMOVED",
	},
};

/**
 * This would not work since bot account
 * isn't old enough + has really low karma
 */
export async function sendRemovalPrivateMessage(submissionId, reason) {
	try {
		const submission = await reddit.getSubmission(submissionId);

		const text = outdent`
		**Reason:**${reason}

		[link to your post](${await submission.permalink})
	`;

		await reddit.composeMessage({
			to: await submission.author.name,
			subject: "Your post has been removed",
			text: text,
			fromSubreddit: await submission.subreddit,
		});
	} catch (e) {
		log.error(
			`[sendRemovalPrivateMessage] submissionId=${submissionId}; private message to author of submission failed with error=${e}`
		);
	}
}

export async function replyToSubmission(submissionId, text) {
	try {
		const submission = await reddit.getSubmission(submissionId);
		await submission.reply(text);
	} catch (e) {
		log.error(
			`[replyToSubmission] submissionId=${submissionId}; reply to submission faile with error=${e}`
		);
	}
}

export async function flairSubmissionWithInvalid(submissionId) {
	try {
		const submission = await reddit.getSubmission(submissionId);
		await submission.assignFlair({
			text: "INVALID",
			cssClass: "no",
		});
	} catch (e) {
		log.error(
			`[flairSubmissionWithInvalid] submissionId=${submissionId}; failed with error=${e}`
		);
	}
}

export async function flairSubmissionWithOutcomeNo(submissionId) {
	try {
		const submission = await reddit.getSubmission(submissionId);
		await submission.assignFlair({
			text: "NO",
			cssClass: "no",
		});
	} catch (e) {
		log.error(
			`[flairSubmissionWithOutcomeNo] submissionId=${submissionId}; failed with error=${e}`
		);
	}
}

export async function removeSubmissionFlair(submissionId) {
	try {
		const submission = await reddit.getSubmission(submissionId);
		await submission.assignFlair({
			text: "",
			cssClass: "no",
		});
	} catch (e) {
		log.error(
			`[removeSubmissionFlair] submissionId=${submissionId}; failed with error=${e}`
		);
	}
}

export function timeLeftForChallenge(donBufferEndsAt) {
	const startTime = moment();
	const endTime = moment(donBufferEndsAt);
	const diff = endTime.diff(startTime);
	return moment.utc(diff).format("HH:mm:ss");
}
