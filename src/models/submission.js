import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
	{
		submissionUrl: {
			type: String,
			required: true,
		},
		submissionIdentifier: {
			type: String,
			required: true,
		},
		submissionRedditId: {
			type: String,
			required: true,
		},
		initStatus: { type: String, required: true },
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
