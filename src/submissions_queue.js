import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { reddit } from "./reddit.js";

var submissionQueue = [];
const timeoutInternalSecs = 20;

export async function submissionsQueue() {
	try {
		// get latest submissions
		const subreddit = await reddit.getSubreddit("Cocotester");
		const newSubmissions = await subreddit.getNew({ limit: 100 });
		submissionQueue = submissionQueue.concat(newSubmissions);

		// log.info(`Submission queue ${JSON.stringify(submissionQueue)}`);

		setTimeout(() => {
			submissionsQueue();
		}, timeoutInternalSecs * 1000);
	} catch (e) {
		log.error(`[mainQueue] ${e}`);
	}
}

export function consumeQueue() {
	let queue = submissionQueue;
	submissionQueue = [];
	return queue;
}
