import { Avatar, Box, Flex, Image, Spacer, Text, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { COLORS, sliceAddress } from "../utils";

function PostDisplay({ post }) {
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
				<Text fontSize={14} marginBottom={2} fontWeight="bold">
					By {sliceAddress(post.creatorAddress)}
				</Text>
				{urlMetadata.title && urlMetadata.title != "" ? (
					<Text fontSize={18} marginBottom={1} fontWeight="bold">
						{urlMetadata.title}
					</Text>
				) : undefined}
				<Link href={urlMetadata.url} marginBottom={1} isExternal>
					{urlMetadata.url}
					<ExternalLinkIcon mx="2px" />
				</Link>
				{urlMetadata.author && urlMetadata.author != "" ? (
					<Text fontSize={16} marginBottom={1}>
						author: {urlMetadata.author}
					</Text>
				) : undefined}
			</Flex>
		</Box>
	);
}

export default PostDisplay;
