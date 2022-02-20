import dotenv from "dotenv";
dotenv.config();
import express from "express";
import body_parser from "body-parser";
const { urlencoded, json } = body_parser;
import cors from "cors";
import { submissionsQueue } from "./submissions_queue";
import { submissionsProcessor } from "./submissions_processor";
import { connectDb } from "./models";
import { submissionsSweeper } from "./submissions_sweeper";

const app = express();
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

async function main() {
	await connectDb();
	submissionsQueue();
	submissionsProcessor();
	submissionsSweeper();
}

main();

app.get("/", async function (req, res) {
	console.log("LALALA");
	res.send("Ok");
});
