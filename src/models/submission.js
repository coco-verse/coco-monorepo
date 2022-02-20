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
		challengeData: {
			type: String,
		},
		challengeDataSignature: { type: String },
		initStatus: { type: String, required: true },
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
