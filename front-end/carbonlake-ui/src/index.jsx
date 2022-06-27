import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import App from "./pages/App";

import Amplify from 'aws-amplify';
import {existingAPI, existingAuth} from './amplify-config';

Amplify.configure(existingAuth)
Amplify.configure(existingAPI)

ReactDOM.render(
  // <HashRouter>
  //   <App />
  // </HashRouter>,
  <React.StrictMode>
  <App />
</React.StrictMode>,
  document.getElementById("root")
);
