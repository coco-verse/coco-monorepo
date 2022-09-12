import dotenv from 'dotenv';
dotenv.config();
import log from 'loglevel';
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'trace');
import { addSubmission, findSubmission } from './db_manager.js';
import { keccackHash } from './helpers.js';
import { consumeQueue } from './submissions_queue.js';

const timeoutIntervalSecs = 5;

export async function submissionsProcessor() {
  try {
    // fetch queued submissions
    const queuedSubmissions = consumeQueue();
    for (let index = 0; index < queuedSubmissions.length; index++) {
      await processSubmission(queuedSubmissions[index]);
    }

    setTimeout(() => {
      submissionsProcessor();
    }, timeoutIntervalSecs * 1000);
  } catch (e) {
    log.debug(`[ERROR] [submissionsProcessor] ${e}`);
  }
}

async function processSubmission(submission) {
  try {
    // check whether submission has already been added
    const marketIdentifier = keccackHash(submission.permalink);
    const submissionExists = await findSubmission(marketIdentifier);
    if (submissionExists != undefined) {
      log.debug(`[ERROR] [processSubmission] Submission with identifier ${marketIdentifier} exists`);
      return;
    }

    // add the submission
    await addSubmission(submission);
    log.info(`[processSubmission] Submission with identifier ${marketIdentifier} added`);

    // reply with challenge url
    const reply = await submission.reply(`Link to market - ${process.env.FRONTEND_URI}/${marketIdentifier}`);
    await reply.distinguish({
      status: true,
      sticky: true,
    });
  } catch (e) {
    log.debug(`[ERROR] [processSubmission] ${e}`);
  }
}
