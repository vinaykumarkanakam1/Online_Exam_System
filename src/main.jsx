import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles/style.css";
import appScript from "./legacy/app.js?raw";
import adminScript from "./legacy/admin.js?raw";
import studentScript from "./legacy/student.js?raw";
import resultScript from "./legacy/result.js?raw";

const pageScripts = {
  "index.html": [appScript],
  "admin.html": [appScript, adminScript],
  "student.html": [appScript, studentScript],
  "result.html": [appScript, resultScript],
};

function App() {
  const template = document.getElementById("page-template");
  const page = window.location.pathname.split("/").pop() || "index.html";

  useEffect(() => {
    for (const source of pageScripts[page] ?? pageScripts["index.html"]) {
      const script = document.createElement("script");
      script.textContent = source;
      document.body.appendChild(script);
    }

    document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
  }, [page]);

  return (
    <div
      id="legacy-page"
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: template?.innerHTML ?? "" }}
    />
  );
}

createRoot(document.getElementById("root")).render(<App />);