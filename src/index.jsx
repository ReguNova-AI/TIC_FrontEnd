import React from "react";
import ReactDOM from "react-dom/client";

// project import
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./global.css";

// NOTE: simplebar-react CSS removed — SimpleBar.jsx now uses native CSS scrollbar

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
reportWebVitals();
