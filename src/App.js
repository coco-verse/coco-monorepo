import "./App.css";
import logo from "./logo.svg";
import {
	Button,
	Box,
	Text,
	Flex,
	Spacer,
	Switch,
	Heading,
	Image,
	Avatar,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	IconButton,
	Select,
} from "@chakra-ui/react";
import HeaderWarning from "./components/HeaderWarning";
import CocoFull from "./Coco-full.svg";
import { getUser, findAllFollows, COLORS, findAllGroups } from "./utils";
import { useLocation, Route, Routes, useNavigate } from "react-router";
import Post from "./pages/Post";
import MainMenu from "./components/MainMenu";
import ConnectButton from "./components/ConnectButton";
import LoginModal from "./components/LoginModal";
import NewPost from "./pages/NewPost";

function App() {
	const navigate = useNavigate();

	return (
		<div>
			<HeaderWarning />
			<Flex
				borderBottom="1px"
				borderColor="#BDBDBD"
				backgroundColor={COLORS.PRIMARY}
			>
				<Flex
					style={{
						width: "100%",
						justifyContent: "center",
						alignItems: "center",
						height: 96,
					}}
				>
					<Flex
						style={{
							width: "100%",
							height: "100%",
							maxWidth: 1650,
							justifyContent: "center",
							alignItems: "center",
							paddingLeft: 5,
							paddingRight: 5,
						}}
					>
						<Image
							_hover={{ cursor: "pointer" }}
							src={CocoFull}
							width={150}
							onClick={() => {
								navigate("/");
							}}
						/>

						<Spacer />
						<ConnectButton />
						<MainMenu />
					</Flex>
				</Flex>
			</Flex>
			<LoginModal />
			<Flex width={"100%"}>
				<Spacer />
				<Flex width={"70%"}>
					<Routes>
						<Route path="/" element={<></>} />
						<Route path="/post/:postId" element={<Post />} />
						<Route path="/new" element={<NewPost />} />
					</Routes>
				</Flex>
				<Spacer />
			</Flex>
		</div>
	);
}

export default App;
