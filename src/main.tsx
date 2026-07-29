import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const url = new URL(window.location.href);
const spaPath = url.searchParams.get("spa");

if (spaPath) {
  window.history.replaceState({}, "", decodeURIComponent(spaPath));
}

createRoot(document.getElementById("root")!).render(<App />);
