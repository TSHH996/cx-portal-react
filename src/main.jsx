import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const baseUrl = import.meta.env.BASE_URL || "/";
const routerBasename = baseUrl === "/" ? "/" : baseUrl.replace(/\/$/, "");

const redirect = new URLSearchParams(window.location.search).get("redirect");
if (redirect) {
  const target = new URL(redirect, window.location.origin);
  window.history.replaceState(null, "", `${target.pathname}${target.search}${target.hash}`);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
