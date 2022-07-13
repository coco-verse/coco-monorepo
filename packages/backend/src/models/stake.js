import mongoose from "mongoose";

const StakeSchema = new mongoose.Schema(
	{
		userAddress: {
			type: String,
			require: true,
		},
		groupAddress: {
			type: String,
			require: true,
		},
		marketIdentifier: {
			type: String,
			required: true,
		},
		donEscalationIndex: {
			type: Number,
			required: true,
		},
		amount: {
			type: String,
			required: true,
		},
		outcome: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: {},
	}
);

export const Stake = mongoose.model("Stake", StakeSchema);
