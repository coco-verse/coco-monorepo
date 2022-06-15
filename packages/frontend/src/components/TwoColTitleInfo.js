import { Text, Flex, Spacer } from "@chakra-ui/react";
import InfoTip from "./InfoTip";

function TwoColTitleInfo({
	title,
	info,
	helpText = "",
	titleBold = false,
	...props
}) {
	return (
		<Flex {...props} alignItems={"center"}>
			<Text fontSize={14} fontWeight={titleBold ? "bold" : "normal"}>
				{title}
			</Text>
			{helpText != "" ? (
				<InfoTip
					style={{
						height: 10,
						width: 10,
						color: "#6F6F6F",
						marginLeft: 4,
					}}
					infoText={helpText}
				/>
			) : undefined}
			<Spacer />
			<Text fontSize={14}>{info}</Text>
		</Flex>
	);
}
export default TwoColTitleInfo;
