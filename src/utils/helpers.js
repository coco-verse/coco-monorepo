import { BigNumber, ethers, utils as etherUtils } from "ethers";
import { useState } from "react";
import { useEffect } from "react";
import { parse } from "graphql";
import { ZERO_BN, TWO_BN } from "./constants";
import { useTab } from "@chakra-ui/tabs";
import { CURR_SYMBOL, MULTIPLIER_BASE, MULTIPLIER, ONE_BN } from ".";
import { addresses } from "./../contracts";

export function formatMarketData(market, onChain) {
	if (onChain == true) {
		const stakes = market.stakes.map((stake) => {
			return {
				...stake,
				donEscalationIndex: Number(stake.donEscalationIndex),
				amount: parseDecimalToBN(stake.amount),
				outcome: Number(stake.outcome),
			};
		});

		return {
			...market,

			reserve0: parseDecimalToBN(market.reserve0),
			reserve1: parseDecimalToBN(market.reserve1),
			donBufferEndsAt: Number(market.donBufferEndsAt),
			donBuffer: Number(market.donBuffer),
			resolutionBufferEndsAt: Number(market.resolutionBufferEndsAt),
			resolutionBuffer: Number(market.resolutionBuffer),
			lastAmountStaked: parseDecimalToBN(market.lastAmountStaked),
			fee: parseDecimalToBN(market.fee),
			outcome: Number(market.outcome),
			donEscalationCount: Number(market.donEscalationCount),
			stakes: stakes,
		};
	} else {
		return {
			...market,
			// market.amount1 from post obj is already
			// scaled to 1e18 and is string type.
			amount1: BigNumber.from(market.amount1),
		};
	}
}

export function roundDecimalStr(value, dp = 6) {
	let _value = value;
	try {
		if (typeof _value == "string") {
			_value = Number(_value);
		}
	} catch (e) {
		return 0;
	}

	return parseFloat(_value.toFixed(dp));
}

export function numStrFormatter(value, digits = 1) {
	let _value = value;
	try {
		if (typeof _value == "string") {
			_value = Number(_value);
		}
	} catch (e) {
		return 0;
	}

	if (_value > 1000000) {
		_value = (_value / 1000000).toFixed(digits) + "M";
	} else if (_value > 1000) {
		_value = (_value / 1000).toFixed(digits) + "K";
	} else {
		_value = String(_value);
	}
	return _value;
}

export function sliceAddress(address) {
	return `${address.slice(0, 6)}...${address.slice(
		address.length - 4,
		address.length
	)}`;
}

export function parseDecimalToBN(val, base = 18) {
	return ethers.utils.parseUnits(val, base);
}

export function formatBNToDecimal(val, base = 18, round = true, dp = 6) {
	val = ethers.utils.formatUnits(val, base);
	if (round === true) {
		val = roundDecimalStr(val, dp);
	}
	return val;
}

export function formatBNToDecimalCurr(val, base = 18, dp = 6) {
	return `${formatBNToDecimal(val, base, true, dp)} ${CURR_SYMBOL}`;
}

export function formatDecimalToCurr(value, dp = 6) {
	return `${roundDecimalStr(value, dp)} ${CURR_SYMBOL}`;
}

export function formatDecimalToPercentage(value, dp = 6) {
	return `${roundDecimalStr(value * 100, dp)}%`;
}

export function getDecStrAvgPriceBN(amountIn, amountOut) {
	if (!BigNumber.isBigNumber(amountIn) || !BigNumber.isBigNumber(amountOut)) {
		return "0.00";
	}
	if (amountIn.isZero() || amountOut.isZero()) {
		return "0.00";
	}
	return formatBNToDecimal(
		amountIn.mul(MULTIPLIER).div(amountOut),
		MULTIPLIER_BASE,
		true,
		6
	);
}

export function useBNInput(validationFn) {
	const [input, setInput] = useState("0");
	const [bnValue, setBnValue] = useState(BigNumber.from("0"));
	const [err, setErr] = useState(false);
	const [errText, setErrText] = useState("");

	useEffect(() => {
		try {
			let bn = parseDecimalToBN(
				`${
					input == undefined || input == "" || input == "."
						? "0"
						: input
				}`
			);
			setBnValue(bn);
			if (validationFn != undefined) {
				let { valid, expStr } = validationFn(bn);
				if (!valid) {
					throw Error(expStr);
				}
			}
			setErr(false);
			setErrText("");
		} catch (e) {
			setErr(true);
			setErrText(e.message);
		}
	}, [input]);

	return {
		input,
		bnValue,
		setInput,
		err,
		errText,
	};
}

