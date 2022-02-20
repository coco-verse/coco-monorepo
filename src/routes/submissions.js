import { Router } from "express";
import { models } from "../models";
const router = Router();

router.post("/initialise", async function (req, res, next) {
	const { submissionIdentifier, challengeData, challengeDataSignature } =
		req.body;

	// TODO verify that challengeData is valid

	// check whether submission is already initialised
	const submissionDoc = await models.Submission.findOne({
		submissionIdentifier,
	});

	if (submissionDoc.challengeData != undefined) {
		next("Submission's challenge already initialised");
		return;
	}

	await models.Submission.updateMany(
		{
			submissionIdentifier,
		},
		{
			challengeData,
			challengeDataSignature,
		}
	);

	res.status(200).send({
		success: true,
		response: {
			submissionIdentifier,
		},
	});
});
