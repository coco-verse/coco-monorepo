import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { DAppProvider } from '@usedapp/core';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { mode } from '@chakra-ui/theme-tools';
import { BrowserRouter as Router } from 'react-router-dom';
import { createClient, Provider as URQLProvider } from 'urql';
import { configs } from './contracts';

// setting up theGraph's endpoint
const client = createClient({
  url: (() => {
    if (process.env.REACT_APP_VERCEL_ENV == 'DEVELOPMENT') {
      return 'https://reddit.graph.cocoverse.club/subgraphs/name/pm';
    } else if (process.env.REACT_APP_VERCEL_ENV == 'STAGING') {
      return 'https://reddit.main.cocoverse.club/graph/subgraphs/name/cocoverse/coco-staging';
    } else if (process.env.REACT_APP_VERCEL_ENV == 'PRODUCTION') {
      return 'https://reddit.main.cocoverse.club/graph/subgraphs/name/cocoverse/coco-production';
    } else {
      return 'https://reddit.graph.cocoverse.club/subgraphs/name/pm';
    }
  })(),
});

// chakra ui theme
const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: mode('#edf2f7', '#edf2f7')(props),
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
            readOnlyChainId: configs.chainId,
            readOnlyUrls: {
              [configs.chainId]: configs.chainRPC,
            },
            multicallAddresses: {
              [configs.chainId]: configs.multicallAddress,
            },
            bufferGasLimitPercentage: 21000,
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
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
