import React from "react";
import ReactDOM from "react-dom";

import { MoralisProvider } from "react-moralis";
import { MoralisDappProvider } from "./providers/MoralisDappProvider/MoralisDappProvider";

import "./index.css";
import App from './App';
import reportWebVitals from "./reportWebVitals";

const APP_ID = process.envv.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
// Connect to the test server
console.log(APP_ID)
console.log(SERVER_URL)

ReactDOM.render(
    <MoralisProvider apId={APP_ID} serverUrl={SERVER_URL}>
        <MoralisDappProvider>
            <App />
        </MoralisDappProvider>
    </MoralisProvider>,
    document.getElementById("root")
)