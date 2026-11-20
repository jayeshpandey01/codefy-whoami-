import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { ThemeProvider } from "../src/components/ThemeContext.js";
import "../src/styles/tailwind.css";

// ?appearance=light|dark|system forces the preference (used for screenshots).
const forced = new URLSearchParams(window.location.search).get("appearance");
if (forced) {
  try {
    window.localStorage.setItem("codefy:theme", forced);
  } catch {
    // ignore: the harness still renders with the default
  }
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing #root element in dev/index.html");
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
