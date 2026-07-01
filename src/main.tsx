import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; 
import * as Sentry from "@sentry/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
Sentry.init({
  dsn: "YOUR_SENTRY_DSN_HERE",
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