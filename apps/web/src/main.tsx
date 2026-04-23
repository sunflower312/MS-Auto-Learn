import React from "react";
import ReactDOM from "react-dom/client";

import { Providers } from "./app/providers";
import { RootApp } from "./app/root-app";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing root element.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Providers>
      <RootApp />
    </Providers>
  </React.StrictMode>,
);
