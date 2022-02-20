import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { addSubmission, findSubmission } from "./db_manager.js";
import { keccackHash } from "./helpers.js";
import { SubmissionSchema } from "./models/submission.js";
import { consumeQueue } from "./submissions_queue.js";

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
		const submissionIdentifier = keccackHash(submission.url);
		const submissionExists = await findSubmission(submissionIdentifier);
		if (submissionExists != undefined) {
			log.info(
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
		const reply = await submission.reply("Hey, this is trial");
		await reply.distinguish({
			status: true,
			sticky: true,
		});
	} catch (e) {
		log.error(`[processSubmission] ${e}`);
	}
}
