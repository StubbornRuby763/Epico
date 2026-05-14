import React from "react";
import { createRoot } from "react-dom/client";
import { LoginWith } from "./components/LogWith.js";

const Logwith = () => {
  return <LoginWith />;
};

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Logwith />
    </React.StrictMode>,
  );
}
