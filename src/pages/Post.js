import {
	Text,
	Flex,
	Spacer,
	HStack,
	NumberInput,
	NumberInputField,
	useToast,
	Heading,
	Select,
	Link,
} from "@chakra-ui/react";

import { useEthers } from "@usedapp/core/packages/core";
import { useEffect } from "react";
import { useState } from "react";
import {
	useBuyMinOutcomeTokensWithFixedAmount,
	useChallenge,
	useCreateAndChallengeMarket,
	useERC1155ApprovalForAll,
	useERC20TokenAllowanceWrapper,
	useERC20TokenBalance,
	useQueryMarketByMarketIdentifier,
	useQueryMarketTradeAndStakeInfoByUser,
	useQueryUserPositionsByMarketIdentifier,
	useGetSafesAndGroupsManagedByUser,
	useRedeem,
} from "../hooks";
import {
	formatTimeInSeconds,
	ZERO_BN,
	findPostsByMarketIdentifierArr,
	useBNInput,
	formatBNToDecimalCurr,
	formatBNToDecimal,
	TWO_BN,
	ONE_BN,
	parseDecimalToBN,
	formatDecimalToCurr,
	formatMarketData,
	calculateRedeemObj,
	COLORS,
	GRAPH_BUFFER_MS,
	createSetOutcomeTx,
	createSafeTx,
} from "../utils";
import PostDisplay from "../components/PostDisplay";
import { useParams } from "react-router";
import PrimaryButton from "../components/PrimaryButton";
import ChallengeHistoryTable from "../components/ChallengeHistoryTable";
import { addresses } from "../contracts";
import ApprovalInterface from "../components/ApprovalInterface";
import TwoColTitleInfo from "../components/TwoColTitleInfo";
import HelpBox from "../components/HelpBox";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import MetadataDisplay from "../components/MetadataDisplay";

