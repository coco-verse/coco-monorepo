import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
  {
    submissionPermalink: {
      type: String,
      required: true,
    },
    // marketIdentifier = keccack256(submissionsPermalink)
    marketIdentifier: {
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
    donEscalationCount: {
      type: Number,
    },
  },
  {
    timestamps: {},
  }
);

export const Submission = mongoose.model('Submission', SubmissionSchema);
