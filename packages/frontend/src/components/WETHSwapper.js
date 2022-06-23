import {
	Text,
	Flex,
	Heading,
	useToast,
	NumberInput,
	NumberInputField,
	HStack,
} from "@chakra-ui/react";
import { useEtherBalance, useEthers } from "@usedapp/core";
import { useDepositEthToWeth } from "../hooks";
import { useEffect, useState } from "react";
import { getFunctionSignature, useBNInput, COLORS } from "../utils";

import PrimaryButton from "./PrimaryButton";
import { configs } from "./../contracts";

function WETHSwapper() {
	const { account } = useEthers();

	const toast = useToast();

	const ethBalance = useEtherBalance(account);

	const { state, sendTransaction } = useDepositEthToWeth();

	const [swapLoading, setSwapLoading] = useState(false);
	const {
		input: inputEth,
		bnValue: inputEthBn,
		setInput: setInputEth,
		err: inputEthErr,
		errText: inputEthErrText,
	} = useBNInput(validateEthInput);

	useEffect(() => {
		if (state.status === "Success") {
			setSwapLoading(false);
			toast({
				title: "Swap Success!",
				status: "success",
				isClosable: true,
			});
		}

		if (state.status === "Exception" || state.status === "Fail") {
			setSwapLoading(false);
			toast({
				title:
					"Metamask err! Make sure you have enough test ETH to send transaction.",
				status: "error",
				isClosable: true,
			});
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state]);

	function validateEthInput() {
		if (ethBalance === undefined || inputEthBn.lte(ethBalance)) {
			return { valid: true, expStr: "" };
		}

		return {
			valid: false,
			expStr: "Insufficient Balance",
		};
	}

	if (!account) {
		return <div />;
	}

	return (
		<Flex
			flexDirection="column"
			padding={2}
			backgroundColor={COLORS.PRIMARY}
			borderRadius={8}
			marginBottom={4}
		>
			<Heading size="sm" marginBottom={2}>
				Swap ETH to WETH
			</Heading>
			<HStack>
				<NumberInput
					style={{
						width: "100%",
						marginTop: 5,
					}}
					onChange={(val) => {
						setInputEth(val);
					}}
					value={inputEth}
					defaultValue={0}
					precision={6}
					fontSize={14}
				>
					<NumberInputField />
				</NumberInput>
				<Text fontSize={14}>{`ETH`}</Text>
			</HStack>
			{inputEthErr === true ? (
				<Text
					style={{
						fontSize: 12,
						color: "#EB5757",
					}}
				>
					{`${inputEthErrText}`}
				</Text>
			) : undefined}
			<PrimaryButton
				isLoading={swapLoading}
				loadingText="Processing..."
				disabled={inputEthErr === true}
				onClick={() => {
					if (inputEthErr === true || inputEthBn.isZero()) {
						return;
					}

					setSwapLoading(true);

					const fnSig = getFunctionSignature("deposit()");

					sendTransaction({
						to: configs.Token,
						value: inputEthBn,
						data: fnSig,
					});
				}}
				style={{
					marginTop: 5,
				}}
				title="Swap"
			/>
			<Text
				marginTop={1}
				fontSize={14}
			>{`Need test ETH? Try a faucet`}</Text>
			<Flex>
				<Text
					_hover={{ cursor: "pointer" }}
					onClick={() => {
						if (window) {
							window.open("https://faucet.paradigm.xyz/");
						}
					}}
					textDecoration="underline"
					fontSize={14}
				>
					{`here`}
				</Text>
				<Text fontSize={14} marginLeft={1} marginRight={1}>{`or`}</Text>
				<Text
					_hover={{ cursor: "pointer" }}
					onClick={() => {
						if (window) {
							window.open("https://faucet.rinkeby.io/");
						}
					}}
					textDecoration="underline"
					fontSize={14}
				>
					{`here`}
				</Text>
			</Flex>
		</Flex>
	);
}

export default WETHSwapper;
