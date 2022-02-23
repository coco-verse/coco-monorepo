import { Text, Flex, Spacer } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core/packages/core";
import { useState } from "react";
import { CloseIcon } from "@chakra-ui/icons";
function Component() {
	const { chainId } = useEthers();

	const [close, setClose] = useState(false);

	if (chainId != 421611 && !close) {
		return (
			<Flex alignItems="center" bg="red.200" paddingRight={1}>
				<Spacer />
				<Text fontSize={20}>
					Please connect to Rinkeby-Arbitrum Network
				</Text>
				<Spacer />
				<CloseIcon
					fontSize={12}
					onClick={() => {
						setClose(true);
					}}
				/>
			</Flex>
		);
	} else {
		return <div />;
	}
}

export default Component;
