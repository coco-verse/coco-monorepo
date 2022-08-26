import dotenv from 'dotenv';
dotenv.config();
import log from 'loglevel';
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'trace');
import express from 'express';
import body_parser from 'body-parser';
const { urlencoded, json } = body_parser;
import cors from 'cors';
import { submissionsQueue } from './submissions_queue';
import { submissionsProcessor } from './submissions_processor';
import { connectDb } from './models';
import { submissionsSweeper } from './submissions_sweeper';
import { startEventsSubscription } from './chain_processor';
import { routes } from './routes';

const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.use('/submission', routes.submission);

app.get('/', async function (req, res) {
  res.send('Ok');
});

async function main() {
  try {
    log.info(`[main] Connecting to the DB`);
    await connectDb();

    try {
      log.info(`[main] Running the Submissions Queue`);
      await submissionsQueue();

      try {
        log.info(`[main] Running the Submissions Processor`);
        await submissionsProcessor();

        try {
          log.info(`[main] Running the Submissions Sweeper`);
          await submissionsSweeper();

          try {
            log.info(`[main] Running the Event subscription`);
            startEventsSubscription();

            try {
              log.info(`[main] Starting the app`);
              app.listen(port, () => {
                log.info(`[main] Listening on PORT=${port} 🚀`);
              });
            } catch (error) {
              log.info(`[main] Error in starting the app`);
            }
          } catch (error) {
            log.debug(`[main] Error in running the Event subscription`);
          }
        } catch (error) {
          log.debug(`[main] Error in running the Submissions Sweeper`);
        }
      } catch (error) {
        log.debug(`[main] Error in running the Submissions Processor`);
      }
    } catch (error) {
      log.debug(`[main] Error in running the Submissions Queue`);
    }
  } catch (error) {
    log.debug(`[main] Error in connecting to the DB`);
  }
}

main().catch((e) => {
  log.debug(`[Error] Error in the server ${e}`);
});
