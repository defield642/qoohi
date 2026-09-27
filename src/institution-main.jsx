import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import InstitutionApp from "./InstitutionApp.jsx";

createRoot(document.getElementById("root")).render(<StrictMode><InstitutionApp /></StrictMode>);
