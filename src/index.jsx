import React from "react";
import ReactDOM from "react-dom/client";

// scroll bar
import "simplebar-react/dist/simplebar.min.css";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// project import
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
reportWebVitals();
