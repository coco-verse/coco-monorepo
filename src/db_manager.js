import { keccackHash, constants } from "./helpers";
import { models } from "./models";

export async function findSubmission(submissionIdentifier) {
	return models.Submission.findOne({
		submissionIdentifier,
	});
}

export async function addSubmission(submission) {
	return models.Submission.create({
		submissionIdentifier: keccackHash(submission.url),
		submissionUrl: submission.url,
		submissionRedditId: submission.id,
		challengeData: "",
		challengeDataSignature: "",
		initStatus: constants.SUBMISSION_STATUS.UNINITIALIZED,
	});
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
