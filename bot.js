const snoowrap = require("snoowrap");

class Bot {
	constructor() {
		this.bot = new snoowrap({
			userAgent: process.env.BOT_USER_AGENT,
			clientId: process.env.BOT_CLIENT_ID,
			clientSecret: process.env.BOT_CLIENT_SECRET,
			refreshToken: process.env.BOT_REFRESH_TOKEN,
		});
	}

    


}
