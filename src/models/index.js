import dotenv from "dotenv";
dotenv.config();
import log from "loglevel";
log.setLevel(process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "trace");
import mongoose from "mongoose";
import { Submission } from "./submission";

export const connectDb = async () => {
	let options = {};
	if (process.env.NODE_ENV === "production") {
		options = {
			sslValidate: true,
			sslCA: `${__dirname}/../rds-combined-ca-bundle.pem`,
		};
	}

	await mongoose.connect(process.env.DB_URI, options);

	log.info(`[connectDb] connected with db`);
};

export const models = { Submission };
