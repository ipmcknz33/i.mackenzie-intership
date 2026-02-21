import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
  duration: 1400,
  easing: "ease-out-cubic",
  offset: 200,
  once: true,
});

ReactDOM.render(
  <App />,
  document.getElementById("root")
);

reportWebVitals();