import dotenv from 'dotenv';
dotenv.config();
import log from 'loglevel';
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'trace');
import { dumpUninitialisedSubmissions, removeFinalizedOutcomeNoByTimeExpiry } from './db_manager';
import moment from 'moment';
import { flairSubmissionWithInvalid, replyToSubmission, flairSubmissionWithOutcomeNo } from './helpers';

const timeoutInternalSecs = 10;
export async function submissionsSweeper() {
  try {
    log.info(`[submissionsSweeper] in the submissionsSweeper()`);
    // sweep uninitiaised submissions that are no more valid
    // TODO change this to 10 minutes
    const date = moment().subtract(10, 'minute').toISOString();
    const dumpedSubmissionsRedditIds = await dumpUninitialisedSubmissions(date);
    for (let index = 0; index < dumpedSubmissionsRedditIds.length; index++) {
      let submissionId;

      try {
        try {
          submissionId = dumpedSubmissionsRedditIds[index];
        } catch (e) {
          log.info(`[submissionsSweeper] Dumping of Submission with id=${submissionId} errored with error=${e}`);
        }

        flairSubmissionWithInvalid(submissionId);
        log.info(
          `[submissionsSweeper] Submission with id=${submissionId} made invalid; reason="Dumped because Uninitialised"`
        );
      } catch (e) {
        log.info(`[submissionsSweeper] Removal of Submission with id=${submissionId} errored with error=${e}`);
      }
    }

    // sweep initialised submissions with final outcome no post challengeBufferExpiry
    const removedSubmissionsRedditIds = await removeFinalizedOutcomeNoByTimeExpiry();
    for (let index = 0; index < removedSubmissionsRedditIds.length; index++) {
      let submissionId;
      try {
        submissionId = removedSubmissionsRedditIds[index];
        
        // TODO: Change to flair
        flairSubmissionWithInvalid(submissionId);
        log.info(`[submissionsSweeper] Submission with id=${submissionId} removed; reson="Final outcome is 0"`);

        // reply to submission about removal
        await replyToSubmission(
          submissionId,
          `Post Removed. Reason:Submission resolved with final outcome "NO" after challenges.`
        );
      } catch (e) {
        log.info(`[submissionsSweeper] Removal of Submission with id=${submissionId} errored with error=${e}`);
      }
    }

    setTimeout(() => {
      submissionsSweeper();
    }, timeoutInternalSecs * 1000);
  } catch (e) {
    log.info(`[submissionsSweeper] main function call errored with error=${e}`);
  }
}
