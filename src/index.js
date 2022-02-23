import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { DAppProvider } from "@usedapp/core/packages/core";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { mode } from "@chakra-ui/theme-tools";
import { BrowserRouter as Router } from "react-router-dom";
import { createClient, Provider as URQLProvider } from "urql";

// setting up theGraph's endpoint
const client = createClient({
	url:
		"https://api.thegraph.com/subgraphs/name/janmajayamall/pm-content-test",
});

// chakra ui theme
const theme = extendTheme({
	styles: {
		global: (props) => ({
			body: {
				bg: mode("#edf2f7", "#edf2f7")(props),
			},
		}),
	},
});

ReactDOM.render(
	<React.StrictMode>
		<URQLProvider value={client}>
			<Provider store={store}>
				<DAppProvider
					config={{
						supportedChains: [421611],
						// multicallAddresses: {
						// 	421611: "0xed53fa304E7fcbab4E8aCB184F5FC6F69Ed54fF6",
						// },
						readOnlyUrls: {
							421611: "https://rinkeby.arbitrum.io/rpc",
						},
					}}
				>
					<ChakraProvider theme={theme}>
						<Router>
							<App />
						</Router>
					</ChakraProvider>
				</DAppProvider>
			</Provider>
		</URQLProvider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
