import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import App from "./pages/App";

ReactDOM.render(
  // <HashRouter>
  //   <App />
  // </HashRouter>,
  <React.StrictMode>
  <App />
</React.StrictMode>,
  document.getElementById("root")
);