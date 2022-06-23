import { BigNumber } from "ethers";
import {
	MAX_LENGTH_LINK,
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
		// eslint-disable-next-line no-useless-escape
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
