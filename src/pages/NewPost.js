import { useEffect, useState } from "react";
import {
	Select,
	Image,
	useToast,
	Flex,
	Spacer,
	Heading,
	Text,
	Box,
	Input,
	Link,
} from "@chakra-ui/react";

import {
	keccak256,
	newPost,
	CREATION_AMOUNT,
	postSignTypedDataV4Helper,
	TWO_BN,
	ONE_BN,
	COLORS,
	validatePostTitle,
	validateLinkURL,
	getMarketIdentifierOfUrl,
	findUrlsInfo,
	formatMetadata,
	findUrlName,
	QUERY_STATUS,
} from "./../utils";
import {
	useERC20TokenAllowanceWrapper,
	useERC20TokenBalance,
} from "./../hooks";
import { useEthers } from "@usedapp/core/packages/core";
import InputWithTitle from "../components/InputWithTitle";
import PrimaryButton from "../components/PrimaryButton";
import ApprovalInterface from "../components/ApprovalInterface";
import { addresses } from "../contracts";
import HelpBox from "../components/HelpBox";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router";
import MetadataDisplay from "../components/MetadataDisplay";

function Page() {
	const urlParams = useParams();
	const navigate = useNavigate();
	const { account, chainId } = useEthers();

	const toast = useToast();

	const wEthTokenBalance = useERC20TokenBalance(account, addresses.WETH);
	const wETHTokenAllowance = useERC20TokenAllowanceWrapper(
		addresses.WETH,
		account,
		addresses.GroupRouter,
		CREATION_AMOUNT.add(ONE_BN)
	);

	const [link, setLink] = useState(
		urlParams.url ? decodeURIComponent(urlParams.url) : ""
	);
	const [urlInfo, setUrlInfo] = useState(undefined);

	const [loadingMetadata, setLoadingMetadata] = useState(false);
	const [newPostLoading, setNewPostLoading] = useState(false);

	async function postHelper() {
		try {
			// throw error if user isn't authenticated
			if (!account) {
				toast({
					title: "Please connect you wallet!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			// start new post loading
			setNewPostLoading(true);

			// validate title
			if (
				!addresses.Group ||
				addresses.Group == "" ||
				urlInfo == undefined
			) {
				toast({
					title: "Invalid Input!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			// checks that token approval is given
			if (wETHTokenAllowance == false) {
				toast({
					title:
						"Please give WETH approval to app before proceeding!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			// checks that sufficient balance if present
			if (CREATION_AMOUNT.add(ONE_BN).gt(wEthTokenBalance)) {
				toast({
					title:
						"min. of 0.05 WETH required! Refer to rules on the side",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			const marketIdentifier = getMarketIdentifierOfUrl(urlInfo.url);

			// signature for on-chain market
			const { marketData, dataToSign } = postSignTypedDataV4Helper(
				addresses.Group,
				marketIdentifier,
				CREATION_AMOUNT.toString(),
				421611
			);
			const accounts = await window.ethereum.enable();
			const marketSignature = await window.ethereum.request({
				method: "eth_signTypedData_v3",
				params: [accounts[0], dataToSign],
			});

			// create new post request body
			let body = {
				creatorAddress: account.toLowerCase(),
				url: urlInfo.url,
				groupAddress: addresses.Group.toLowerCase(),
				marketSignature,
				marketData: JSON.stringify(marketData),
			};

			let res = await newPost(body);
			if (res == undefined) {
				toast({
					title: "Something went wrong!",
					status: "error",
					isClosable: true,
				});
				throw Error();
			}

			setNewPostLoading(false);

			// TODO NAVIGATE TO POST PAGE
			navigate(`/post/${marketIdentifier}`);
		} catch (e) {
			console.log(e, " error in the end");
			setNewPostLoading(false);
		}
	}

	async function getLinkMetadata() {
		if (validateLinkURL(link).valid == false) {
			return;
		}

		setLoadingMetadata(true);

		const res = await findUrlsInfo([link]);
		console.log(res);
		if (res == undefined || res.urlsInfo.length == 0) {
			return;
		}

		setUrlInfo(res.urlsInfo[0]);

		setLoadingMetadata(false);
	}

	return (
		<Flex width={"100%"}>
			<Flex width={"70%"} padding={5} flexDirection={"column"}>
				<Flex
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					justifyContent="flex-start"
					marginBottom={4}
				>
					<Heading size="md">Add new link</Heading>
				</Flex>
				<Flex
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					flexDirection={"column"}
					marginBottom={4}
				>
					{InputWithTitle(
						"Link",
						0,
						link,
						link,
						setLink,
						validateLinkURL,
						{}
					)}

					<PrimaryButton
						title={"Find Link"}
						isLoading={loadingMetadata}
						loadingText="Finding..."
						onClick={getLinkMetadata}
						style={{
							marginTop: 5,
							// flexDirection: "row",
						}}
					/>
				</Flex>
				<Flex
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					flexDirection={"column"}
				>
					{urlInfo == undefined ? (
						<Text>Nothing found...</Text>
					) : undefined}
					{urlInfo != undefined ? (
						<>
							<MetadataDisplay
								metadata={urlInfo.metadata}
								url={urlInfo.url}
							/>
							{urlInfo.qStatus == QUERY_STATUS.FOUND ? (
								<Flex
									justifyContent="center"
									paddingTop={5}
									alignItems="center"
								>
									<Text
										marginRight={1}
										color="#337DCF"
										fontSize={15}
										onClick={() => {
											window.open(
												`/post/${urlInfo.post.marketIdentifier}`
											);
										}}
										_hover={{
											cursor: "pointer",
											textDecoration: "underline",
										}}
									>
										Link already added. Vist on COCO
									</Text>
									<ExternalLinkIcon
										marginLeft={1}
										height={18}
										color="#337DCF"
									/>
								</Flex>
							) : undefined}
							{urlInfo.qStatus == QUERY_STATUS.NOT_FOUND ? (
								<PrimaryButton
									title={"Add link"}
									isLoading={newPostLoading}
									loadingText="Adding..."
									onClick={postHelper}
									style={{
										marginTop: 5,
									}}
								/>
							) : undefined}
						</>
					) : undefined}
					<ApprovalInterface
						marginTop={5}
						tokenType={0}
						erc20Address={addresses.WETH}
						erc20AmountBn={CREATION_AMOUNT.add(ONE_BN)}
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
				</Flex>
			</Flex>
			<Flex width="30%" paddingTop={5} flexDirection={"column"}>
				<HelpBox
					heading={"Posting to COCO"}
					pointsArr={[
						"1. Your post should be suitable for the group your are posting to.",
						"2. To post you need to put in 0.05 WETH for YES, so that others can challenge your post if required.",
						"3. Don't worry 0.05 WETH will only be deducted if someone challenges your post, otherwise nothing happens.",
						"4. If someone challenges and you think your post is still suitable for group, then challenge them back to win their amount.",
					]}
				/>
			</Flex>
		</Flex>
	);
}

export default Page;
