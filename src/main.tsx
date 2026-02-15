import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

if (typeof window !== "undefined" && API_BASE_URL) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const rewriteUrl = (url: string) =>
      url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/i, API_BASE_URL);

    if (typeof input === "string") {
      return originalFetch(rewriteUrl(input), init);
    }

    if (input instanceof URL) {
      return originalFetch(new URL(rewriteUrl(input.toString())), init);
    }

    if (input instanceof Request) {
      const rewrittenRequest = new Request(rewriteUrl(input.url), input);
      return originalFetch(rewrittenRequest, init);
    }

    return originalFetch(input, init);
  };
}

if (import.meta.env.PROD && !API_BASE_URL) {
  console.warn("VITE_API_BASE_URL is not set. API requests may fail in production.");
}

createRoot(document.getElementById("root")!).render(<App />);
