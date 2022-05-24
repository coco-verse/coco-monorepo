import { BigNumber } from "ethers";
import {
	MAX_LENGTH_DESCRIPTION,
	MAX_LENGTH_NAME,
	MAX_LENGTH_TITLE,
	MAX_LENGTH_LINK,
	ZERO_BN,
	MAX_LENGTH_AUTHOR,
} from ".";

export function validateIsNumber(val) {
	let value = Number(val);
	if (Number.isNaN(value)) {
		return {
			valid: false,
			expText: "Invalid value!",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateIsBN(val) {
	if (!BigNumber.isBigNumber(val)) {
		return {
			valid: false,
			expText: "Invalid value!",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateLinkURL(val) {
	if (typeof val != "string") {
		return {
			valid: false,
			expText: "Invalid Input!",
		};
	}

	let reg =
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
	if (!reg.test(val) || val.length > MAX_LENGTH_LINK) {
		return {
			valid: false,
			expText: "Invalid link. Make sure to start your link with http(s)",
		};
	}

	return {
		valid: true,
		expTex: "",
	};
}
