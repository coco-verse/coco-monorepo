import PostDisplay from "../components/PostDisplay";
import { Text, Flex } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import {} from "../hooks";

import { useEffect, useState } from "react";
import { findPosts, COLORS } from "../utils";
import {} from "../redux/reducers";
import { useDispatch, useSelector } from "react-redux";
import { resolvePath, useLocation, useNavigate, useParams } from "react-router";

import WETHSwapper from "../components/WETHSwapper";
import MetadataDisplay from "../components/MetadataDisplay";

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
		console.log(res);
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
