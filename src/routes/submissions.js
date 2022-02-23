import { Router } from "express";
import { models } from "../models";
import { constants } from "./../helpers";

export const router = Router();

router.post("/initialise", async function (req, res, next) {
	const { submissionIdentifier, challengeData, challengeDataSignature } =
		req.body;

	// TODO verify that challengeData is valid

	// check whether submission is already initialised
	const submissionDoc = await models.Submission.findOne({
		submissionIdentifier,
		initStatus: constants.SUBMISSION_STATUS.UNINITIALIZED,
	});

	if (submissionDoc != undefined) {
		next("Submission is already initialised");
		return;
	}

	await models.Submission.updateMany(
		{
			submissionIdentifier,
		},
		{
			challengeData,
			challengeDataSignature,
			initStatus: constants.SUBMISSION_STATUS.INITIALIZED,
		}
	);

	res.status(200).send({
		success: true,
		response: {
			submissionIdentifier,
		},
	});
});
