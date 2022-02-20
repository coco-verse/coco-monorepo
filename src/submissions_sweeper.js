import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import { dumpUninitialisedSubmissions } from "./db_manager";
import moment from "moment";

const timeoutInternalSecs = 3;

export async function submissionsSweeper() {
	try {
		const date = moment().subtract("minutes", 10).toISOString();
		const dumpedSubmissionIds = await dumpUninitialisedSubmissions(date);
		log.info(
			`[submissionsSweeper] Dumped uinitialised submissions ${dumpedSubmissionIds} older than ${date}`
		);

		setTimeout(() => {
			submissionsSweeper();
		}, timeoutInternalSecs * 1000);
	} catch (e) {
		console.log(e, " Yp this wnet wrong");
	}
}
