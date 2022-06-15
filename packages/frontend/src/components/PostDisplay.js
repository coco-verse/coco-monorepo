import { Avatar, Box, Flex, Image, Spacer, Text, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { COLORS, sliceAddress } from "../utils";

function PostDisplay({ post }) {
	const navigate = useNavigate();
	const urlMetadata = post ? JSON.parse(post.urlMetadata) : undefined;

	if (!urlMetadata) {
		return <div />;
	}

	return (
		<Box
			backgroundColor={COLORS.PRIMARY}
			padding={4}
			borderRadius={4}
			marginBottom={4}
		>
			<Flex marginBottom={2} flexDirection={"column"}>
				<div
					onClick={() => {
						navigate(`/post/${post.marketIdentifier}`);
					}}
				>
					<Text
						_hover={{ cursor: "pointer" }}
						fontSize={14}
						marginBottom={2}
						fontWeight="bold"
					>
						By {sliceAddress(post.creatorAddress)}
					</Text>
					{urlMetadata.title && urlMetadata.title != "" ? (
						<Text
							_hover={{ cursor: "pointer" }}
							fontSize={18}
							marginBottom={1}
							fontWeight="bold"
						>
							{urlMetadata.title}
						</Text>
					) : undefined}
				</div>
				<Link href={urlMetadata.url} marginBottom={1} isExternal>
					{urlMetadata.url}
					<ExternalLinkIcon mx="2px" />
				</Link>
			</Flex>
		</Box>
	);
}

export default PostDisplay;
