import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; 
import * as Sentry from "@sentry/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
Sentry.init({
  dsn: "https://1fe235c8b3b0c3568fb3c6d98642882a@o4511658346676224.ingest.de.sentry.io/4511658363387984",
  integrations: [],
  tracesSampleRate: 1.0,
});


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* ✅ THIS IS IMPORTANT */}
        <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
          <App />
        </Sentry.ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);