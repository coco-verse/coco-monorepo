import { useDispatch, useSelector } from "react-redux";
import {
	selectLoginModalState,
	sUpdateLoginModalIsOpen,
} from "../redux/reducers";
import {
	Flex,
	Spacer,
	Heading,
	Modal,
	ModalOverlay,
	ModalContent,
	Image,
	Text,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useEthers } from "@usedapp/core";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import { createHotAccount, getAccountNonce, loginUser } from "../utils";
import { useNavigate } from "react-router";
import MetamaskFox from "./../metamask_fox.svg";
import { configs } from "../contracts";
import { hexlify } from "ethers/lib/utils";

function LoginModal() {
	const dispatch = useDispatch();

	const isOpen = useSelector(selectLoginModalState).isOpen;
	const { activateBrowserWallet, account } = useEthers();
	const [chainId, setChainId] = useState(null);

	useEffect(() => {
		(
			async () => {
				if (window.ethereum) {
					console.log("USEEFFECT CHAIN ID");
					// get chainId for the first time
					const id = await window.ethereum.request({
						method: "eth_chainId",
					});
					setChainId(parseInt(id, 16));
		
					// attach listener that updates chainId whenever it changes
					window.ethereum.on("chainChanged", (id) => {
						setChainId(parseInt(id, 16));
					});
				}
			}
		)()
	}, []);

	useEffect(() => {
		if (account) {
			dispatch(sUpdateLoginModalIsOpen(false));
		}
	}, [account, dispatch])

	return (
		<Modal
			isOpen={isOpen}
			onClose={() => {
				dispatch(sUpdateLoginModalIsOpen(false));
			}}
		>
			<ModalOverlay />
			<ModalContent
				paddingLeft={5}
				paddingRight={5}
				paddingTop={3}
				paddingBottom={8}
			>
				<Flex
					paddingLeft={2}
					paddingRight={2}
					paddingTop={2}
					paddingBottom={2}
					alignItems="center"
					borderBottomWidth={1}
					borderColor="#E0E0E0"
				>
					<Heading size="xl">Connect to COCO</Heading>
					<Spacer />
					<CloseIcon
						onClick={() => {
							dispatch(sUpdateLoginModalIsOpen(false));
						}}
						marginRight={2}
						w={3}
						h={3}
						color="#0B0B0B"
					/>
				</Flex>

				<Flex
					style={{
						backgroundColor: "#F3F5F7",
						borderRadius: 8,
						marginTop: 20,
						paddingTop: 40,
						paddingBottom: 40,
						justifyContent: "center",
						alignItems: "center",
					}}
					flexDirection="column"
				>
					<Image width="30%" src={MetamaskFox} />
					<Heading size="xl">Metamask</Heading>

					{chainId === configs.chainId ? (
						<Text
							style={{
								...styles.actionText,
							}}
							onClick={activateBrowserWallet}
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						>
							Connect your wallet
						</Text>
					) : undefined}
					{account && <p>Account: {account}</p>}
					{chainId !== configs.chainId ? (
						<Text
							style={{
								...styles.actionText,
							}}
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
							onClick={async () => {
								if (window.ethereum) {
									await window.ethereum.request({
										method: "wallet_addEthereumChain",
										params: [
											{
												chainId: hexlify(
													configs.chainId
												),
												chainName: configs.chainName,
												nativeCurrency: {
													name: "Ethereum",
													symbol: "ETH",
													decimals: 18,
												},
												rpcUrls: [configs.chainRPC],
												blockExplorerUrls: [
													configs.blocExplorerUri,
												],
											},
										],
									});
								}
							}}
						>
							Switch to Rinkeby-Arbitrum
						</Text>
					) : undefined}
				</Flex>

				{/* TODO I cannot recall what was in palce of `true`, but it was something important  */}
				{chainId === -1 || true ? (
					<Flex
						justifyContent="center"
						paddingTop={5}
						alignItems="center"
					>
						<Text
							marginRight={1}
							color="#337DCF"
							fontSize={18}
							onClick={async () => {
								window.open(
									"https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
								);
							}}
							_hover={{
								cursor: "pointer",
								textDecoration: "underline",
							}}
						>
							Get Metamask
						</Text>
						<ExternalLinkIcon
							marginLeft={1}
							height={18}
							color="#337DCF"
						/>
					</Flex>
				) : undefined}
			</ModalContent>
		</Modal>
	);
}

const styles = {
	actionText: {
		fontSize: 28,
		color: "#828282",
		marginTop: 10,
	},
};

export default LoginModal;
