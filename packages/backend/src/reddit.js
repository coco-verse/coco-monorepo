import dotenv from "dotenv";
dotenv.config();

import snoowrap from "snoowrap";
export const reddit = new snoowrap({
	userAgent: process.env.BOT_USER_AGENT,
	clientId: process.env.BOT_CLIENT_ID,
	clientSecret: process.env.BOT_CLIENT_SECRET,
	refreshToken: process.env.BOT_REFRESH_TOKEN,
});

reddit.config({ requestDelay: 1000, continueAfterRatelimitError: true });

if (process.env.LOG_LEVEL == "debug") {
	reddit.config({ debug: true });
}
reddit.getNew();
