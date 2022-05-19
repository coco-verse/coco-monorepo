import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import {
	dumpUninitialisedSubmissions,
	removeFinalizedOutcomeNoByTimeExpiry,
} from "./db_manager";
import moment from "moment";
import { reddit } from "./reddit";
import { replyToSubmission } from "./helpers";

const timeoutInternalSecs = 3;
export async function submissionsSweeper() {
	try {
		// uninitiaised submission that are no more valid
		// TODO change this to 10 minutes
		const date = moment().subtract(10, "minute").toISOString();
		const dumpedSubmissionsRedditIds = await dumpUninitialisedSubmissions(
			date
		);
		for (
			let index = 0;
			index < dumpedSubmissionsRedditIds.length;
			index++
		) {
			try {
				const submissionId = dumpedSubmissionsRedditIds[index];
				// TODO: Change to flair
				await reddit.getSubmission(submissionId).remove({
					spam: true,
				});
				log.info(
					`[submissionsSweeper] Submission with id=${submissionId} removed; reason="Dumped because Uninitialised"`
				);

				// Not sure whether should we reply?
				// // reply to submission about removal
				// await replyToSubmission(
				// 	submissionId,
				// 	"Post Removed. Reason:Creator did not place the initial challenge required in time."
				// );
			} catch (e) {
				log.info(
					`[submissionsSweeper] Removal of Submission with id=${submissionId} errored with error=${e}`
				);
			}
		}

		// initialised submissions with final outcome no
		const removedSubmissionsRedditIds =
			await removeFinalizedOutcomeNoByTimeExpiry();
		for (
			let index = 0;
			index < removedSubmissionsRedditIds.length;
			index++
		) {
			try {
				const submissionId = removedSubmissionsRedditIds[index];
				// TODO: Change to flair
				await reddit.getSubmission(submissionId).remove({
					spam: true,
				});
				log.info(
					`[submissionsSweeper] Submission with id=${submissionId} removed; reson="Final outcome is 0"`
				);

				// // reply to submission about removal
				// await replyToSubmission(
				// 	submissionId,
				// 	`Post Removed. Reason:Submission resolved with final outcome "NO" after challenges.`
				// );
			} catch (e) {
				log.info(
					`[submissionsSweeper] Removal of Submission with id=${submissionId} errored with error=${e}`
				);
			}
		}

		setTimeout(() => {
			submissionsSweeper();
		}, timeoutInternalSecs * 1000);
	} catch (e) {
		log.info(
			`[submissionsSweeper] main function call errored with error=${e}`
		);
	}
}
