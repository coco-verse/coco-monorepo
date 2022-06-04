import PostDisplay from "../components/PostDisplay";
import { Text, Flex } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";
import {} from "../hooks";

import { useEffect, useState } from "react";
import { findPosts, COLORS } from "../utils";
import {} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { resolvePath, useLocation, useNavigate, useParams } from "react-router";

import WETHSwapper from "../components/WETHSwapper";
import MetadataDisplay from "../components/MetadataDisplay";
import HelpBox from "../components/HelpBox";

function Page() {
	const navigate = useNavigate();

	const { account } = useEthers();

	// const badMarketIdentifiers = useSelector(selectBadMarketIdentifiers);

	const location = useLocation();
	const urlParams = useParams();

	const [posts, setPosts] = useState([]);

	// get all posts depending on feedType
	useEffect(async () => {
		const res = await findPosts(
			{},
			{
				createdAt: -1,
			}
		);
		if (res == undefined) {
			return;
		}
		setPosts(res.posts);
	}, []);

	// infinite scroll
	// const { observe } = useInView({
	// 	rootMargin: "30px",
	// 	// When the last item comes to the viewport
	// 	onEnter: ({ unobserve }) => {
	// 		unobserve();
	// 		setLoadingMarkets(true);
	// 		setPagination({
	// 			first: FEED_BATCH_COUNT,
	// 			skip: markets.length,
	// 		});
	// 	},
	// });

	function HelperOption({ text, onClick }) {
		return (
			<Flex
				_hover={{ cursor: "pointer", textDecoration: "underline" }}
				paddingTop={2}
				paddingBottom={2}
				fontWeight={"semibold"}
			>
				<Text onClick={onClick} fontSize={15}>
					{text}
				</Text>
			</Flex>
		);
	}

	return (
		<Flex width={"100%"}>
			<Flex
				flexDirection="column"
				width={"70%"}
				padding={5}
				minHeight="100vh"
			>
				{posts.length == 0 ? (
					<Flex
						padding={2}
						backgroundColor={COLORS.PRIMARY}
						borderRadius={8}
						marginBottom={4}
						flexDirection={"column"}
					>
						<Text fontSize={15}>
							Nothing to Show... Try adding a link? ;)
						</Text>
					</Flex>
				) : undefined}
				{posts.map((post, index) => {
					return (
						<Flex
							padding={2}
							backgroundColor={COLORS.PRIMARY}
							borderRadius={8}
							marginBottom={4}
							flexDirection={"column"}
						>
							<MetadataDisplay
								metadata={post.metadata}
								url={post.post.url}
								onClick={() => {
									navigate(
										`/post/${post.post.marketIdentifier}`
									);
								}}
							/>
						</Flex>
					);
				})}
			</Flex>
			<Flex flexDirection="column" width={"30%"} paddingTop={5}>
				<WETHSwapper />
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
				<Flex
					flexDirection="column"
					padding={2}
					backgroundColor={COLORS.PRIMARY}
					borderRadius={8}
					marginBottom={4}
				>
					<HelperOption
						text="Send Feedback"
						onClick={() => {
							window.open(
								"https://airtable.com/shrsVVVLBuawaCDvE",
								"_blank"
							);
						}}
					/>
					<HelperOption
						text="Join COCO on TG"
						onClick={() => {
							window.open("https://t.me/cocoverse", "_blank");
						}}
					/>
				</Flex>
			</Flex>
		</Flex>
	);
}

export default Page;
