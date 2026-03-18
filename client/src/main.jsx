import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN || "your-tenant.us.auth0.com"}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || "your-client-id"}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE || "your-api-audience",
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
