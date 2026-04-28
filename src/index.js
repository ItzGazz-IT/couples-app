import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<ErrorBoundary>
		<App />
	</ErrorBoundary>
);

// Register service worker for PWA support
if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/couples-app/service-worker.js").catch((err) => {
		console.log("Service worker registration failed:", err);
	});
}