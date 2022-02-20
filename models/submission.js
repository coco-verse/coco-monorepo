const mongoose = require("mongoose");

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

const SubmissionSchema = mongoose.model("Submission", PostSchema);

module.exports = SubmissionSchema;
