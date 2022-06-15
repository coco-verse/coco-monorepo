import { BigNumber, constants, utils } from "ethers";
export const ZERO_BN = BigNumber.from("0");
export const ONE_BN = BigNumber.from("1");
export const TWO_BN = BigNumber.from("2");
export const FOUR_BN = BigNumber.from("4");
export const CREATION_AMOUNT = utils.parseUnits("0.05", 18);
export const MULTIPLIER = BigNumber.from("10000000000");
export const MULTIPLIER_BASE = 10;
export const ZERO_DECIMAL_STR = "0";
export const GRAPH_BUFFER_MS = 2000;
export const MAX_LENGTH_NAME = 20;
export const MAX_LENGTH_DESCRIPTION = 500;
export const MAX_LENGTH_TITLE = 250;
export const MAX_LENGTH_AUTHOR = 250;
export const MAX_LENGTH_LINK = 2048;
export const MAX_UINT_256 = constants.MaxUint256;
export const FEED_BATCH_COUNT = 100;
export const SAFE_BASE_URL = "http://18.159.101.163:8000/cgw";
export const COLORS = {
	PRIMARY: "#FFFFFF",
};
export const SUBMISSION_STATUS = {
	UNINITIALIZED: "UNINITIALIZED",
	INITIALIZED: "INITIALIZED",
	// DUMPED - posts that were dumped because their creator did not put in the initial challenge
	DUMPED: "DUMPED",
	// REMOVED - posts that were challenged and results in final outcome 0
	REMOVED: "REMOVED",
	UNKNOWN: "UNKNOWN",
};

export const QUERY_STATUS = {
	FOUND: "FOUND",
	NOT_FOUND: "NOT_FOUND",
};
