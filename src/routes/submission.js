import { Router } from "express";
import { models } from "../models";
import { constants } from "../helpers";

const router = Router();

router.post("/initialise", async function (req, res, next) {
	const {
		submissionIdentifier,
		challengeData,
		challengeDataSignature,
		groupAddress,
	} = req.body;

	console.log(
		submissionIdentifier,
		challengeData,
		challengeDataSignature,
		groupAddress
	);
	// TODO verify that challengeData is valid

	// check whether submission exists and is uninitialised
	const submissionDoc = await models.Submission.findOne({
		submissionIdentifier,
		initStatus: constants.SUBMISSION_STATUS.UNINITIALIZED,
	});

	if (submissionDoc == undefined) {
		next("Submission does not exits or is already initialised");
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
			groupAddress,
		}
	);

	res.status(200).send({
		success: true,
		response: {
			submissionIdentifier,
		},
	});
});

router.post("/find", async function (req, res, next) {
	const { filter } = req.body;
	console.log("filter receive ", filter);
	const submissions = await models.Submission.find(filter);
	res.status(200).send({
		success: true,
		response: {
			submissions,
		},
	});
});

export default router;
