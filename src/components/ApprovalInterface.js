import PrimaryButton from "./PrimaryButton";
import { Flex, Box, Text } from "@chakra-ui/react";
import {
	useERC1155SetApprovalForAll,
	useERC20Approve,
	useERC20TokenAllowanceWrapper,
	useERC1155ApprovalForAllWrapper,
} from "../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import { useEffect, useState } from "react";

import { CURR_SYMBOL, MAX_UINT_256, ZERO_BN, COLORS } from "../utils";
import { addresses } from "../contracts";

/**
 * tokenType -> 0: ERC20, 1: ERC1155
 */
function ApprovalInterface({
	tokenType,
	onSuccess,
	onFail,
	erc1155Address = undefined,
	erc20Address = undefined,
	erc20AmountBn = undefined,
	...props
}) {
	const { account } = useEthers();

	const erc20TokenAllowance = useERC20TokenAllowanceWrapper(
		erc20Address,
		account,
		addresses.GroupRouter,
		erc20AmountBn
	);
	const erc1155TokenApproval = useERC1155ApprovalForAllWrapper(
		erc1155Address,
		account,
		addresses.GroupRouter
	);

	const {
		state: stateERC1155,
		send: sendERC1155,
	} = useERC1155SetApprovalForAll(erc1155Address);
	const { state: stateToken, send: sendToken } = useERC20Approve(
		erc20Address
	);

	const [loading, setLoading] = useState(false);

	function isDisabled() {
		if (tokenType === 0) {
			return erc20TokenAllowance;
		} else if (tokenType === 1) {
			return erc1155TokenApproval;
		}

		return true;
	}

	useEffect(() => {
		if (
			stateERC1155.status === "Success" ||
			stateToken.status === "Success"
		) {
			setTimeout(() => {
				if (onSuccess) {
					onSuccess();
				}
				setLoading(false);
			}, 5000);
		} else if (
			stateERC1155.status === "Exception" ||
			stateERC1155.status === "Fail" ||
			stateToken.status === "Exception" ||
			stateToken.status === "Fail"
		) {
			if (onFail) {
				onFail();
			}
			setLoading(false);
		}
	}, [stateERC1155, stateToken]);

	if (isDisabled()) {
		return <></>;
	}

	return (
		<Flex
			flexDirection={"column"}
			padding={2}
			backgroundColor={COLORS.PRIMARY}
			borderRadius={8}
			marginBottom={4}
		>
			<Text fontWeight="bold" fontSize={12}>
				{tokenType === 0
					? `To spend your ${CURR_SYMBOL} tokens, you will first have to give approval to the app. This is only needed once.`
					: `To spend your YES/NO shares, you will first have to give approval to the app. This is only needed once per group`}
			</Text>
			<PrimaryButton
				style={{ marginTop: 5 }}
				disabled={isDisabled()}
				loadingText="Processing..."
				isLoading={loading}
				onClick={() => {
					if (isDisabled()) {
						return;
					}

					setLoading(true);

					if (tokenType === 0) {
						sendToken(addresses.GroupRouter, MAX_UINT_256);
					} else if (tokenType === 1) {
						sendERC1155(addresses.GroupRouter, true);
					} else {
						setLoading(false);
					}
				}}
				title={"Give approval"}
			/>
		</Flex>
	);
}

export default ApprovalInterface;
