import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
	{
		submissionPermalink: {
			type: String,
			required: true,
		},
		// submissionIdentifier = keccack256(submissionsPermalink)
		submissionIdentifier: {
			type: String,
			required: true,
		},
		submissionRedditId: {
			type: String,
			required: true,
		},
		initStatus: { type: String, required: true },
		groupAddress: {
			type: String,
		},
		challengeData: {
			type: String,
		},
		challengeDataSignature: { type: String },
		donBufferEndsAt: {
			type: Date,
		},
		resolutionBufferEndsAt: {
			type: Date,
		},
		donBuffer: {
			type: Number,
		},
		resolutionBuffer: {
			type: Number,
		},
		tokenC: {
			type: String,
		},
		fee: {
			type: String,
		},
		outcome: {
			type: String,
		},
	},
	{
		timestamps: {},
	}
);

// PostSchema.statics.findPostAndUpdate = function (filter, updates) {
// 	return this.findOneAndUpdate(filter, updates, {
// 		new: true,
// 		upsert: true,
// 	});
// };

export const Submission = mongoose.model("Submission", SubmissionSchema);
