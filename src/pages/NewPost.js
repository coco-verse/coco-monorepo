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
	getPresignedUrl,
	validateCreationAmount,
	useBNInput,
	CURR_SYMBOL,
	uploadImageFile,
	GRAPH_BUFFER_MS,
	findGroups,
	CREATION_AMOUNT,
	postSignTypedDataV4Helper,
	TWO_BN,
	ONE_BN,
	COLORS,
	validatePostTitle,
	validateLinkURL,
	validatePostAuthor,
	getMarketIdentifierOfUrl,
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

	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [link, setLink] = useState(
		urlParams.url ? decodeURIComponent(urlParams.url) : ""
	);

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

			// validate title AND author
			if (
				!addresses.Group ||
				addresses.Group == "" ||
				validatePostTitle(title).valid == false ||
				validatePostAuthor(author).valid == false ||
				validateLinkURL(link).valid == false
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

			const marketIdentifier = getMarketIdentifierOfUrl(link);

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
				url: link,
				urlMetadata: JSON.stringify({
					url: link,
					title: title,
					author: author,
				}),
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
					<Heading size="md">Add your link</Heading>
				</Flex>
				<Flex
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					flexDirection={"column"}
				>
					{InputWithTitle(
						"Title",
						0,
						title,
						title,
						setTitle,
						validatePostTitle,
						{}
					)}

					{InputWithTitle(
						"Author",
						0,
						author,
						author,
						setAuthor,
						validatePostAuthor,
						{}
					)}

					{InputWithTitle(
						"Link URL",
						0,
						link,
						link,
						setLink,
						validateLinkURL,
						{}
					)}
					<Link fontSize={12} href={link} isExternal>
						{"Visit link"}
						<ExternalLinkIcon mx="2px" />
					</Link>

					<PrimaryButton
						title={"Post"}
						isLoading={newPostLoading}
						loadingText="Processing..."
						onClick={postHelper}
						style={{
							marginTop: 20,
							flexDirection: "row",
						}}
					/>
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
