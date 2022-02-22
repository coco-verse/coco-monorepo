import { ethers } from "ethers";

export function keccackHash(value) {
	return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value));
}

export const constants = {
	SUBMISSION_STATUS: {
		UNINITIALIZED: "UNINITIALIZED",
		INITIALIZED: "INITIALIZED",
		// DUMPED - posts that were dumped because their creator did not put in the initial challenge
		DUMPED: "DUMPED",
		// REMOVED - posts that were challenged and results in final outcome 0
		REMOVED: "REMOVED",
	},
};
