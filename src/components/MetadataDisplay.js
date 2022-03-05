import { Avatar, Box, Flex, Image, Spacer, Text, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { COLORS, sliceAddress, findUrlName, formatMetadata } from "../utils";

function MetadataDisplay({ metadata, url }) {
	const navigate = useNavigate();

	if (!metadata) {
		return (
			<Flex>
				<Text
					marginRight={1}
					color="#337DCF"
					fontSize={13}
					onClick={() => {
						window.open(url);
					}}
					_hover={{
						cursor: "pointer",
						textDecoration: "underline",
					}}
				>
					Unable to find information on link. Vist link here
				</Text>
				<ExternalLinkIcon marginLeft={1} height={18} color="#337DCF" />
			</Flex>
		);
	}

	return (
		<Flex flexDirection={"column"}>
			<Text fontWeight={"semibold"} fontSize={13}>
				{findUrlName(formatMetadata(metadata).url)}
			</Text>
			<Text fontSize={15} marginBottom={1}>
				{formatMetadata(metadata).title}
			</Text>
			<Text fontSize={13}>{formatMetadata(metadata).description}</Text>
			<Flex>
				<Text
					marginRight={1}
					color="#337DCF"
					fontSize={13}
					onClick={() => {
						window.open(url);
					}}
					_hover={{
						cursor: "pointer",
						textDecoration: "underline",
					}}
				>
					Visit link
				</Text>
				<ExternalLinkIcon marginLeft={1} height={18} color="#337DCF" />
			</Flex>
		</Flex>
	);
}

export default MetadataDisplay;
