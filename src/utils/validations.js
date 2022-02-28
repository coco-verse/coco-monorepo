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

export function validateEscalationLimit(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}
	if (val < 1) {
		return {
			valid: false,
			expText:
				"We recommend Max. no. of Challenge rounds to be at least 1",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateExpireHours(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}
	if (val < 1) {
		return {
			valid: false,
			expText: "We recommend Prediction period to be at least 1 hr",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateDonBufferHours(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}
	if (val < 1) {
		return {
			valid: false,
			expText: "We recommend buffer period to be at least 1 hr",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateResolutionBufferHours(val) {
	let isNum = validateIsNumber(val);
	if (!isNum.valid) {
		return isNum;
	}
	if (val < 1) {
		return {
			valid: false,
			expText: "We recommend Resolution period to be at least 1 hr",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validateFee(val) {
	let isNum = validateIsNumber(val);
	if (isNum.valid == false) {
		return isNum;
	}

	if (val >= 1) {
		return {
			valid: false,
			expText: "Fee cannot be >= 1",
		};
	}

	return {
		valid: true,
		expText: "",
	};
}

export function validateDonReservesLimit(val) {
	if (!validateIsBN(val).valid) {
		return validateIsBN(val);
	}

	if (val.lte(ZERO_BN)) {
		return {
			valid: false,
			expText: "Value cannot be zero",
		};
	}
	return {
		valid: true,
		expText: "",
	};
}

export function validatePostTitle(val) {
	if (typeof val != "string") {
		return {
			valid: false,
			expText: "Invalid Input!",
		};
	}

	if (val == "") {
		return {
			valid: false,
			expText: "Title cannot be empty",
		};
	}

	if (val.length > MAX_LENGTH_TITLE) {
		return {
			valid: false,
			expText: "Title cannot be greater than 250 characters in length",
		};
	}

	return {
		valid: true,
		expTex: "",
	};
}

export function validatePostAuthor(val) {
	if (typeof val != "string") {
		return {
			valid: false,
			expText: "Invalid Input!",
		};
	}

	if (val.length > MAX_LENGTH_AUTHOR) {
		return {
			valid: false,
			expText:
				"Author name cannot be greater than 250 characters in length",
		};
	}

	return {
		valid: true,
		expTex: "",
	};
}

export function validateLinkURL(val) {
	if (typeof val != "string") {
		return {
			valid: false,
			expText: "Invalid Input!",
		};
	}

	if (val == "" || val.length > MAX_LENGTH_LINK) {
		return {
			valid: false,
			expText: "Invalid link",
		};
	}

	return {
		valid: true,
		expTex: "",
	};
}

export function validateGroupName(val) {
	if (typeof val != "string") {
		return {
			valid: false,
			expText: "Invalid Input!",
		};
	}

	let reg = /[\s!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]+/;
	if (reg.test(val) || val.length > MAX_LENGTH_NAME) {
		return {
			valid: false,
			expText:
				"Names cannot contain spaces & special characters & should be less than 20 characters in length",
		};
	}

	return {
		valid: true,
		expTex: "",
	};
}

export function validateGroupDescription(val) {
	if (typeof val != "string") {
		return {
			valid: false,

			expText: "Invalid Input!",
		};
	}

	if (val.length > MAX_LENGTH_DESCRIPTION) {
		return {
			valid: false,
			expText: `Char count should be smaller than ${MAX_LENGTH_DESCRIPTION}`,
		};
	}

	return {
		valid: true,
		expText: "",
	};
}

export function validateUpdateMarketConfigTxInputs(
	fee,
	escalationLimit,
	expireHours,
	bufferHours,
	resolutionHours
) {
	// if (
	// 	validateFee(fee).valid &&
	// 	validateEscalationLimit(escalationLimit).valid &&
	// 	validateBufferHours(bufferHours).valid &&
	// 	validateExpireHours(expireHours).valid &&
	// 	validateResolutionHours(resolutionHours).valid
	// ) {
	// 	return {
	// 		valid: true,
	// 		expText: "",
	// 	};
	// }
	return {
		valid: false,
		expText: "Invalid inputs!",
	};
}

export function validateCreationAmount(val, userBalance) {
	if (!validateIsBN(val).valid || !validateIsBN(userBalance).valid) {
		return {
			valid: false,
			expText: "Invalid value!",
		};
	}

	if (val.lte(ZERO_BN)) {
		return {
			valid: false,
			expText: "Creation amount should be greater than 0",
		};
	}

	if (val.gt(userBalance)) {
		return {
			valid: false,
			expText: "Insufficient Balance",
		};
	}

	return {
		valid: true,
		expText: "",
	};
}

export function validateFundingAmount(val, userBalance) {
	if (!validateIsBN(val).valid || !validateIsBN(userBalance).valid) {
		return validateIsBN(val);
	}

	if (val.lte(ZERO_BN)) {
		return {
			valid: false,
			expText:
				"Initial liquidity should to be greater than 0. Liquidity attract more users to your post",
		};
	}

	if (val.gt(userBalance)) {
		return {
			valid: false,
			expText: "Insufficient Balance",
		};
	}

	return {
		valid: true,
		expText: "",
	};
}

export function validateInitialBetAmount(val, userBalance) {
	if (!validateIsBN(val).valid || !validateIsBN(userBalance).valid) {
		return validateIsBN(val);
	}

	if (val.lte(ZERO_BN)) {
		return {
			valid: false,
			expText:
				"Initial YES bet amount should be greater than 0. It helps show others that you are confident that your post belongs to group's feed.",
		};
	}

	if (val.gt(userBalance)) {
		return {
			valid: false,
			expText: "Insufficient Balance",
		};
	}

	return {
		valid: true,
		expText: "",
	};
}