export function formatTimeInSeconds(seconds) {
	let sec = parseInt(seconds, 10);

	let days = Math.floor(sec / 86400);
	if (days > 0) {
		let hours = Math.floor((sec - days * 86400) / 3600);
		return `${days}d ${hours}h`;
	}

	let hours = Math.floor(sec / 3600);
	if (hours > 0) {
		let minutes = Math.floor((sec - hours * 3600) / 60);
		return `${hours}h ${minutes}m`;
	}

	let minutes = Math.floor(sec / 60);
	if (minutes > 0) {
		sec = Math.floor(sec - minutes * 60);
		return `${minutes}m ${sec}s`;
	}

	return `${sec}s`;
}

export function parseHoursToSeconds(hr) {
	return hr * 60 * 60;
}

export function parseSecondsToHours(seconds) {
	return seconds / 3600;
}

export function getMarketIdentifierOfUrl(url) {
	return etherUtils.keccak256(etherUtils.toUtf8Bytes(url));
}

export function postSignTypedDataV4Helper(
	groupAddress,
	marketIdentifier,
	amount1Bn,
	chainId
) {
	const domain = [
		{ name: "name", type: "string" },
		{ name: "version", type: "string" },
		{ name: "chainId", type: "uint256" },
		{ name: "verifyingContract", type: "address" },
	];

	const marketData = [
		{ name: "group", type: "address" },
		{ name: "marketIdentifier", type: "bytes32" },
		{ name: "amount1", type: "uint256" },
	];

	const domainData = {
		name: "Group Router",
		version: "v1",
		chainId: chainId,
		verifyingContract: addresses.GroupRouter, // TODO change this contract address to GroupRouter address
	};

	const message = {
		group: groupAddress,
		marketIdentifier,
		amount1: amount1Bn,
	};

	const data = JSON.stringify({
		types: {
			EIP712Domain: domain,
			MarketData: marketData,
		},
		domain: domainData,
		primaryType: "MarketData",
		message: message,
	});

	return {
		marketData: message,
		dataToSign: data,
	};
}

export function calculateRedeemObj(market, account, userPositions) {
	let total = ZERO_BN;
	let wins = ZERO_BN;

	if (!market || !account || !userPositions) {
		return {
			total,
			wins,
		};
	}

	// user gets back their stake on the right outcome
	total = total.add(
		market.outcome == 0 ? userPositions.amount0 : userPositions.amount1
	);

	if (
		market.outcome == 0 &&
		market.staker0.toLowerCase() == account.toLowerCase()
	) {
		total = total.add(market.reserve1);
		wins = market.reserve1;
	}
	if (
		market.outcome == 1 &&
		market.staker1.toLowerCase() == account.toLowerCase()
	) {
		total = total.add(market.reserve0);
		wins = market.reserve0;
	}

	return {
		total,
		wins,
	};
}

// Priority for metadata is given in following order:
// Twitter -> Open Graph -> Normal
export function formatMetadata(metadata) {
	let final = {};

	if (metadata.twitterTitle != undefined) {
		final.title = metadata.twitterTitle;
	} else if (metadata.ogTitle != undefined) {
		final.title = metadata.ogTitle;
	}

	if (metadata.twitterDescription != undefined) {
		final.description = metadata.twitterDescription;
	} else if (metadata.ogDescription != undefined) {
		final.description = metadata.ogDescription;
	}

	if (metadata.twitterImage != undefined) {
		final.imageUrl = metadata.twitterImage.url;
	} else if (metadata.ogImage != undefined) {
		final.imageUrl = metadata.ogImage.url;
	}

	final.url = metadata.ogUrl ? metadata.ogUrl : metadata.requestUrl;

	return final;
}

export function findUrlName(url) {
	let tmp = document.createElement("a");
	tmp.setAttribute("href", url);
	return tmp.hostname;
}
