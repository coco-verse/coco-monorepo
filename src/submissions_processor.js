import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { addSubmission, findSubmission } from "./db_manager.js";
import { keccackHash } from "./helpers.js";
import { SubmissionSchema } from "./models/submission.js";
import { consumeQueue } from "./submissions_queue.js";
import { sendRemovalPrivateMessage } from "./submissions_sweeper.js";

const timeoutIntervalSecs = 1;

export async function submissionsProcessor() {
	try {
		// fetch queued submissions
		const queuedSubmissions = consumeQueue();
		for (let index = 0; index < queuedSubmissions.length; index++) {
			const submission = queuedSubmissions[index];
			await processSubmission(submission);
		}

		setTimeout(() => {
			submissionsProcessor();
		}, timeoutIntervalSecs * 1000);
	} catch (e) {
		log.error(`[submissionsProcessor] ${e}`);
	}
}

async function processSubmission(submission) {
	try {
		// check whether submission has already been added
		const submissionIdentifier = keccackHash(submission.permalink);
		const submissionExists = await findSubmission(submissionIdentifier);
		if (submissionExists != undefined) {
			log.debug(
				`[processSubmission] Submission with identifier ${submissionIdentifier} exists`
			);
			return;
		}

		// add the submission
		await addSubmission(submission);
		log.info(
			`[processSubmission] Submission with identifier ${submissionIdentifier} added`
		);

		// reply with challenge url
		const reply = await submission.reply(
			`Link to market - http://65.108.59.231:3000/post/${submissionIdentifier}`
		);
		await reply.distinguish({
			status: true,
			sticky: true,
		});
	} catch (e) {
		log.error(`[processSubmission] ${e}`);
	}
}
