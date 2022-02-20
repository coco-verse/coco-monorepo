import { ethers } from "ethers";

export function keccackHash(value) {
	return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value));
}

export const constants = {
	SUBMISSION_STATUS: {
		UNINITIALIZED: "UNINITIALIZED",
		INITIALIZED: "INITIALIZED",
		DUMPED: "DUMPED",
	},
};
