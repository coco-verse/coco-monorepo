import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	IconButton,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useEthers } from "@usedapp/core/packages/core";
import { useNavigate } from "react-router";

function Item({ title, ...children }) {
	return (
		<MenuItem
			textColor="#FDFDFD"
			_hover={{
				backgroundColor: "gray.700",
			}}
			{...children}
		>
			{title}
		</MenuItem>
	);
}

function MainMenu() {
	const { account } = useEthers();
	const isAuthenticated = account ? true : false;
	const navigate = useNavigate();

	return (
		<Menu>
			<MenuButton
				backgroundColor="#0B0B0B"
				_hover={{
					backgroundColor: "gray.700",
				}}
				as={IconButton}
				aria-label="Options"
				icon={<HamburgerIcon color="#FDFDFD" />}
				variant="outline"
			/>
			<MenuList backgroundColor="#0B0B0B">
				<Item
					onClick={() => {
						navigate("/");
					}}
					title={"Home"}
				/>
			</MenuList>
		</Menu>
	);
}

export default MainMenu;
