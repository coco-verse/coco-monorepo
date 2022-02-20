import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { Submission } from "./submission";

export const connectDb = () => {
	let options = {};
	if (process.env.NODE_ENV === "production") {
		options = {
			sslValidate: true,
			sslCA: `${__dirname}/../rds-combined-ca-bundle.pem`,
		};
	}

	return mongoose.connect(process.env.DB_URI, options);
};

export const models = { Submission };