function Page() {
	const urlParams = useParams();
	const postId = urlParams.postId ? urlParams.postId : undefined;
	// const postId =
	// 	"0xd8f23d7fd4c7fd7e97ddfb9a846f7ad112f37b7478ca26685dcefc2f9acf01e4";

	const { account, chainId } = useEthers();

	const toast = useToast();

	// CA - You might need to trigger this
	const {
		result: rUserPositions,
		reexecuteQuery: reUserPositions,
	} = useQueryUserPositionsByMarketIdentifier(
		account ? account.toLowerCase() : undefined,
		postId,
		false
	);

	const [linkMetadata, setLinkMetadata] = useState(null);
	const [post, setPost] = useState(null);
	// main market data
	// contains a flag whether it is on-chain or off-chain
	const [marketData, setMarketData] = useState(null);

	// state of the market
	// 0 -> hasn't been created
	// 1 -> buffer period
	// 2 -> resolution period
	// 3 -> expired
	const [marketState, setMarketState] = useState(0);

	// challenge states
	const [groupAddress, setGroupAddress] = useState(null);
	const [marketIdentifier, setMarketIdentifier] = useState(null);
	const [temporaryOutcome, setTemporaryOutcome] = useState(1);
	const [currentAmountBn, setCurrentAmountBn] = useState(ZERO_BN);
	const [timeLeftToChallenge, setTimeLeftToChallenge] = useState(null);
	const [timeLeftToResolve, setTimeLeftToResolve] = useState(null);

	// state for redeem
	// user's stakes
	const [userPositions, setUserPositions] = useState(null);

	// State for set outcome propose tx,
	// if user is one of the moderators
	const [chosenOutcome, setChosenOutcome] = useState(null);

	// stake history
	const [stakes, setStakes] = useState([]);

	const { input, bnValue, setInput, err, errText } = useBNInput(
		validateInput
	);

	// contract function calls
	const {
		send: sendCreateAndChallenge,
		state: stateCreateAndChallenge,
	} = useCreateAndChallengeMarket();
	const { send: sendChallenge, state: stateChallenge } = useChallenge();
	const { send: sendRedeem, state: stateRedeem } = useRedeem(groupAddress);

	const { result, reexecuteQuery } = useQueryMarketByMarketIdentifier(
		postId,
		false
	);

	// check WETH balance and allowance
	const wETHTokenBalance = useERC20TokenBalance(account, addresses.WETH);
	const wETHTokenAllowance = useERC20TokenAllowanceWrapper(
		addresses.WETH,
		account,
		addresses.GroupRouter,
		bnValue
	);

	// get safes & groups managed by the user
	const { safes, groupIds } = useGetSafesAndGroupsManagedByUser(account);

	// flag indicates whether post's
	// groupAddress is managed
	// by the user
	const isUserAnOwner =
		groupIds.find(
			(id) =>
				post != undefined &&
				id.toLowerCase() == post.groupAddress.toLowerCase()
		) != undefined
			? true
			: false;

	// loading state of contrct fn calls
	const [contractFnCallLoading, setContractFnCallLoading] = useState(false);

	useEffect(() => {
		// check whether market exists on chain
		if (result.data && result.data.market) {
			// market exists on chain
			const _marketData = formatMarketData(result.data.market, true);

			setGroupAddress(_marketData.group.id);
			setMarketIdentifier(_marketData.marketIdentifier);
			setTemporaryOutcome(_marketData.outcome);
			setCurrentAmountBn(_marketData.lastAmountStaked);

			// set market state and, if applicable, time left for either challenge or resolution
			let timestamp = new Date() / 1000;

			if (_marketData.donBufferEndsAt - timestamp > 0) {
				// state is in buffer period
				setMarketState(1);
				setTimeLeftToChallenge(_marketData.donBufferEndsAt - timestamp);
			} else if (_marketData.resolutionBufferEndsAt - timestamp > 0) {
				// state is in resolution period
				setMarketState(2);
				setTimeLeftToResolve(
					_marketData.resolutionBufferEndsAt - timestamp
				);
			} else {
				// state expired
				setMarketState(3);
			}

			// set stakes history
			setStakes(_marketData.stakes);

			// set min amount to challenge as input amount
			setInput(
				formatBNToDecimal(_marketData.lastAmountStaked.mul(TWO_BN))
			);

			// set market data
			setMarketData({
				..._marketData,
				onChain: true,
			});
		} else if (post != null) {
			// market does not exists on chain
			// populate challenge using creator's market data obj
			const _marketData = formatMarketData(
				JSON.parse(post.marketData),
				false
			);

			setGroupAddress(_marketData.group);
			setMarketIdentifier(_marketData.marketIdentifier);
			setTemporaryOutcome(1);
			setCurrentAmountBn(_marketData.amount1);

			// set market state to 0
			setMarketState(0);

			// set min amount to challenge as input amount
			setInput(formatBNToDecimal(_marketData.amount1.mul(TWO_BN)));

			// set market data
			setMarketData({
				..._marketData,
				onChain: false,
			});
		}
	}, [result, post]);

	// set user postions
	useEffect(() => {
		if (
			rUserPositions.data &&
			rUserPositions.data.userPositions.length != 0
		) {
			setUserPositions({
				...rUserPositions.data.userPositions[0],
				amount0: parseDecimalToBN(
					rUserPositions.data.userPositions[0].amount0
				),
				amount1: parseDecimalToBN(
					rUserPositions.data.userPositions[0].amount1
				),
			});
		}
	}, [rUserPositions]);

	// get post details using postId;
	// note: postId == marketIdentifier
	useEffect(async () => {
		let res = await findPostsByMarketIdentifierArr([postId]);
		if (res == undefined || res.posts.length == 0) {
			// TODO set error
			return;
		}
		console.log(res.posts[0]);
		setPost(res.posts[0].post);
		setLinkMetadata(res.posts[0].metadata);
	}, [postId]);

	// tracks loading state of contract fn calls
	useEffect(() => {
		if (
			stateCreateAndChallenge.status == "Success" ||
			stateChallenge.status == "Success" ||
			stateRedeem.status == "Success"
		) {
			setTimeout(() => {
				setContractFnCallLoading(false);
				window.location.reload();
			}, GRAPH_BUFFER_MS);
		} else if (
			stateCreateAndChallenge.status == "Fail" ||
			stateChallenge.status == "Fail" ||
			stateRedeem.status == "Fail" ||
			stateCreateAndChallenge.status == "Exception" ||
			stateChallenge.status == "Exception" ||
			stateRedeem.status == "Exception"
		) {
			toast({
				title: "Metamask err!",
				status: "error",
				isClosable: true,
			});
			setContractFnCallLoading(false);
		}
	}, [stateCreateAndChallenge, stateChallenge, stateRedeem]);

	// whenever wEthBalance changes, refresh the input
	useEffect(() => {
		if (wETHTokenBalance != undefined) {
			setInput(input);
		}
	}, [wETHTokenBalance]);

	function validateInput(bnValue) {
		// check bnValue is not zero
		if (bnValue.isZero()) {
			return {
				valid: false,
				expStr: "Challenge amount should be greater than 0",
			};
		}

		// check bnValue is gte currentAmountBn * 2
		if (!bnValue.gte(currentAmountBn.mul(TWO_BN))) {
			return {
				valid: false,
				expStr: `Challenge amount should be atleast ${formatBNToDecimalCurr(
					currentAmountBn.mul(TWO_BN)
				)}`,
			};
		}

		// check bnValue is lte tokenBalance
		if (wETHTokenBalance == undefined || !bnValue.lte(wETHTokenBalance)) {
			return {
				valid: false,
				expStr: "Insufficient Balance",
			};
		}

		return {
			valid: true,
			expStr: "",
		};
	}

	async function setOutcomeHelper() {
		// throw if user isn't authenticated
		if (!account || isUserAnOwner == false) {
			toast({
				title: "Invalid request!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		// throw if outcome to delare is not chosen
		if (
			chosenOutcome == undefined ||
			chosenOutcome < 0 ||
			chosenOutcome > 1
		) {
			toast({
				title: "Please chose an outcome!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		// throw if any of necessary values are missing
		if (
			marketData.onChain == false ||
			marketData.group.id == undefined ||
			marketData.group.manager == undefined ||
			account == undefined
		) {
			toast({
				title: "Invalid Inputs!",
				status: "error",
				isClosable: true,
			});
			return;
		}

		const calldata = createSetOutcomeTx(chosenOutcome, marketData.id);

		await createSafeTx(
			marketData.group.id,
			calldata,
			0,
			marketData.group.manager,
			account
		);
	}

	return (
		<Flex width={"100%"}>
			<Flex width="70%" flexDirection={"column"} padding={5}>
				{/* {loadingMarket == true ? <Loader /> : undefined} */}
				{/* <PostDisplay post={post} /> */}
				{post != undefined ? (
					<Flex
						flexDirection={"column"}
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						marginBottom={4}
					>
						<MetadataDisplay
							metadata={linkMetadata}
							url={post.url}
						/>
					</Flex>
				) : undefined}
				<ChallengeHistoryTable stakes={stakes} />
			</Flex>
			<Flex width="30%" flexDirection={"column"} paddingTop={5}>
				<Flex
					flexDirection={"column"}
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={4}
				>
					{marketState < 2 ? (
						<>
							<Heading size="sm" marginBottom={2}>
								Challenge Link
							</Heading>
							<TwoColTitleInfo
								title={"Temporary outcome:"}
								info={temporaryOutcome == 1 ? "YES" : "NO"}
							/>
							<TwoColTitleInfo
								title={"Min. Amount to Challenge:"}
								info={`${formatBNToDecimalCurr(
									currentAmountBn.mul(TWO_BN)
								)}`}
							/>
							{timeLeftToChallenge != undefined ? (
								<TwoColTitleInfo
									title={"Time left to challenge:"}
									info={`${formatTimeInSeconds(
										timeLeftToChallenge
									)}`}
								/>
							) : undefined}
							<NumberInput
								onChange={(val) => {
									setInput(val);
								}}
								placeholder="Amount"
								fontSize={14}
								value={input}
								marginTop={3}
							>
								<NumberInputField />
							</NumberInput>
							{err === true ? (
								<Text
									marginTop="1"
									marginBottom="1"
									fontSize="10"
									fontWeight="bold"
									color="red.300"
								>
									{errText}
								</Text>
							) : undefined}
							<PrimaryButton
								loadingText="Processing..."
								isLoading={contractFnCallLoading}
								disabled={!account || !wETHTokenAllowance}
								onClick={() => {
									if (!account || !wETHTokenAllowance) {
										return;
									}

									const newOutcome = 1 - temporaryOutcome;

									// validate values
									if (
										!validateInput(bnValue).valid ||
										groupAddress == undefined ||
										newOutcome > 1 ||
										newOutcome < 0 ||
										marketIdentifier == undefined ||
										marketData == undefined
									) {
										// TODO throw error
										return;
									}

									if (marketData.onChain == true) {
										// call challenge
										sendChallenge(
											groupAddress,
											marketIdentifier,
											newOutcome,
											bnValue
										);
									} else {
										sendCreateAndChallenge(
											[
												marketData.group,
												marketData.marketIdentifier,
												marketData.amount1,
											],
											post.marketSignature,
											0,
											bnValue
										);
									}

									setContractFnCallLoading(true);
								}}
								title="Challenge"
								style={{
									marginTop: 5,
								}}
							/>
						</>
					) : undefined}
					{marketState == 2 ? (
						<>
							<Heading size="sm" marginBottom={2}>
								Link is under review
							</Heading>
							<TwoColTitleInfo
								title={"Time left for review:"}
								info={`${formatTimeInSeconds(
									timeLeftToResolve
								)}`}
							/>
						</>
					) : undefined}
					{marketState == 3 ? (
						<>
							<Heading size="sm" marginBottom={2}>
								Post Resolved
							</Heading>
							<TwoColTitleInfo
								title={"Final outcome:"}
								info={`${temporaryOutcome == 0 ? "NO" : "YES"}`}
								marginBottom={1}
							/>

							<Text fontSize={14} fontWeight="bold">
								Your challenges
							</Text>
							<TwoColTitleInfo
								title={"In favour of YES:"}
								info={`${formatBNToDecimalCurr(
									userPositions != undefined
										? userPositions.amount1
										: ZERO_BN
								)}`}
							/>
							<TwoColTitleInfo
								title={"In favour of NO:"}
								info={`${formatBNToDecimalCurr(
									userPositions != undefined
										? userPositions.amount0
										: ZERO_BN
								)}`}
								marginBottom={1}
							/>
							<TwoColTitleInfo
								title={"You win:"}
								info={`${formatBNToDecimalCurr(
									calculateRedeemObj(
										marketData,
										account,
										userPositions
									).wins
								)}`}
							/>
							<TwoColTitleInfo
								title={"You get back in total:"}
								info={`${formatBNToDecimalCurr(
									calculateRedeemObj(
										marketData,
										account,
										userPositions
									).total
								)}`}
								marginBottom={1}
							/>

							<PrimaryButton
								loadingText="Processing..."
								disabled={
									!account ||
									calculateRedeemObj(
										marketData,
										account,
										userPositions
									).total.eq(ZERO_BN)
								}
								isLoading={contractFnCallLoading}
								onClick={() => {
									if (
										!account ||
										calculateRedeemObj(
											marketData,
											account,
											userPositions
										).total.eq(ZERO_BN)
									) {
										return;
									}

									if (marketIdentifier == undefined) {
										return;
									}

									sendRedeem(marketIdentifier, account);
									setContractFnCallLoading(true);
								}}
								title="Redeeem"
								style={{
									marginTop: 5,
								}}
							/>
						</>
					) : undefined}
				</Flex>
				{marketState < 2 ? (
					<ApprovalInterface
						tokenType={0}
						erc20Address={addresses.WETH}
						erc20AmountBn={bnValue}
						onSuccess={() => {
							toast({
								title: "Success!",
								status: "success",
								isClosable: true,
							});
						}}
						onFail={() => {
							toast({
								title: "Metamask err!",
								status: "error",
								isClosable: true,
							});
						}}
					/>
				) : undefined}
				{isUserAnOwner == true && marketState == 2 ? (
					<Flex
						flexDirection={"column"}
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						marginBottom={4}
					>
						<Heading size="sm" marginBottom={1}>
							Declare Outcome
						</Heading>
						<Text fontSize={12} marginBottom={1}>
							You are seeing this because you are one of the
							moderators of the group
						</Text>
						<Text fontSize={12} marginBottom={1}>
							By clicking on Declare you propose a transaction to
							group's gnosis-safe.
						</Text>

						<Link
							marginBottom={1}
							fontSize={12}
							href={
								"https://cocosafeapp.efprivacyscaling.org/app/"
							}
							fontWeight={"semibold"}
							isExternal
						>
							{"Visit safe"}
							<ExternalLinkIcon mx="2px" />
						</Link>
						<Select
							onChange={(e) => {
								setChosenOutcome(e.target.value);
							}}
							value={chosenOutcome}
							placeholder="Choose outcome"
						>
							<option value={1}>YES</option>
							<option value={0}>NO</option>
						</Select>
						<PrimaryButton
							loadingText="Processing..."
							isLoading={contractFnCallLoading}
							disabled={
								isUserAnOwner == false || marketState != 2
							}
							onClick={setOutcomeHelper}
							title="Declare"
							style={{
								marginTop: 5,
							}}
						/>
					</Flex>
				) : undefined}

				<HelpBox
					heading={"COCO rules"}
					pointsArr={[
						`1. Any link posted to COCO should not contain misinformation/factually incorrect information.`,
						`2. Every link posted is supported with initial challenge of amount 0.05 WETH in favour of "YES" (i.e. the contents of the link follow point (1)). This acts as an incentive for someone that thinks otherwise to challenge the link.`,
						`3. If you think a link violates point (1), then challenge it by favouring "NO" (i.e. link violates point (1)). If you are right, you can potentailly win initial amount put in by link poster.`,
						`4. Subsequent challenges are allowed, as long as they are made before challenge period expires and amount put in is 2x the amount put in the last challenge.`,
						`5. If a challenge does not receives a challenge before time period expired, then the outcome favoured by the challenge is set as the final outcome`,
						`6. If total volume put in for challenges related to a link reach 50 WETH, the moderation committee steps in to declare the final outcome`,
						`7. Once final outcome is set, the last one to challenge in favour of final outcome wins the entire amount put in against the final outcome.`,
						`8. Anyone that had put in amount in favour of final outcome, irrespective of whether they were the last one to do so, get their amount back.`,
					]}
				/>
			</Flex>
		</Flex>
	);
}

export default Page;
