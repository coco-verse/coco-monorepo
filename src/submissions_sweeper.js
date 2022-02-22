import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import {
	dumpUninitialisedSubmissions,
	removeFinNoOutcomeSubmissions,
} from "./db_manager";
import moment from "moment";
import { reddit } from "./reddit";

const timeoutInternalSecs = 3;

export async function submissionsSweeper() {
	try {
		// uninitiaised submission that are no more valid
		const date = moment().subtract("minutes", 10).toISOString();
		const dumpedSubmissionsRedditIds = await dumpUninitialisedSubmissions(
			date
		);
		if (dumpedSubmissionsRedditIds.length != 0) {
			log.info(
				`[submissionsSweeper] Dumped uinitialised submissions with reddit ids ${dumpedSubmissionsRedditIds}; older than ${date}`
			);
		}

		// initialised submissions with final outcome no
		const removedSubmissionsRedditIds =
			await removeFinNoOutcomeSubmissions();
		if (removedSubmissionsRedditIds.length != 0) {
			log.info(
				`[submissionsSweeper] Removed submissions with final outcome=0; reddit ids ${dumpedSubmissionsRedditIds}`
			);
		}

		// make sure there's no id repeat in both arrays
		const finalRedditIds = [
			...dumpedSubmissionsRedditIds,
			...removedSubmissionsRedditIds,
		];
		for (let index = 0; index < finalRedditIds.length; index++) {
			try {
				const submissionId = finalRedditIds[index];
				await reddit.getSubmission(submissionId).remove({
					spam: true,
				});
				log.info(
					`[submissionsSweeper] Submission with id=${submissionId} removed`
				);
			} catch (e) {
				log.info(
					`[submissionsSweeper] Removal of Submission with id=${submissionId} errored with error=${e}`
				);
			}

			// TODO send a message to the creator for the removal
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
