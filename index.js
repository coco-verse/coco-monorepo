"use strict";
require("dotenv").config({ path: __dirname + "/.env" });
const snoowrap = require("snoowrap");
const mongoose = require("mongoose");

const connectDb = () => {
	let options = {};
	if (process.env.NODE_ENV === "production") {
		options = {
			sslValidate: true,
			sslCA: `${__dirname}/../rds-combined-ca-bundle.pem`,
		};
	}

	return mongoose.connect(process.env.DB_URI, options);
};

async function main() {
	// Create a new snoowrap requester with OAuth credentials.
	// For more information on getting credentials, see here: https://github.com/not-an-aardvark/reddit-oauth-helper
	const r = new snoowrap({
		userAgent: process.env.BOT_USER_AGENT,
		clientId: process.env.BOT_CLIENT_ID,
		clientSecret: process.env.BOT_CLIENT_SECRET,
		refreshToken: process.env.BOT_REFRESH_TOKEN,
	});
	console.log(r);

	// Automating moderation tasks

	/**
	 * 1. Get new posts every 60 seconds
	 * 2. Check whether they already exist in DB or not
	 * 3. Check the ones that do not into the queue
	 *
	 */

	let newPosts = await r.getSubreddit("coco_club").getNew({
		// limit: 100,
	});

	for (let index = 0; index < newPosts.length; index++) {
		const post = newPosts[index];
		let d = await post.reply("yo yo!");
		let r = await d.distinguish({ status: true, sticky: true });
		console.log(r);

		// check post exists in db
	}
}

main().catch((e) => {
	console.log(e);
});
