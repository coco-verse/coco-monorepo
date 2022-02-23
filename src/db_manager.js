import moment from "moment";
import { keccackHash, constants } from "./helpers";
import { models } from "./models";

export async function findSubmission(submissionIdentifier) {
	return models.Submission.findOne({
		submissionIdentifier,
	});
}

export async function addSubmission(submission) {
	return models.Submission.create({
		submissionIdentifier: keccackHash(submission.permalink),
		submissionPermalink: submission.permalink,
		submissionRedditId: submission.id,
		initStatus: constants.SUBMISSION_STATUS.UNINITIALIZED,
	});
}

export async function updateSubmissionToInitialised(
	submissionIdentifier,
	challengeData,
	challengeDataSignature
) {
	return models.Submission.updateMany(
		{
			submissionIdentifier,
		},
		{
			initStatus: constants.SUBMISSION_STATUS.INITIALIZED,
			challengeData,
			challengeDataSignature,
		}
	);
}

export async function updateSubmissionDetails(submissionIdentifier, updates) {
	return models.Submission.updateMany(
		{
			submissionIdentifier,
		},
		updates
	);
}

export async function findSubmissions(filter) {
	return models.Submission.find(filter);
}

export async function dumpUninitialisedSubmissions(olderThanTime) {
	let filter = {
		initStatus: constants.SUBMISSION_STATUS.UNINITIALIZED,
		createdAt: { $lte: olderThanTime },
	};

	// find all documents that will be dumped
	const submissions = await findSubmissions(filter);

	await models.Submission.updateMany(filter, {
		initStatus: constants.SUBMISSION_STATUS.DUMPED,
	});

	return submissions.map((sub) => sub.submissionRedditId);
}

export async function removeFinNoOutcomeSubmissions() {
	// remove under following conditions
	// if (
	// 	((dockerBufferEndsAt <= currentTime && resolutionBufferEndsAt == 0) ||
	// 		(resolutionBufferEndsAt <= currentTime &&
	// 			resolutionBufferEndsAt != 0)) &&
	// 	outcome == 0 &&
	// 	initStatus == constants.SUBMISSION_STATUS.INITIALIZED
	// ) {
	// }
	let currentTime = moment().toISOString();
	let filter = {
		$and: [
			{
				$or: [
					{
						$and: [
							{ dockerBufferEndsAt: { $lte: currentTime } },
							{
								resolutionBufferEndsAt: {
									$eq: new Date(0).toISOString(),
								},
							},
						],
					},
					{
						$and: [
							{ resolutionBufferEndsAt: { $lte: currentTime } },
							{
								resolutionBufferEndsAt: {
									$ne: new Date(0).toISOString(),
								},
							},
						],
					},
				],
			},
			{
				initStatus: constants.SUBMISSION_STATUS.INITIALIZED,
			},
			{
				outcome: "0",
			},
		],
	};

	// find all documents that will be removed
	const submissions = await findSubmissions(filter);

	await models.Submission.updateMany(filter, {
		initStatus: constants.SUBMISSION_STATUS.REMOVED,
	});

	return submissions.map((sub) => sub.submissionRedditId);
}
